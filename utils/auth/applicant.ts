import { buildAuthCallbackUrl } from "@/lib/auth/auth-callback-url";
import { getSiteOrigin } from "@/lib/auth/site-origin";
import { createClient } from "@/utils/supabase/client";

export const APPLICANT_DASHBOARD = "/applicant/dashboard";
export const APPLICANT_LOGIN = "/applicant/login";

function getCallbackUrl(next: string = APPLICANT_DASHBOARD) {
  const fallback =
    typeof window !== "undefined" ? window.location.origin : undefined;
  return buildAuthCallbackUrl(
    { next, intent: "applicant" },
    getSiteOrigin(fallback),
  );
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

