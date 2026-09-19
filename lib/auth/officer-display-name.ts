import { createClient } from "@/utils/supabase/client";

/** Best-effort display name for the signed-in officer (client-only). */
export async function resolveOfficerDisplayName(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Officer";

  const full = user.user_metadata?.full_name;
  if (typeof full === "string" && full.trim()) return full.trim();

  const email = user.email?.trim();
  if (email) return email.split("@")[0] ?? "Officer";

  return "Officer";
}
