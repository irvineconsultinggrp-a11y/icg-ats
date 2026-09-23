import type { SupabaseClient } from "@supabase/supabase-js";

export { ensureAuthUserEmailConfirmed } from "@/lib/auth/ensure-email-confirmed";
export { findAuthUserByEmail } from "@/lib/auth/find-auth-user-by-email";

export function officerInviteCodeMatches(input: string, configured: string): boolean {
  return input.trim().toLowerCase() === configured.trim().toLowerCase();
}

export async function upsertOfficerProfile(
  admin: SupabaseClient,
  input: { authUserId: string; name: string; email: string },
): Promise<{ error?: string }> {
  const { data: existing } = await admin
    .from("officers")
    .select("id")
    .eq("auth_user_id", input.authUserId)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await admin
      .from("officers")
      .update({ name: input.name, email: input.email })
      .eq("id", existing.id);
    if (error) return { error: error.message };
    return {};
  }

  const { data: byEmail } = await admin
    .from("officers")
    .select("id")
    .eq("email", input.email)
    .maybeSingle();

  if (byEmail?.id) {
    const { error } = await admin
      .from("officers")
      .update({ name: input.name, auth_user_id: input.authUserId })
      .eq("id", byEmail.id);
    if (error) return { error: error.message };
    return {};
  }

  const { error } = await admin.from("officers").insert({
    name: input.name,
    email: input.email,
    auth_user_id: input.authUserId,
  });
  if (error) return { error: error.message };
  return {};
}
