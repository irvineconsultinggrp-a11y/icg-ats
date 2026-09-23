"use client";

import { useCallback, useEffect, useState } from "react";
import type { TransactionalEmailId } from "@/lib/email/transactional-templates";
import { SendTransactionalEmailModal } from "@/components/email/SendTransactionalEmailModal";

type RejectionEmailActionsProps = {
  applicantId: string;
  templateId: TransactionalEmailId;
  /** Re-fetch when applicant or rejected state changes */
  refreshKey?: string | number;
};

function formatSentAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function RejectionEmailActions({
  applicantId,
  templateId,
  refreshKey,
}: RejectionEmailActionsProps) {
  const [sentAt, setSentAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadSentLog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/email/transactional/sent-log?applicantId=${encodeURIComponent(applicantId)}&templateId=${encodeURIComponent(templateId)}`,
        { credentials: "include" },
      );
      const body = (await res.json()) as { sentAt?: string | null; error?: string };
      if (res.ok) {
        setSentAt(body.sentAt ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, [applicantId, templateId]);

  useEffect(() => {
    void loadSentLog();
  }, [loadSentLog, refreshKey]);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
        Rejection email
      </p>
      {loading ? (
        <p className="text-sm text-[#a1a1aa]">Checking send history…</p>
      ) : sentAt ? (
        <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          Rejection email sent on <span className="font-medium">{formatSentAt(sentAt)}</span>.
          You do not need to send again.
        </p>
      ) : (
        <>
          <p className="text-sm text-[#374151]">
            Status is rejected. Send the rejection email when you are ready.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-10 w-full rounded-lg border border-[#061c2a] text-[#061c2a] text-sm font-medium hover:bg-[#061c2a]/5"
          >
            Send rejection email
          </button>
        </>
      )}

      <SendTransactionalEmailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        applicantId={applicantId}
        templateId={templateId}
        title="Send rejection email"
        onSent={() => {
          setModalOpen(false);
          void loadSentLog();
        }}
      />
    </div>
  );
}
