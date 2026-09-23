"use client";

import { useCallback, useEffect, useState } from "react";
import type { TransactionalEmailId } from "@/lib/email/transactional-templates";

type PreviewResponse = {
  templateName: string;
  to: string;
  subject: string;
  html: string;
  error?: string;
};

export type SendTransactionalEmailModalProps = {
  open: boolean;
  onClose: () => void;
  applicantId: string;
  templateId: TransactionalEmailId;
  title?: string;
  onSent?: () => void;
};

export function SendTransactionalEmailModal({
  open,
  onClose,
  applicantId,
  templateId,
  title = "Send email",
  onSent,
}: SendTransactionalEmailModalProps) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setConfirmed(false);
    try {
      const res = await fetch(
        `/api/email/transactional/preview?templateId=${encodeURIComponent(templateId)}&applicantId=${encodeURIComponent(applicantId)}`,
        { credentials: "include" },
      );
      const body = (await res.json()) as PreviewResponse & { error?: string };
      if (!res.ok) {
        setPreview(null);
        setError(body.error ?? "Could not load preview.");
        return;
      }
      setPreview(body);
    } catch {
      setError("Network error loading preview.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [applicantId, templateId]);

  useEffect(() => {
    if (open) void loadPreview();
    else {
      setPreview(null);
      setConfirmed(false);
      setError("");
      setSuccess("");
    }
  }, [open, loadPreview]);

  async function handleSend() {
    if (!confirmed) return;
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/email/transactional/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId, templateId, confirmed: true }),
      });
      const body = (await res.json()) as { error?: string; dryRun?: boolean };
      if (!res.ok) {
        setError(body.error ?? "Send failed.");
        return;
      }
      setSuccess("Email sent.");
      onSent?.();
    } catch {
      setError("Network error while sending.");
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl border border-[#e4e4e7]">
        <div className="flex items-start justify-between gap-4 border-b border-[#e4e4e7] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#061c2a]">{title}</h2>
            <p className="text-sm text-[#6b7280] mt-0.5">
              {preview?.templateName ?? "Review and confirm"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-[#6b7280] hover:text-[#111827]">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {loading && <p className="text-sm text-[#6b7280]">Loading preview…</p>}
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
          {preview && !loading && (
            <>
              <p className="text-sm text-[#374151]">
                To: <strong>{preview.to}</strong>
              </p>
              <p className="text-sm font-medium text-[#111827]">{preview.subject}</p>
              <div
                className="rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-4 text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 rounded border-[#d4d4d8]"
                />
                <span className="text-sm text-[#374151]">
                  I reviewed this email and want to send it to this applicant.
                </span>
              </label>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e4e4e7] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-[#e4e4e7] text-sm font-medium text-[#374151]"
          >
            {success ? "Done" : "Cancel"}
          </button>
          {!success && (
            <button
              type="button"
              disabled={!confirmed || sending || loading || !preview}
              onClick={() => void handleSend()}
              className="h-10 px-5 rounded-lg bg-[#061c2a] text-white text-sm font-medium disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send email"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
