"use client";

import type { NoteSignal } from "@/lib/applicants/note-signal";

const SIGNAL_META: Record<
  NoteSignal,
  { label: string; dot: string; ring: string; active: string }
> = {
  green: {
    label: "Good",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/40",
    active: "bg-emerald-50 border-emerald-500 text-emerald-800",
  },
  yellow: {
    label: "Average",
    dot: "bg-amber-400",
    ring: "ring-amber-400/40",
    active: "bg-amber-50 border-amber-500 text-amber-900",
  },
  red: {
    label: "Concern",
    dot: "bg-red-500",
    ring: "ring-red-500/40",
    active: "bg-red-50 border-red-500 text-red-800",
  },
};

export function NoteSignalDot({ signal, className }: { signal: NoteSignal; className?: string }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${SIGNAL_META[signal].dot} ${className ?? ""}`}
      title={SIGNAL_META[signal].label}
      aria-hidden
    />
  );
}

export function NoteSignalPicker({
  value,
  onChange,
  disabled,
  compact,
}: {
  value: NoteSignal | null;
  onChange: (signal: NoteSignal) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex items-center gap-1.5" : "flex flex-col gap-2"}>
      {!compact && (
        <p className="text-xs font-medium text-[#6b7280]">Your rating for this chat</p>
      )}
      <div className="flex items-center gap-2">
        {(["green", "yellow", "red"] as NoteSignal[]).map((s) => {
          const meta = SIGNAL_META[s];
          const selected = value === s;
          return (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => onChange(s)}
              title={meta.label}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-50 ${
                selected
                  ? meta.active
                  : "bg-white border-[#e4e4e7] text-[#6b7280] hover:border-[#d1d5db]"
              } ${selected ? `ring-2 ${meta.ring}` : ""}`}
            >
              <NoteSignalDot signal={s} />
              {!compact && meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function NoteSignalSummary({
  counts,
}: {
  counts: { green: number; yellow: number; red: number };
}) {
  const parts: { signal: NoteSignal; n: number }[] = [
    { signal: "green", n: counts.green },
    { signal: "yellow", n: counts.yellow },
    { signal: "red", n: counts.red },
  ];
  const any = parts.some((p) => p.n > 0);
  if (!any) {
    return <span className="text-xs text-[#a1a1aa] italic">No ratings</span>;
  }
  return (
    <div className="flex items-center gap-2">
      {parts.map(({ signal, n }) =>
        n > 0 ? (
          <span key={signal} className="inline-flex items-center gap-1 text-xs text-[#374151]">
            <NoteSignalDot signal={signal} />
            <span className="font-medium tabular-nums">{n}</span>
          </span>
        ) : null,
      )}
    </div>
  );
}
