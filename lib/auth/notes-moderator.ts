import type { User } from "@supabase/supabase-js";

/** Officers who may delete any applicant note (others can only delete their own). */
export function isNotesModerator(user: User | null | undefined): boolean {
  const email = user?.email?.trim().toLowerCase();
  if (!email) return false;

  const raw = process.env.OFFICER_NOTES_MODERATOR_EMAILS ?? "";
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email);
}
