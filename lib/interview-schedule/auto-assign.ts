import {
  buildAssignmentId,
  buildSlotId,
  getGroupInterviewSlot,
  INTERVIEW_ROOMS,
  parseAssignmentId,
  type InterviewRoom,
} from "@/lib/group-interview/sessions";

export type AutoAssignApplicant = {
  id: string;
  availableSlots: string[];
  assignedSlot: string | null;
};

export type AutoAssignResult = {
  assignments: Array<{ applicantId: string; assignmentId: string }>;
  unplacedIds: string[];
};

/** Greedy room placement: fewest day-slots first, then earliest slot with room capacity. */
export function computeAutoRoomAssignments(
  applicants: AutoAssignApplicant[],
  scheduleDay: string,
  slotTimes: string[],
  applicantsPerRoom: number,
): AutoAssignResult {
  const slotIds = slotTimes.map((time) => buildSlotId(scheduleDay, time));
  const daySlotSet = new Set(slotIds);

  const countByAssignment = new Map<string, number>();
  for (const a of applicants) {
    const parsed = parseAssignmentId(a.assignedSlot);
    if (parsed?.date === scheduleDay && parsed.room && a.assignedSlot) {
      countByAssignment.set(
        a.assignedSlot,
        (countByAssignment.get(a.assignedSlot) ?? 0) + 1,
      );
    }
  }

  const toPlace = applicants.filter((a) => {
    if (parseAssignmentId(a.assignedSlot)?.date === scheduleDay) return false;
    return slotIds.some((id) => a.availableSlots.includes(id));
  });

  toPlace.sort((a, b) => {
    const ca = slotIds.filter((id) => a.availableSlots.includes(id)).length;
    const cb = slotIds.filter((id) => b.availableSlots.includes(id)).length;
    if (ca !== cb) return ca - cb;
    return a.id.localeCompare(b.id);
  });

  const assignments: Array<{ applicantId: string; assignmentId: string }> = [];
  const placed = new Set<string>();

  for (const applicant of toPlace) {
    const prefs = slotIds.filter((id) => applicant.availableSlots.includes(id));
    let assigned = false;
    for (const slotId of prefs) {
      const slot = getGroupInterviewSlot(slotId);
      if (!slot || !daySlotSet.has(slotId)) continue;
      for (const room of INTERVIEW_ROOMS) {
        const assignmentId = buildAssignmentId(scheduleDay, slot.time, room as InterviewRoom);
        const n = countByAssignment.get(assignmentId) ?? 0;
        if (n < applicantsPerRoom) {
          countByAssignment.set(assignmentId, n + 1);
          assignments.push({ applicantId: applicant.id, assignmentId });
          placed.add(applicant.id);
          assigned = true;
          break;
        }
      }
      if (assigned) break;
    }
  }

  const unplacedIds = toPlace.filter((a) => !placed.has(a.id)).map((a) => a.id);
  return { assignments, unplacedIds };
}
