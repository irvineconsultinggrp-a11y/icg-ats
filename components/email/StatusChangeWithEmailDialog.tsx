"use client";

import { useCallback, useEffect, useState } from "react";
import type { TransactionalEmailId } from "@/lib/email/transactional-templates";

type PreviewResponse = {
  to: string;
  subject: string;
  html: string;
};

export type StatusChangeWithEmailDialogProps = {
  open: boolean;
  onClose: () => void;
  applicantId: string;
  templateId: TransactionalEmailId;
  /** e.g. "Reject application" */
  actionLabel: string;
  /** Update pipeline status (called before send). */
  onConfirmStatus: () => Promise<void> | void;
  defaultSendEmail?: boolean;
};

export function StatusChangeWithEmailDialog({
  open,
  onClose,
  applicantId,
  templateId,
  actionLabel,
  onConfirmStatus,
  defaultSendEmail = true,
}: StatusChangeWithEmailDialogProps) {
  const [sendEmail, setSendEmail] = useState(defaultSendEmail);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/email/transactional/preview?templateId=${encodeURIComponent(templateId)}&applicantId=${encodeURIComponent(applicantId)}`,
        { credentials: "include" },
      );
      const body = (await res.json()) as PreviewResponse & { error?: string };
      if (!res.ok) {
        setPreview(null);
        setError(body.error ?? "Could not load email preview.");
        return;
      }
      setPreview(body);
    } catch {
      setError("Network error.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [applicantId, templateId]);

  useEffect(() => {
    if (open) {
      setSendEmail(defaultSendEmail);
      void loadPreview();
    } else {
      setPreview(null);
      setError("");
    }
  }, [open, defaultSendEmail, loadPreview]);

  async function handleConfirm() {
    setWorking(true);
    setError("");
    try {
      await onConfirmStatus();
      if (sendEmail) {
        const res = await fetch("/api/email/transactional/send", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicantId, templateId, confirmed: true }),
        });
        const body = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(
            `Status updated, but email failed: ${body.error ?? "Send failed."} You can resend from Email Templates.`,
          );
          return;
        }
      }
      onClose();
    } catch {
      setError("Could not update status.");
    } finally {
      setWorking(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white border border-[#e4e4e7] shadow-xl flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-[#e4e4e7]">
          <h3 className="text-base font-semibold text-[#111827]">{actionLabel}</h3>
          <p className="text-sm text-[#6b7280] mt-1">Update their status in the ATS and optionally notify them by email.</p>
        </div>
        <div className="px-6 py-4 flex flex-col gap-3 overflow-y-auto flex-1">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded border-[#d4d4d8]"
            />
            <span className="text-sm text-[#374151]">Send email to applicant</span>
          </label>
          {sendEmail && loading && <p className="text-xs text-[#6b7280]">Loading email preview…</p>}
          {sendEmail && preview && !loading && (
            <div className="rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-3 text-xs text-[#374151] max-h-48 overflow-y-auto">
              <p className="font-medium text-[#111827] mb-1">{preview.subject}</p>
              <p className="text-[#6b7280] mb-2">To: {preview.to}</p>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: preview.html }} />
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-[#e4e4e7] flex justify-end gap-2">
          <button
            type="button"
            disabled={working}
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-[#e4e4e7] text-sm font-medium text-[#374151]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={working || (sendEmail && loading)}
            onClick={() => void handleConfirm()}
            className="h-9 px-4 rounded-lg bg-[#061c2a] text-white text-sm font-medium disabled:opacity-50"
          >
            {working ? "Saving…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
