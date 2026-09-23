import type { NoteSignal, NoteSignalCounts } from "@/lib/applicants/note-signal";

/** Client + shared types for the per-applicant coffee-chat notes folder. */

export type ApplicantNoteRow = {
  id: string;
  applicant_id: string;
  author_user_id: string | null;
  author_name: string;
  title: string;
  body_html: string;
  signal: NoteSignal | null;
  created_at: string;
  updated_at: string;
};

/** A note plus viewer permissions (edit own only; delete own or any if moderator). */
export type ApplicantNote = ApplicantNoteRow & {
  isMine: boolean;
  canDelete: boolean;
};

export type NotesResponse = {
  data: ApplicantNote[];
  viewerCanModerateNotes?: boolean;
  error?: string;
};

export async function fetchApplicantNotes(
  applicantId: string,
): Promise<{ data?: ApplicantNote[]; viewerCanModerateNotes?: boolean; error?: string }> {
  const res = await fetch(`/api/applicants/${applicantId}/notes`, {
    credentials: "include",
  });
  const body = (await res.json()) as NotesResponse;
  if (!res.ok) return { error: body.error ?? "Failed to load notes." };
  return {
    data: body.data ?? [],
    viewerCanModerateNotes: body.viewerCanModerateNotes,
  };
}

export async function fetchApplicantNoteSignals(): Promise<{
  data?: Record<string, NoteSignalCounts>;
  error?: string;
}> {
  const res = await fetch("/api/applicants/note-signals", { credentials: "include" });
  const body = (await res.json()) as {
    data?: Record<string, NoteSignalCounts>;
    error?: string;
  };
  if (!res.ok) return { error: body.error ?? "Failed to load note ratings." };
  return { data: body.data ?? {} };
}

export async function createApplicantNote(
  applicantId: string,
  input: { title: string; bodyHtml: string; signal?: NoteSignal | null },
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
  input: { title?: string; bodyHtml?: string; signal?: NoteSignal | null },
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
