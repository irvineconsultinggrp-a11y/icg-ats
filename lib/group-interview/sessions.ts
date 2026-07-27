export type GroupInterviewDay = {
  date: string;
  slots: string[];
};

export type GroupInterviewSlot = {
  id: string;
  date: string;
  time: string;
  capacity: number;
};

/** Shared with applicant apply form and officer GI scheduler (Figma ATS-Wireframes). */
export const GROUP_INTERVIEW_DAYS: GroupInterviewDay[] = [
  {
    date: "Friday, September 18th",
    slots: [
      "9:00AM - 10:00AM",
      "10:00AM - 11:00AM",
      "11:00AM - 12:00PM",
      "12:00PM - 1:00PM",
      "1:00PM - 2:00PM",
      "2:00PM - 3:00PM",
      "3:00PM - 4:00PM",
      "4:00PM - 5:00PM",
    ],
  },
  {
    date: "Saturday, September 19th",
    slots: [
      "9:00AM - 10:00AM",
      "10:00AM - 11:00AM",
      "11:00AM - 12:00PM",
      "12:00PM - 1:00PM",
      "1:00PM - 2:00PM",
      "2:00PM - 3:00PM",
      "3:00PM - 4:00PM",
      "4:00PM - 5:00PM",
    ],
  },
  {
    date: "Sunday, September 20th",
    slots: [
      "9:00AM - 10:00AM",
      "10:00AM - 11:00AM",
      "11:00AM - 12:00PM",
      "12:00PM - 1:00PM",
      "1:00PM - 2:00PM",
      "2:00PM - 3:00PM",
      "3:00PM - 4:00PM",
      "4:00PM - 5:00PM",
    ],
  },
];

export const DEFAULT_SLOT_CAPACITY = 8;

export function buildSlotId(date: string, time: string): string {
  return `${date}::${time}`;
}

export const GROUP_INTERVIEW_SLOTS: GroupInterviewSlot[] = GROUP_INTERVIEW_DAYS.flatMap(
  (day) =>
    day.slots.map((time) => ({
      id: buildSlotId(day.date, time),
      date: day.date,
      time,
      capacity: DEFAULT_SLOT_CAPACITY,
    })),
);

const slotById = new Map(GROUP_INTERVIEW_SLOTS.map((slot) => [slot.id, slot]));

export function getGroupInterviewSlot(id: string | null | undefined): GroupInterviewSlot | undefined {
  if (!id) return undefined;
  return slotById.get(id);
}

export function isKnownGroupInterviewSlot(id: string): boolean {
  return slotById.has(id);
}

/**
 * True when the applicant is *assigned* to this interview slot. Selecting a slot
 * shows its roster, so this matches on the assigned slot only — not availability
 * (an applicant available for a slot but scheduled elsewhere must not appear here).
 */
export function applicantAssignedToSlot(
  applicant: { assignedSlot: string | null },
  slotId: string,
): boolean {
  return applicant.assignedSlot === slotId;
}
