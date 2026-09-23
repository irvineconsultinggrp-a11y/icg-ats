import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Admin API: mark email confirmed — no inbox step for ATS portal accounts. */
export async function ensureAuthUserEmailConfirmed(
  admin: SupabaseClient,
  userId: string,
): Promise<{ error?: string }> {
  const { error } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
  if (error) return { error: error.message };
  return {};
}

export type LoginPortal = "officer" | "applicant";

export function mayAutoConfirmEmailForPortal(user: User, portal: LoginPortal): boolean {
  const role = user.app_metadata?.role;
  if (portal === "officer") return role === "officer";
  return role !== "officer";
}

export const EMAIL_NOT_CONFIRMED_RE =
  /email not confirmed|not confirmed|confirm your email/i;
