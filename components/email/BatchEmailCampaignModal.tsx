"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EmailCampaignId, EmailCampaignScope, EmailRecipient } from "@/lib/email/types";
import {
  formatSendLabel,
  recipientWasEmailedForAssignment,
  type ScheduleEmailSendRecord,
} from "@/lib/email/schedule-email-sends";
import {
  INTERVIEW_ROOMS,
  interviewRoomDisplayName,
  interviewRoomEmailLabel,
  type InterviewRoom,
} from "@/lib/group-interview/sessions";

type PreviewResponse = {
  campaignLabel: string;
  recipients: EmailRecipient[];
  recipientCount: number;
  sampleSubject: string;
  sampleHtml: string;
  error?: string;
};

export type SlotOption = { id: string; label: string };

export type BatchEmailCampaignModalProps = {
  open: boolean;
  onClose: () => void;
  campaign: EmailCampaignId;
  scheduleDay?: string;
  /** When set, default scope is this time block. */
  defaultSlotId?: string | null;
  defaultRoom?: InterviewRoom | null;
  /** Friendly labels for time blocks (hides raw slot id when provided). */
  slotOptions?: SlotOption[];
  initialScope?: EmailCampaignScope;
  emailSends?: ScheduleEmailSendRecord[];
  /** Reload send log + schedule after a successful batch. */
  onSent?: () => void;
};

function EmailSentBadge({ title, className }: { title?: string; className?: string }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-800 cursor-help ${className ?? ""}`}
    >
      Sent
    </span>
  );
}

export function BatchEmailCampaignModal({
  open,
  onClose,
  campaign,
  scheduleDay,
  defaultSlotId,
  defaultRoom,
  slotOptions,
  initialScope,
  emailSends = [],
  onSent,
}: BatchEmailCampaignModalProps) {
  const isBbq = campaign === "bbq";
  const [scope, setScope] = useState<EmailCampaignScope>(
    isBbq ? "all-assigned" : (initialScope ?? (defaultSlotId ? "time-block" : "all-assigned")),
  );
  const [slotId, setSlotId] = useState(defaultSlotId ?? "");
  const [room, setRoom] = useState<InterviewRoom | "">(defaultRoom ?? "");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  /** Immediate Sent badges this modal session (DB log loads on refresh). */
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setScope(
      isBbq ? "all-assigned" : (initialScope ?? (defaultSlotId ? "time-block" : "all-assigned")),
    );
    setSlotId(defaultSlotId ?? "");
    setRoom(defaultRoom ?? "");
    setPreview(null);
    setConfirmed(false);
    setError("");
    setSuccess("");
    setSelectedIds(new Set());
    setSentIds(new Set());
  }, [open, campaign, defaultSlotId, defaultRoom, initialScope, isBbq]);

  const payload = useMemo(
    () => ({
      campaign,
      scope: isBbq ? ("all-assigned" as const) : scope,
      scheduleDay,
      slotId: scope === "all-assigned" || isBbq ? undefined : slotId || undefined,
      room: scope === "room" ? room || undefined : undefined,
    }),
    [campaign, scope, scheduleDay, slotId, room, isBbq],
  );

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setConfirmed(false);
    try {
      const res = await fetch("/api/email/campaign/preview", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as PreviewResponse & { error?: string };
      if (!res.ok) {
        setPreview(null);
        setError(body.error ?? "Could not load preview.");
        return;
      }
      setPreview(body);
      setSelectedIds(new Set(body.recipients.map((r) => r.applicantId)));
    } catch {
      setError("Network error loading preview.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [payload]);

  useEffect(() => {
    if (open && !preview && !loading) void loadPreview();
  }, [open, loadPreview, preview, loading]);

  function toggleRecipient(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setConfirmed(false);
  }

  async function handleSend() {
    if (!confirmed || selectedIds.size === 0) return;
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/email/campaign/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          confirmed: true,
          recipientIds: [...selectedIds],
        }),
      });
      const body = (await res.json()) as {
        error?: string;
        sent?: number;
        dryRun?: boolean;
        results?: Array<{ applicantId: string; email: string; ok: boolean; error?: string }>;
      };
      const okIds =
        body.results?.filter((r) => r.ok).map((r) => r.applicantId) ?? [];
      if (!res.ok) {
        const detail = body.results?.find((r) => !r.ok && r.error)?.error;
        setError(
          detail ? `${body.error ?? "Send failed."} ${detail}` : (body.error ?? "Send failed."),
        );
        if (okIds.length > 0) {
          setSentIds((prev) => new Set([...prev, ...okIds]));
          setSuccess(
            `Sent ${okIds.length} email${okIds.length === 1 ? "" : "s"}. Fix errors and retry for the rest.`,
          );
          onSent?.();
        }
        return;
      }
      if (okIds.length > 0) {
        setSentIds((prev) => new Set([...prev, ...okIds]));
      }
      setSuccess(`Sent ${body.sent ?? okIds.length} email${body.sent === 1 ? "" : "s"}.`);
      setConfirmed(false);
      onSent?.();
    } catch {
      setError("Network error while sending.");
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  const recipients = preview?.recipients ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-email-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl border border-[#e4e4e7]">
        <div className="flex items-start justify-between gap-4 border-b border-[#e4e4e7] px-6 py-4">
          <div>
            <h2 id="batch-email-title" className="text-lg font-semibold text-[#061c2a]">
              Send email
            </h2>
            <p className="text-sm text-[#6b7280] mt-0.5">
              {preview?.campaignLabel ?? "Schedule notification"} · review recipients, then confirm
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#6b7280] hover:text-[#111827]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {!isBbq && (
            <div className="flex flex-wrap gap-3 items-end">
              <label className="flex flex-col gap-1 text-xs font-medium text-[#374151]">
                Who receives this?
                <select
                  value={scope}
                  onChange={(e) => {
                    setScope(e.target.value as EmailCampaignScope);
                    setPreview(null);
                    setConfirmed(false);
                  }}
                  className="h-9 rounded-lg border border-[#d4d4d8] px-3 text-sm"
                >
                  <option value="time-block">This time block (all rooms)</option>
                  <option value="room">One room in a time block</option>
                  <option value="all-assigned">Everyone scheduled this interview day</option>
                </select>
              </label>
              {scope !== "all-assigned" && (
                <label className="flex flex-col gap-1 text-xs font-medium text-[#374151] min-w-[220px]">
                  Time block
                  {slotOptions?.length ? (
                    <select
                      value={slotId}
                      onChange={(e) => {
                        setSlotId(e.target.value);
                        setPreview(null);
                      }}
                      className="h-9 rounded-lg border border-[#d4d4d8] px-3 text-sm"
                    >
                      <option value="">Select time block</option>
                      {slotOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={slotId}
                      onChange={(e) => {
                        setSlotId(e.target.value);
                        setPreview(null);
                      }}
                      placeholder="Saturday, October 3rd::9:00AM - 10:00AM"
                      className="h-9 rounded-lg border border-[#d4d4d8] px-3 text-sm font-mono text-xs"
                    />
                  )}
                </label>
              )}
              {scope === "room" && (
                <label className="flex flex-col gap-1 text-xs font-medium text-[#374151]">
                  Room
                  <select
                    value={room}
                    onChange={(e) => {
                      setRoom(e.target.value as InterviewRoom);
                      setPreview(null);
                    }}
                    className="h-9 rounded-lg border border-[#d4d4d8] px-3 text-sm"
                  >
                    <option value="">Select room</option>
                    {INTERVIEW_ROOMS.map((r) => (
                      <option key={r} value={r}>
                        {interviewRoomDisplayName(r)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                type="button"
                onClick={() => void loadPreview()}
                disabled={loading}
                className="h-9 px-4 rounded-lg border border-[#061c2a] text-sm font-medium text-[#061c2a] hover:bg-[#061c2a]/5 disabled:opacity-50"
              >
                {loading ? "Loading…" : "Refresh list"}
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
              {success}
            </div>
          )}

          {preview && (
            <>
              <div className="rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-4 py-3">
                <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-1">
                  Sample subject (first recipient)
                </p>
                <p className="text-sm font-medium text-[#111827]">{preview.sampleSubject}</p>
                <div
                  className="mt-3 text-sm text-[#374151] prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: preview.sampleHtml }}
                />
                <p className="text-[11px] text-[#a1a1aa] mt-2">
                  Template copy lives in{" "}
                  <code className="text-[10px]">lib/email/campaign-templates.ts</code> — update when
                  your final wording is ready.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#111827] mb-2">
                  Recipients ({selectedIds.size} of {recipients.length} selected)
                </p>
                {recipients.length === 0 ? (
                  <p className="text-sm text-[#6b7280]">No one is assigned for this selection yet.</p>
                ) : (
                  <ul className="max-h-52 overflow-y-auto rounded-lg border border-[#e4e4e7] divide-y divide-[#f4f4f5]">
                    {recipients.map((r) => {
                      const priorSend = recipientWasEmailedForAssignment(r, emailSends);
                      const sentThisSession = sentIds.has(r.applicantId);
                      const showSent = priorSend || sentThisSession;
                      return (
                      <li key={r.applicantId} className="flex items-center gap-3 px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.applicantId)}
                          onChange={() => toggleRecipient(r.applicantId)}
                          className="rounded border-[#d4d4d8]"
                        />
                        <span className="font-medium text-[#111827] min-w-[140px]">
                          {r.firstName} {r.lastName}
                        </span>
                        <span className="text-[#6b7280] truncate flex-1">{r.email}</span>
                        {showSent ? (
                          <EmailSentBadge
                            className="flex-shrink-0"
                            title={
                              priorSend
                                ? formatSendLabel(priorSend)
                                : "Emailed just now in this session"
                            }
                          />
                        ) : r.room ? (
                          <span className="text-xs text-[#6b7280] flex-shrink-0">
                            {r.timeBlock} · {interviewRoomEmailLabel(r.room)}
                          </span>
                        ) : null}
                      </li>
                    );
                    })}
                  </ul>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={selectedIds.size === 0}
                  className="mt-1 rounded border-[#d4d4d8]"
                />
                <span className="text-sm text-[#374151]">
                  I reviewed the recipient list and sample email. Send to the{" "}
                  <strong>{selectedIds.size}</strong> selected applicant
                  {selectedIds.size === 1 ? "" : "s"}.
                </span>
              </label>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e4e4e7] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-[#e4e4e7] text-sm font-medium text-[#374151] hover:bg-[#f4f4f5]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmed || selectedIds.size === 0 || sending || loading}
            onClick={() => void handleSend()}
            className="h-10 px-5 rounded-lg bg-[#061c2a] text-white text-sm font-medium hover:bg-[#0d2f47] disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send email"}
          </button>
        </div>
      </div>
    </div>
  );
}
