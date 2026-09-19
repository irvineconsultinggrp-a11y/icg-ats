export type Position = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  openDate: string;
  closeDate: string;
  isOpen: boolean;
};

export const POSITIONS: Position[] = [
  {
    id: "junior-associate",
    title: "Junior Associate",
    description:
      "Join our team as a Junior Associate. Work on consulting deliverables, conduct research, and support associate consultants on projects.",
    tags: ["Fall Quarter", "2026"],
    openDate: "09/21/2026",
    closeDate: "09/30/2026",
    isOpen: true,
  },
  {
    id: "junior-associate-winter",
    title: "Junior Associate",
    description:
      "Join our team as a Junior Associate. Work on consulting deliverables, conduct research, and support associate consultants on projects.",
    tags: ["Winter Quarter", "2026"],
    openDate: "01/15/2026",
    closeDate: "01/30/2026",
    isOpen: false,
  },
  {
    id: "junior-associate-fall-2025",
    title: "Junior Associate",
    description:
      "Join our team as a Junior Associate. Work on consulting deliverables, conduct research, and support associate consultants on projects.",
    tags: ["Fall Quarter", "2025"],
    openDate: "09/13/2026",
    closeDate: "09/25/2025",
    isOpen: false,
  },
];

export function getPositionById(id: string): Position | undefined {
  return POSITIONS.find((p) => p.id === id);
}

function parsePositionDate(dateStr: string, endOfDay: boolean): Date | null {
  const [month, day, year] = dateStr.split("/").map(Number);
  if (!month || !day || !year) return null;
  return endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
}

/** Start of open date in local time (00:00:00). */
export function getPositionOpenDate(positionId: string): Date | null {
  const position = getPositionById(positionId);
  if (!position) return null;
  return parsePositionDate(position.openDate, false);
}

/** End of close date in local time (23:59:59). */
export function getPositionDeadline(positionId: string): Date | null {
  const position = getPositionById(positionId);
  if (!position) return null;
  return parsePositionDate(position.closeDate, true);
}

export function isBeforeDeadline(positionId: string, now = new Date()): boolean {
  const deadline = getPositionDeadline(positionId);
  if (!deadline) return false;
  return now.getTime() <= deadline.getTime();
}

export function isAfterOpenDate(positionId: string, now = new Date()): boolean {
  const open = getPositionOpenDate(positionId);
  if (!open) return false;
  return now.getTime() >= open.getTime();
}

/** When true, applicants cannot apply before `openDate` (production launch). */
export function enforceApplicationOpenDate(): boolean {
  return process.env.NEXT_PUBLIC_ENFORCE_APPLICATION_OPEN_DATE === "true";
}

export function canApplyToPosition(positionId: string, now = new Date()): boolean {
  const position = getPositionById(positionId);
  if (!position?.isOpen) return false;
  if (enforceApplicationOpenDate() && !isAfterOpenDate(positionId, now)) return false;
  return isBeforeDeadline(positionId, now);
}

export function canEditApplication(positionId: string): boolean {
  return canApplyToPosition(positionId);
}

export function formatPositionTitle(positionId: string): string {
  const position = getPositionById(positionId);
  if (position) return position.title;
  return positionId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
