import type { SupabaseClient, User } from "@supabase/supabase-js";

export function officerInviteCodeMatches(input: string, configured: string): boolean {
  return input.trim().toLowerCase() === configured.trim().toLowerCase();
}

/** Lookup auth user by email (small org; paginated scan). */
export async function findAuthUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;

  for (let i = 0; i < 10; i++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.trim().toLowerCase() === normalized);
    if (match) return match;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
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
