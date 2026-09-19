import { NextResponse } from "next/server";
import { requireOfficer } from "@/lib/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { sanitizeNoteHtml, noteTextLength } from "@/lib/applicants/sanitize-html";
import { parseNoteSignal } from "@/lib/applicants/note-signal";
import type { ApplicantNoteRow } from "@/lib/applicants/notes";

const NOTE_COLUMNS =
  "id, applicant_id, author_user_id, author_name, title, body_html, signal, created_at, updated_at";

type RouteContext = { params: Promise<{ id: string }> };

/** Resolve a human-friendly author name for the logged-in officer. */
async function resolveAuthorName(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  email: string | undefined,
  fullName: string | undefined,
): Promise<string> {
  const { data } = await admin
    .from("officers")
    .select("name")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (data?.name?.trim()) return data.name.trim();
  if (fullName?.trim()) return fullName.trim();
  if (email?.trim()) return email.split("@")[0];
  return "Officer";
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("applicant_notes")
    .select(NOTE_COLUMNS)
    .eq("applicant_id", id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[applicants/[id]/notes GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const notes = (data ?? []).map((n: ApplicantNoteRow) => ({
    ...n,
    isMine: n.author_user_id === gate.user.id,
  }));
  return NextResponse.json({ data: notes });
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  let body: { title?: string; bodyHtml?: string; signal?: string | null };
  try {
    body = (await request.json()) as { title?: string; bodyHtml?: string; signal?: string | null };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = (body.title ?? "").trim().slice(0, 200);
  const bodyHtml = sanitizeNoteHtml(body.bodyHtml ?? "");
  const signal =
    body.signal === null || body.signal === undefined
      ? null
      : parseNoteSignal(body.signal);
  if (body.signal !== undefined && body.signal !== null && signal === null) {
    return NextResponse.json({ error: "Invalid signal." }, { status: 400 });
  }

  if (!title && noteTextLength(bodyHtml) === 0) {
    return NextResponse.json({ error: "Note is empty." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Guard against a note on a non-existent applicant.
  const { data: applicant } = await admin
    .from("applicants")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!applicant) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  const authorName = await resolveAuthorName(
    admin,
    gate.user.id,
    gate.user.email,
    gate.user.user_metadata?.full_name as string | undefined,
  );

  const { data, error } = await admin
    .from("applicant_notes")
    .insert({
      applicant_id: id,
      author_user_id: gate.user.id,
      author_name: authorName,
      title,
      body_html: bodyHtml,
      signal,
    })
    .select(NOTE_COLUMNS)
    .maybeSingle();

  if (error || !data) {
    console.error("[applicants/[id]/notes POST]", error);
    return NextResponse.json({ error: error?.message ?? "Failed to create note." }, { status: 500 });
  }

  return NextResponse.json({ data: { ...data, isMine: true } }, { status: 201 });
}
