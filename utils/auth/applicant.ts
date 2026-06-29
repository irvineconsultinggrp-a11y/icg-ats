import { createClient } from "@/utils/supabase/client";

export const APPLICANT_DASHBOARD = "/applicant/dashboard";
export const APPLICANT_LOGIN = "/applicant/login";

function getCallbackUrl(next: string = APPLICANT_DASHBOARD) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

  return `${origin}/auth/callback?${new URLSearchParams({ next, intent: "applicant" })}`;
}

export async function signInWithGoogle() {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getCallbackUrl(),
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

/** Assign app_metadata.role = applicant (requires SUPABASE_SERVICE_ROLE_KEY on server). */
export async function ensureApplicantRole() {
  const res = await fetch("/api/auth/ensure-role", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return false;

  const supabase = createClient();
  await supabase.auth.refreshSession();
  return true;
}

export async function signUpWithPassword(
  email: string,
  password: string,
  meta: { firstName: string; lastName: string },
) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getCallbackUrl(),
      data: {
        role: "applicant",
        first_name: meta.firstName.trim(),
        last_name: meta.lastName.trim(),
      },
    },
  });
}
