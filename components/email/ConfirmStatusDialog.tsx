"use client";

import { useState } from "react";

type ConfirmStatusDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
};

/** Confirm a pipeline status change only (no email). */
export function ConfirmStatusDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
}: ConfirmStatusDialogProps) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleConfirm() {
    setWorking(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch {
      setError("Could not update status.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white border border-[#e4e4e7] shadow-xl">
        <div className="px-6 py-4 border-b border-[#e4e4e7]">
          <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
          <p className="text-sm text-[#6b7280] mt-1">{description}</p>
        </div>
        {error ? (
          <div className="px-6 pt-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        ) : null}
        <div className="px-6 py-4 flex justify-end gap-2">
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
            disabled={working}
            onClick={() => void handleConfirm()}
            className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {working ? "Updating…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
