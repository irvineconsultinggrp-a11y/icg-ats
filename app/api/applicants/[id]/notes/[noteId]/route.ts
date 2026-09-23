import { NextResponse } from "next/server";
import { isNotesModerator } from "@/lib/auth/notes-moderator";
import { requireOfficer } from "@/lib/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { parseNoteSignal } from "@/lib/applicants/note-signal";
import { sanitizeNoteHtml, noteTextLength } from "@/lib/applicants/sanitize-html";

const NOTE_COLUMNS =
  "id, applicant_id, author_user_id, author_name, title, body_html, signal, created_at, updated_at";

type RouteContext = { params: Promise<{ id: string; noteId: string }> };

function isNoteAuthor(authorUserId: string | null, userId: string): boolean {
  if (!authorUserId) return false;
  return authorUserId.toLowerCase() === userId.toLowerCase();
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id, noteId } = await context.params;
  if (!id || !noteId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  let body: { title?: string; bodyHtml?: string; signal?: string | null };
  try {
    body = (await request.json()) as { title?: string; bodyHtml?: string; signal?: string | null };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("applicant_notes")
    .select("id, author_user_id, applicant_id")
    .eq("id", noteId)
    .eq("applicant_id", id)
    .maybeSingle();

  if (!existing) return NextResponse.json({ error: "Note not found" }, { status: 404 });
  if (!isNoteAuthor(existing.author_user_id, gate.user.id)) {
    return NextResponse.json({ error: "You can only edit your own notes." }, { status: 403 });
  }

  const patch: {
    title?: string;
    body_html?: string;
    signal?: string | null;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };
  if (typeof body.title === "string") patch.title = body.title.trim().slice(0, 200);
  if (typeof body.bodyHtml === "string") patch.body_html = sanitizeNoteHtml(body.bodyHtml);
  if (body.signal !== undefined) {
    if (body.signal === null) patch.signal = null;
    else {
      const parsed = parseNoteSignal(body.signal);
      if (!parsed) return NextResponse.json({ error: "Invalid signal." }, { status: 400 });
      patch.signal = parsed;
    }
  }

  const nextTitle = patch.title ?? "";
  const nextBody = patch.body_html ?? "";
  if (patch.title !== undefined && patch.body_html !== undefined &&
      !nextTitle && noteTextLength(nextBody) === 0) {
    return NextResponse.json({ error: "Note is empty." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("applicant_notes")
    .update(patch)
    .eq("id", noteId)
    .select(NOTE_COLUMNS)
    .maybeSingle();

  if (error || !data) {
    console.error("[applicants/[id]/notes/[noteId] PATCH]", error);
    return NextResponse.json({ error: error?.message ?? "Failed to save note." }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      ...data,
      isMine: true,
      canDelete: true,
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id, noteId } = await context.params;
  if (!id || !noteId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("applicant_notes")
    .select("id, author_user_id")
    .eq("id", noteId)
    .eq("applicant_id", id)
    .maybeSingle();

  if (!existing) return NextResponse.json({ error: "Note not found" }, { status: 404 });
  const canDelete =
    isNoteAuthor(existing.author_user_id, gate.user.id) || isNotesModerator(gate.user);
  if (!canDelete) {
    return NextResponse.json({ error: "You can only delete your own notes." }, { status: 403 });
  }

  const { error } = await admin.from("applicant_notes").delete().eq("id", noteId);
  if (error) {
    console.error("[applicants/[id]/notes/[noteId] DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
