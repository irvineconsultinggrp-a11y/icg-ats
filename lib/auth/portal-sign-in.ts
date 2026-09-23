import type { SupabaseClient } from "@supabase/supabase-js";
import { EMAIL_NOT_CONFIRMED_RE, type LoginPortal } from "@/lib/auth/ensure-email-confirmed";

export async function signInWithPasswordNoEmailConfirm(
  supabase: SupabaseClient,
  email: string,
  password: string,
  portal: LoginPortal,
) {
  let result = await supabase.auth.signInWithPassword({ email, password });

  if (result.error && EMAIL_NOT_CONFIRMED_RE.test(result.error.message)) {
    await fetch("/api/auth/confirm-login-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, portal }),
    });
    result = await supabase.auth.signInWithPassword({ email, password });
  }

  return result;
}
