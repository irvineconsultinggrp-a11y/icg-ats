"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import {
  createApplicantNote,
  deleteApplicantNote,
  fetchApplicantNotes,
  updateApplicantNote,
  type ApplicantNote,
} from "@/lib/applicants/notes";
import { resolveOfficerDisplayName } from "@/lib/auth/officer-display-name";
import { buildCoffeeChatNoteDraft } from "@/lib/notes/coffee-chat-preset";
import type { NoteSignal } from "@/lib/applicants/note-signal";
import { NoteSignalDot, NoteSignalPicker } from "@/components/notes/NoteSignalPicker";

function initialsOf(name: string): string {
  return name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function textSnippet(html: string, max = 120): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// ─── Folder ─────────────────────────────────────────────────────────────────

export type NotesFolderNewNotePreset = "coffee-chat";

export function NotesFolder({
  applicantId,
  applicantName,
  hint,
  newNotePreset,
  onRatingChange,
}: {
  applicantId: string;
  applicantName: string;
  /** Replaces the default helper line when set (e.g. stage-specific guidance). */
  hint?: string;
  /** Prefills title and body when an officer creates a new note. */
  newNotePreset?: NotesFolderNewNotePreset;
  /** Fired when a note rating is saved or removed (refresh list sort). */
  onRatingChange?: () => void;
}) {
  const [notes, setNotes] = useState<ApplicantNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ApplicantNote | "new" | null>(null);
  const [newDraft, setNewDraft] = useState<{ title: string; bodyHtml: string } | null>(null);
  const [startingNote, setStartingNote] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewerCanModerateNotes, setViewerCanModerateNotes] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetchApplicantNotes(applicantId);
    if (res.error) setError(res.error);
    setNotes(res.data ?? []);
    setViewerCanModerateNotes(res.viewerCanModerateNotes ?? false);
    setLoading(false);
  }, [applicantId]);

  useEffect(() => {
    void load();
  }, [load]);

  function upsertLocal(note: ApplicantNote) {
    setNotes((prev) => {
      const withPerms: ApplicantNote = {
        ...note,
        canDelete: note.canDelete ?? note.isMine ?? viewerCanModerateNotes,
      };
      const idx = prev.findIndex((n) => n.id === note.id);
      const next =
        idx >= 0 ? prev.map((n) => (n.id === note.id ? withPerms : n)) : [withPerms, ...prev];
      return [...next].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    });
  }

  async function handleDelete(note: ApplicantNote) {
    setConfirmDeleteId(null);
    setDeletingId(note.id);
    setError("");
    const prev = notes;
    setNotes((n) => n.filter((x) => x.id !== note.id));
    if (editing !== null && editing !== "new" && editing.id === note.id) {
      setEditing(null);
      setNewDraft(null);
    }
    const res = await deleteApplicantNote(applicantId, note.id);
    setDeletingId(null);
    if (res.error) {
      setNotes(prev);
      setError(res.error);
    } else {
      onRatingChange?.();
    }
  }

  async function startNewNote() {
    if (startingNote) return;
    setStartingNote(true);
    setError("");
    try {
      if (newNotePreset === "coffee-chat") {
        const name = await resolveOfficerDisplayName();
        setNewDraft(buildCoffeeChatNoteDraft(name));
      } else {
        setNewDraft(null);
      }
      setEditing("new");
    } finally {
      setStartingNote(false);
    }
  }

  function closeEditor() {
    setEditing(null);
    setNewDraft(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#111827]">Notes</p>
          {!loading && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#f4f4f5] text-xs font-medium text-[#6b7280]">
              {notes.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void startNewNote()}
          disabled={startingNote}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-[#061c2a] text-white text-xs font-medium hover:bg-[#0d2f47] active:scale-95 transition-all disabled:opacity-60"
        >
          {startingNote ? "Opening…" : "+ New note"}
        </button>
      </div>

      <p className="text-xs text-[#6b7280]">
        {hint ??
          (viewerCanModerateNotes
            ? "You can remove any note on this applicant. You can only edit notes you wrote."
            : "Each member keeps their own note on this applicant. You can read everyone's; only you can edit or delete yours.")}
      </p>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-[#f4f4f5] animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <button
          type="button"
          onClick={() => void startNewNote()}
          disabled={startingNote}
          className="rounded-lg border border-dashed border-[#d4d4d8] px-4 py-6 text-center text-sm text-[#6b7280] hover:border-[#061c2a] hover:text-[#061c2a] transition-colors disabled:opacity-60"
        >
          {startingNote ? "Opening…" : "No notes yet — add the first one."}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              confirmDelete={confirmDeleteId === note.id}
              deleting={deletingId === note.id}
              onOpen={() => setEditing(note)}
              onRequestDelete={() => setConfirmDeleteId(note.id)}
              onCancelDelete={() => setConfirmDeleteId(null)}
              onConfirmDelete={() => void handleDelete(note)}
            />
          ))}
        </div>
      )}

      {editing && (
        <NoteEditorModal
          key={
            editing === "new"
              ? `new-${applicantId}`
              : `edit-${editing.id}`
          }
          applicantId={applicantId}
          applicantName={applicantName}
          note={editing === "new" ? null : editing}
          draft={editing === "new" ? newDraft : null}
          onClose={closeEditor}
          onSaved={(n) => {
            upsertLocal(n);
            onRatingChange?.();
          }}
          onDelete={
            editing !== "new" && editing.canDelete
              ? () => void handleDelete(editing)
              : undefined
          }
        />
      )}
    </div>
  );
}

// ─── Note card ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  confirmDelete,
  deleting,
  onOpen,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  note: ApplicantNote;
  confirmDelete: boolean;
  deleting: boolean;
  onOpen: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const snippet = textSnippet(note.body_html);
  return (
    <div className="rounded-lg border border-[#e4e4e7] bg-white p-3 hover:border-[#061c2a]/40 hover:shadow-sm transition-all">
      <div className="flex items-start gap-2">
        <button type="button" onClick={onOpen} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1 pr-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#061c2a] text-white text-[10px] font-bold flex-shrink-0">
              {initialsOf(note.author_name)}
            </span>
            <span className="text-xs font-medium text-[#374151] truncate">{note.author_name}</span>
            {note.signal && <NoteSignalDot signal={note.signal} />}
            {note.isMine && (
              <span className="text-[10px] font-semibold text-[#061c2a] bg-[#061c2a]/10 rounded px-1.5 py-0.5">You</span>
            )}
            <span className="ml-auto text-[11px] text-[#a1a1aa] flex-shrink-0">{relativeTime(note.updated_at)}</span>
          </div>
          {note.title && <p className="text-sm font-semibold text-[#111827] truncate">{note.title}</p>}
          <p className="text-xs text-[#6b7280] line-clamp-2">{snippet || "No content"}</p>
        </button>
        {note.canDelete && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {confirmDelete ? (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-[#6b7280] max-w-[88px] text-right leading-tight">
                  {note.isMine ? "Delete this note?" : "Remove this note?"}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    disabled={deleting}
                    className="h-7 px-2 rounded-md border border-[#e4e4e7] text-[11px] font-medium text-[#374151] hover:bg-[#f4f4f5] disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirmDelete}
                    disabled={deleting}
                    className="h-7 px-2 rounded-md bg-red-600 text-white text-[11px] font-medium hover:bg-red-700 disabled:opacity-60"
                  >
                    {deleting ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onRequestDelete}
                disabled={deleting}
                title="Delete your note"
                className="h-7 px-2 rounded-md text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Full-screen editor ─────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";

function NoteEditorModal({
  applicantId,
  applicantName,
  note,
  draft,
  onClose,
  onSaved,
  onDelete,
}: {
  applicantId: string;
  applicantName: string;
  note: ApplicantNote | null;
  draft?: { title: string; bodyHtml: string } | null;
  onClose: () => void;
  onSaved: (note: ApplicantNote) => void;
  onDelete?: () => void;
}) {
  const readOnly = note !== null && !note.isMine;
  const [title, setTitle] = useState(note?.title ?? draft?.title ?? "");
  const [bodyHtml, setBodyHtml] = useState(note?.body_html ?? draft?.bodyHtml ?? "");
  const [signal, setSignal] = useState<NoteSignal | null>(note?.signal ?? null);
  const [noteId, setNoteId] = useState<string | null>(note?.id ?? null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");
  const [confirmDeleteInModal, setConfirmDeleteInModal] = useState(false);

  const savingRef = useRef(false);
  const skipUnmountFlushRef = useRef(false);
  const packKey = (t: string, b: string, sig: NoteSignal | null) => `${t}\x00${b}\x00${sig ?? ""}`;
  const lastSavedRef = useRef(packKey(note?.title ?? "", note?.body_html ?? "", note?.signal ?? null));

  const currentKey = packKey(title, bodyHtml, signal);
  const debouncedKey = useDebouncedValue(currentKey, 900);

  const persist = useCallback(async () => {
    if (readOnly || savingRef.current) return;
    const key = packKey(title, bodyHtml, signal);
    if (key === lastSavedRef.current) return;
    const isEmpty = !title.trim() && bodyHtml.replace(/<[^>]*>/g, "").trim().length === 0;
    if (isEmpty) return;

    savingRef.current = true;
    setStatus("saving");
    setSaveError("");

    const res = noteId
      ? await updateApplicantNote(applicantId, noteId, { title, bodyHtml, signal })
      : await createApplicantNote(applicantId, { title, bodyHtml, signal });

    savingRef.current = false;
    if (res.error || !res.data) {
      setStatus("error");
      setSaveError(res.error ?? "Failed to save note.");
      return;
    }
    lastSavedRef.current = key;
    if (!noteId) setNoteId(res.data.id);
    setStatus("saved");
    onSaved(res.data);
  }, [applicantId, noteId, title, bodyHtml, signal, readOnly, onSaved]);

  // Autosave when the debounced content settles.
  useEffect(() => {
    if (debouncedKey !== lastSavedRef.current) void persist();
  }, [debouncedKey, persist]);

  // Flush a final save on unmount if the user navigates away without Done (not after Done).
  useEffect(() => {
    return () => {
      if (!readOnly && !skipUnmountFlushRef.current) void persist();
    };
    // persist is stable enough for a best-effort flush; intentional single-run cleanup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDone() {
    skipUnmountFlushRef.current = true;
    await persist();
    onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const statusLabel = useMemo(() => {
    if (readOnly) return "Read-only";
    switch (status) {
      case "saving": return "Saving…";
      case "saved": return "Saved";
      case "error": return "Save failed";
      default: return noteId ? "Saved" : "Draft";
    }
  }, [status, readOnly, noteId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col" role="dialog" aria-modal="true">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 bg-white border-b border-[#e4e4e7] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm text-[#6b7280] truncate">
            Notes · <span className="font-medium text-[#111827]">{applicantName}</span>
          </span>
          {note && !note.isMine && (
            <span className="text-xs text-[#6b7280]">by {note.author_name}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!readOnly && onDelete && noteId && (
            confirmDeleteInModal ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6b7280]">Delete this note?</span>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteInModal(false)}
                  className="h-9 px-3 rounded-lg border border-[#e4e4e7] text-sm text-[#374151] hover:bg-[#f4f4f5]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    skipUnmountFlushRef.current = true;
                    onDelete();
                  }}
                  className="h-9 px-3 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteInModal(true)}
                className="h-9 px-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete note
              </button>
            )
          )}
          <span className={`text-xs font-medium ${status === "error" ? "text-red-600" : "text-[#6b7280]"}`}>
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={() => {
              if (readOnly) onClose();
              else void handleDone();
            }}
            className="h-9 px-4 rounded-lg bg-[#061c2a] text-white text-sm font-medium hover:bg-[#0d2f47] transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="flex-1 overflow-y-auto py-8 px-4">
        <div className="mx-auto w-full max-w-[760px] bg-white rounded-xl shadow-xl border border-[#e4e4e7] flex flex-col min-h-[70vh] p-8 sm:p-12">
          {saveError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
              {saveError}
            </div>
          )}
          {readOnly ? (
            <>
              {note?.title && <h1 className="text-2xl font-bold text-[#061c2a] mb-4">{note.title}</h1>}
              {note?.signal && (
                <div className="mb-4">
                  <NoteSignalPicker value={note.signal} onChange={() => {}} disabled compact />
                </div>
              )}
              <div
                className="rte-content flex-1 text-[15px] leading-relaxed text-[#111827]"
                dangerouslySetInnerHTML={{ __html: note?.body_html ?? "" }}
              />
            </>
          ) : (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled note"
                className="text-2xl font-bold text-[#061c2a] placeholder-[#d4d4d8] outline-none mb-4 w-full"
              />
              <div className="mb-5 pb-5 border-b border-[#f4f4f5]">
                <NoteSignalPicker
                  value={signal}
                  onChange={(s) => {
                    setSignal(s);
                  }}
                />
              </div>
              <div className="flex-1 min-h-[50vh]">
                <RichTextEditor value={bodyHtml} onChange={setBodyHtml} autoFocus placeholder="Capture impressions, strengths, follow-ups…" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
