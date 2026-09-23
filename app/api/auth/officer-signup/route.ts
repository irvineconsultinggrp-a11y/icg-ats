import { NextResponse } from "next/server";
import {
  findAuthUserByEmail,
  officerInviteCodeMatches,
  upsertOfficerProfile,
} from "@/lib/auth/officer-signup";
import { createAdminClient } from "@/utils/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Officer self-signup, gated by OFFICER_SIGNUP_CODE. Account is created confirmed
 * so they can sign in immediately (no confirmation email).
 */
export async function POST(request: Request) {
  const configuredCode = process.env.OFFICER_SIGNUP_CODE?.trim();
  if (!configuredCode) {
    return NextResponse.json(
      {
        error:
          "Officer signup is not enabled on the server. An admin must set OFFICER_SIGNUP_CODE in Vercel (Production) and redeploy.",
      },
      { status: 503 },
    );
  }

  let body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    code?: string;
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
  const code = (body.code ?? "").trim();

  if (!officerInviteCodeMatches(code, configuredCode)) {
    return NextResponse.json(
      { error: "Invalid invite code. Check with your team lead (codes are not case-sensitive)." },
      { status: 403 },
    );
  }
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First and last name are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const fullName = `${firstName} ${lastName}`.trim();

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error("[officer-signup admin]", e);
    return NextResponse.json(
      {
        error:
          "Server configuration error. Set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL on Vercel, then redeploy.",
      },
      { status: 500 },
    );
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, first_name: firstName, last_name: lastName },
    app_metadata: { role: "officer" },
  });

  let userId = created.user?.id;

  if (createError) {
    const alreadyExists = /already.*registered|already been registered|exists/i.test(
      createError.message,
    );
    if (!alreadyExists) {
      console.error("[officer-signup createUser]", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    let existing;
    try {
      existing = await findAuthUserByEmail(admin, email);
    } catch (listErr) {
      console.error("[officer-signup listUsers]", listErr);
      return NextResponse.json({ error: "Could not look up existing account." }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json(
        { error: "An account with this email may already exist. Try signing in at Officer Login." },
        { status: 409 },
      );
    }

    if (existing.app_metadata?.role === "officer") {
      return NextResponse.json(
        {
          error:
            "This email already has an officer account. Sign in at Officer Login, or use Forgot password.",
        },
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
      app_metadata: { ...existing.app_metadata, role: "officer" },
    });

    if (updateError) {
      console.error("[officer-signup upgradeUser]", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    userId = existing.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "Account was not created." }, { status: 500 });
  }

  const profile = await upsertOfficerProfile(admin, {
    authUserId: userId,
    name: fullName,
    email,
  });
  if (profile.error) {
    console.error("[officer-signup officers row]", profile.error);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
