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

/** Last Round 1 interview block (no 6:00–7:00 PM slot even if CSL holds run later). */
export const ROUND_1_LAST_INTERVIEW_TIME_BLOCK = "5:00PM - 6:00PM";

export const ROUND_1_INTERVIEW_SCHEDULING_NOTE =
  "Interviews end at 6:00 PM (last block 5:00–6:00 PM). CSL room reservations may run until 7:30 PM — there is no 6:00–7:00 PM interview block.";

const ROUND_1_MORNING_SLOTS = [
  "9:00AM - 10:00AM",
  "10:00AM - 11:00AM",
  "11:00AM - 12:00PM",
] as const;

const ROUND_1_AFTERNOON_SLOTS = [
  "1:00PM - 2:00PM",
  "2:00PM - 3:00PM",
  "3:00PM - 4:00PM",
  "4:00PM - 5:00PM",
  ROUND_1_LAST_INTERVIEW_TIME_BLOCK,
] as const;

/** Round 1 (Oct 3): 9:00 AM–6:00 PM interviews, excluding 12:00–1:00 (lunch). */
export function buildRound1InterviewDaySlots(): string[] {
  return [...ROUND_1_MORNING_SLOTS, ...ROUND_1_AFTERNOON_SLOTS];
}

/** Round 2 (Oct 4): 9:00 AM–3:00 PM, excluding lunch. */
export function buildRound2InterviewDaySlots(): string[] {
  return [
    "9:00AM - 10:00AM",
    "10:00AM - 11:00AM",
    "11:00AM - 12:00PM",
    "1:00PM - 2:00PM",
    "2:00PM - 3:00PM",
  ];
}

export const LUNCH_BREAK_LABEL = "12:00PM - 1:00PM (Lunch — no interviews)";

/** Fall 2026: R1 Sat Oct 3, R2 Sun Oct 4. */
export const GROUP_INTERVIEW_DAYS: GroupInterviewDay[] = [
  {
    date: "Saturday, October 3rd",
    slots: buildRound1InterviewDaySlots(),
  },
  {
    date: "Sunday, October 4th",
    slots: buildRound2InterviewDaySlots(),
  },
];

export const ROUND_1_SCHEDULE_DAY = GROUP_INTERVIEW_DAYS[0].date;
export const ROUND_2_SCHEDULE_DAY = GROUP_INTERVIEW_DAYS[1].date;

export const INTERVIEW_ROOMS = [
  "Room 1",
  "Room 2",
  "Room 3",
  "Room 4",
  "Room 5",
] as const;

export type InterviewRoom = (typeof INTERVIEW_ROOMS)[number];

/** Fall 2026 Round 1 (Sat Oct 3) physical spaces — order matches Room 1–5. */
export const INTERVIEW_ROOM_CSL: Record<InterviewRoom, string> = {
  "Room 1": "CSL 5",
  "Room 2": "CSL 7",
  "Room 3": "CSL 11",
  "Room 4": "CSL 6",
  "Room 5": "CSL 8",
};

export function cslForInterviewRoom(room: InterviewRoom): string {
  return INTERVIEW_ROOM_CSL[room];
}

export function interviewRoomDisplayName(room: InterviewRoom): string {
  return `${room} · ${INTERVIEW_ROOM_CSL[room]}`;
}

/** Applicant-facing email copy: logical room + building room. */
export function interviewRoomEmailLabel(room: string | null | undefined): string {
  if (room && INTERVIEW_ROOMS.includes(room as InterviewRoom)) {
    const logical = room as InterviewRoom;
    return `${logical} (${INTERVIEW_ROOM_CSL[logical]})`;
  }
  return room ?? "—";
}

export function cslLocationForRoomLabel(room: string | null | undefined): string {
  if (room && INTERVIEW_ROOMS.includes(room as InterviewRoom)) {
    return cslForInterviewRoom(room as InterviewRoom);
  }
  return "—";
}

/** Max interviewees per room per time block. */
export const APPLICANTS_PER_ROOM = 4;

export const ROUND_1_HOSTING_OFFICERS_PER_ROOM = 4;
export const ROUND_2_HOSTING_OFFICERS_PER_ROOM = 3;

export const DEFAULT_SLOT_CAPACITY = INTERVIEW_ROOMS.length * APPLICANTS_PER_ROOM;

export function buildSlotId(date: string, time: string): string {
  return `${date}::${time}`;
}

export function buildAssignmentId(date: string, time: string, room: InterviewRoom): string {
  return `${buildSlotId(date, time)}::${room}`;
}

export type ParsedAssignment = {
  slotId: string;
  date: string;
  time: string;
  room: InterviewRoom | null;
};

/** Parses `gi_session_id` / `r2_session_id` — legacy `date::time` or `date::time::Room N`. */
export function parseAssignmentId(id: string | null | undefined): ParsedAssignment | null {
  if (!id) return null;
  const parts = id.split("::");
  if (parts.length === 2) {
    const [date, time] = parts;
    return { slotId: id, date, time, room: null };
  }
  if (parts.length >= 3) {
    const date = parts[0];
    const time = parts[1];
    const roomRaw = parts.slice(2).join("::");
    const room = INTERVIEW_ROOMS.includes(roomRaw as InterviewRoom)
      ? (roomRaw as InterviewRoom)
      : null;
    return { slotId: buildSlotId(date, time), date, time, room };
  }
  return null;
}

export function isAssignedOnScheduleDay(
  assignedSlot: string | null | undefined,
  scheduleDay: string,
): boolean {
  const parsed = parseAssignmentId(assignedSlot);
  return parsed?.date === scheduleDay && parsed.room !== null;
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

export function applicantAssignedToSlot(
  applicant: { assignedSlot: string | null },
  slotId: string,
): boolean {
  const parsed = parseAssignmentId(applicant.assignedSlot);
  if (!parsed) return false;
  return parsed.slotId === slotId;
}

export function applicantAssignedToRoom(
  applicant: { assignedSlot: string | null },
  slotId: string,
  room: InterviewRoom,
): boolean {
  const parsed = parseAssignmentId(applicant.assignedSlot);
  if (!parsed) return false;
  return parsed.slotId === slotId && parsed.room === room;
}

export function applicantsInRoomAssignment(
  applicants: { id: string; assignedSlot: string | null }[],
  assignmentId: string,
): { id: string; assignedSlot: string | null }[] {
  return applicants.filter((a) => a.assignedSlot === assignmentId);
}

