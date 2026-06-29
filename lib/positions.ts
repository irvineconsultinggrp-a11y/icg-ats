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
    openDate: "09/15/2026",
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

/** End of close date in local time (23:59:59). */
export function getPositionDeadline(positionId: string): Date | null {
  const position = getPositionById(positionId);
  if (!position) return null;
  const [month, day, year] = position.closeDate.split("/").map(Number);
  if (!month || !day || !year) return null;
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function isBeforeDeadline(positionId: string, now = new Date()): boolean {
  const deadline = getPositionDeadline(positionId);
  if (!deadline) return false;
  return now.getTime() <= deadline.getTime();
}

export function canApplyToPosition(positionId: string): boolean {
  const position = getPositionById(positionId);
  return Boolean(position?.isOpen && isBeforeDeadline(positionId));
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
