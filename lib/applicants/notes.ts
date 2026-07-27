/** Client + shared types for the per-applicant coffee-chat notes folder. */

export type ApplicantNoteRow = {
  id: string;
  applicant_id: string;
  author_user_id: string | null;
  author_name: string;
  title: string;
  body_html: string;
  created_at: string;
  updated_at: string;
};

/** A note plus whether the current viewer is its author (can edit/delete). */
export type ApplicantNote = ApplicantNoteRow & { isMine: boolean };

export type NotesResponse = { data: ApplicantNote[]; error?: string };

export async function fetchApplicantNotes(
  applicantId: string,
): Promise<{ data?: ApplicantNote[]; error?: string }> {
  const res = await fetch(`/api/applicants/${applicantId}/notes`, {
    credentials: "include",
  });
  const body = (await res.json()) as { data?: ApplicantNote[]; error?: string };
  if (!res.ok) return { error: body.error ?? "Failed to load notes." };
  return { data: body.data ?? [] };
}

export async function createApplicantNote(
  applicantId: string,
  input: { title: string; bodyHtml: string },
): Promise<{ data?: ApplicantNote; error?: string }> {
  const res = await fetch(`/api/applicants/${applicantId}/notes`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await res.json()) as { data?: ApplicantNote; error?: string };
  if (!res.ok || !body.data) return { error: body.error ?? "Failed to create note." };
  return { data: body.data };
}

export async function updateApplicantNote(
  applicantId: string,
  noteId: string,
  input: { title?: string; bodyHtml?: string },
): Promise<{ data?: ApplicantNote; error?: string }> {
  const res = await fetch(`/api/applicants/${applicantId}/notes/${noteId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await res.json()) as { data?: ApplicantNote; error?: string };
  if (!res.ok || !body.data) return { error: body.error ?? "Failed to save note." };
  return { data: body.data };
}

export async function deleteApplicantNote(
  applicantId: string,
  noteId: string,
): Promise<{ error?: string }> {
  const res = await fetch(`/api/applicants/${applicantId}/notes/${noteId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { error: body.error ?? "Failed to delete note." };
  }
  return {};
}
