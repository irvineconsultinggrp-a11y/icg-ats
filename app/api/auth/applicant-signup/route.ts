import { NextResponse } from "next/server";
import {
  APPLICANT_EMAIL_ERROR,
  isApplicantEmailAllowed,
} from "@/lib/auth/applicant-email";
import { createAdminClient } from "@/utils/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Applicant signup — account is created confirmed (no confirmation email). */
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

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, first_name: firstName, last_name: lastName },
    app_metadata: { role: "applicant" },
  });

  if (error) {
    const alreadyExists = /already.*registered|already been registered|exists/i.test(error.message);
    console.error("[applicant-signup createUser]", error);
    return NextResponse.json(
      { error: alreadyExists ? "An account with this email already exists. Try signing in." : error.message },
      { status: alreadyExists ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
