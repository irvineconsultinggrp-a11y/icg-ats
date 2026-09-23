import { NextResponse } from "next/server";
import {
  ensureAuthUserEmailConfirmed,
  mayAutoConfirmEmailForPortal,
  type LoginPortal,
} from "@/lib/auth/ensure-email-confirmed";
import { findAuthUserByEmail } from "@/lib/auth/find-auth-user-by-email";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * ATS portal accounts are created confirmed via admin API — no confirmation email.
 * If Supabase still blocks login (legacy rows), confirm server-side then retry password sign-in.
 */
export async function POST(request: Request) {
  let body: { email?: string; portal?: LoginPortal };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const portal = body.portal;
  if (!email || (portal !== "officer" && portal !== "applicant")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error("[confirm-login-email admin]", e);
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  let user;
  try {
    user = await findAuthUserByEmail(admin, email);
  } catch (e) {
    console.error("[confirm-login-email lookup]", e);
    return NextResponse.json({ error: "Could not look up account." }, { status: 500 });
  }

  if (!user || !mayAutoConfirmEmailForPortal(user, portal)) {
    return NextResponse.json({ ok: true });
  }

  if (user.email_confirmed_at) {
    return NextResponse.json({ ok: true });
  }

  const result = await ensureAuthUserEmailConfirmed(admin, user.id);
  if (result.error) {
    console.error("[confirm-login-email confirm]", result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
