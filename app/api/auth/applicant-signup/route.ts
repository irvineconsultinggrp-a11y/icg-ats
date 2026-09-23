import { NextResponse } from "next/server";
import {
  APPLICANT_EMAIL_ERROR,
  isApplicantEmailAllowed,
} from "@/lib/auth/applicant-email";
import { ensureAuthUserEmailConfirmed } from "@/lib/auth/ensure-email-confirmed";
import { findAuthUserByEmail } from "@/lib/auth/find-auth-user-by-email";
import { createAdminClient } from "@/utils/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Applicant signup — admin creates user confirmed; no confirmation email. */
export async function POST(request: Request) {
  let body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First and last name are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!isApplicantEmailAllowed(email)) {
    return NextResponse.json({ error: APPLICANT_EMAIL_ERROR }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const fullName = `${firstName} ${lastName}`.trim();

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error("[applicant-signup admin]", e);
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, first_name: firstName, last_name: lastName },
    app_metadata: { role: "applicant" },
  });

  let userId = created.user?.id;

  if (createError) {
    const alreadyExists = /already.*registered|already been registered|exists/i.test(
      createError.message,
    );
    if (!alreadyExists) {
      console.error("[applicant-signup createUser]", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    let existing;
    try {
      existing = await findAuthUserByEmail(admin, email);
    } catch (listErr) {
      console.error("[applicant-signup listUsers]", listErr);
      return NextResponse.json({ error: "Could not look up existing account." }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json(
        { error: "An account with this email may already exist. Try signing in." },
        { status: 409 },
      );
    }

    if (existing.app_metadata?.role === "officer") {
      return NextResponse.json(
        { error: "This email is registered as an officer. Use Officer Login instead." },
        { status: 409 },
      );
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...existing.user_metadata,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
      },
      app_metadata: { ...existing.app_metadata, role: "applicant" },
    });

    if (updateError) {
      console.error("[applicant-signup updateUser]", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    userId = existing.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "Account was not created." }, { status: 500 });
  }

  const confirmed = await ensureAuthUserEmailConfirmed(admin, userId);
  if (confirmed.error) {
    console.error("[applicant-signup ensureConfirmed]", confirmed.error);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
