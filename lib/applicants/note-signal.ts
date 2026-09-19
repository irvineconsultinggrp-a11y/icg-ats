export type NoteSignal = "green" | "yellow" | "red";

export const NOTE_SIGNALS: NoteSignal[] = ["green", "yellow", "red"];

export type NoteSignalCounts = {
  green: number;
  yellow: number;
  red: number;
};

export const EMPTY_SIGNAL_COUNTS: NoteSignalCounts = {
  green: 0,
  yellow: 0,
  red: 0,
};

export function parseNoteSignal(value: unknown): NoteSignal | null {
  if (value === "green" || value === "yellow" || value === "red") return value;
  return null;
}

/** Sort applicants: most greens first, tie-break fewer reds, then name. */
export function compareByGreensDesc(
  a: { signalCounts: NoteSignalCounts; firstName: string; lastName: string },
  b: { signalCounts: NoteSignalCounts; firstName: string; lastName: string },
): number {
  const g = b.signalCounts.green - a.signalCounts.green;
  if (g !== 0) return g;
  const r = a.signalCounts.red - b.signalCounts.red;
  if (r !== 0) return r;
  return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
}

/** Sort applicants: most reds first, tie-break fewer greens, then name. */
export function compareByRedsDesc(
  a: { signalCounts: NoteSignalCounts; firstName: string; lastName: string },
  b: { signalCounts: NoteSignalCounts; firstName: string; lastName: string },
): number {
  const r = b.signalCounts.red - a.signalCounts.red;
  if (r !== 0) return r;
  const g = a.signalCounts.green - b.signalCounts.green;
  if (g !== 0) return g;
  return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
}
