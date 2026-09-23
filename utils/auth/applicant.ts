import { createClient } from "@/utils/supabase/client";

export const APPLICANT_DASHBOARD = "/applicant/dashboard";
export const APPLICANT_LOGIN = "/applicant/login";

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
