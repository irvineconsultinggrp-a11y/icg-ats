import { NextResponse } from "next/server";
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
      { error: "Officer signup is not enabled. Ask an admin to set an invite code." },
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

  if (code !== configuredCode) {
    return NextResponse.json({ error: "Invalid invite code." }, { status: 403 });
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
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, first_name: firstName, last_name: lastName },
    app_metadata: { role: "officer" },
  });

  if (error) {
    const alreadyExists = /already.*registered|already been registered|exists/i.test(error.message);
    console.error("[officer-signup createUser]", error);
    return NextResponse.json(
      { error: alreadyExists ? "An account with this email already exists. Try signing in." : error.message },
      { status: alreadyExists ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
