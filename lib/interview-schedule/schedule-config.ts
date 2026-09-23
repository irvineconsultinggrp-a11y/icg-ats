import type { PipelineStage } from "@/lib/applicants/stages";
import {
  APPLICANTS_PER_ROOM,
  buildRound1InterviewDaySlots,
  buildRound2InterviewDaySlots,
  INTERVIEW_ROOMS,
  ROUND_1_HOSTING_OFFICERS_PER_ROOM,
  ROUND_1_SCHEDULE_DAY,
  ROUND_2_HOSTING_OFFICERS_PER_ROOM,
  ROUND_2_SCHEDULE_DAY,
} from "@/lib/group-interview/sessions";

const ROOM_COUNT = INTERVIEW_ROOMS.length;

export type InterviewScheduleRoundConfig = {
  round: 1 | 2;
  title: string;
  subtitle: string;
  scheduleDay: string;
  slots: string[];
  hoursLabel: string;
  applicantsPerRoom: number;
  hostingOfficersPerRoom: number;
  pipeline: PipelineStage;
  enableAutoSort: boolean;
};

export const ROUND_1_INTERVIEW_SCHEDULE: InterviewScheduleRoundConfig = {
  round: 1,
  title: "Round 1 interview schedule",
  subtitle: `Saturday, October 3rd · ${ROOM_COUNT} rooms · 9 AM–6 PM`,
  scheduleDay: ROUND_1_SCHEDULE_DAY,
  slots: buildRound1InterviewDaySlots(),
  hoursLabel: "9:00 AM – 6:00 PM",
  applicantsPerRoom: APPLICANTS_PER_ROOM,
  hostingOfficersPerRoom: ROUND_1_HOSTING_OFFICERS_PER_ROOM,
  pipeline: "interview-schedule",
  enableAutoSort: true,
};

export const ROUND_2_INTERVIEW_SCHEDULE: InterviewScheduleRoundConfig = {
  round: 2,
  title: "Round 2 interview schedule",
  subtitle: `Sunday, October 4th · ${ROOM_COUNT} rooms · 9 AM–3 PM`,
  scheduleDay: ROUND_2_SCHEDULE_DAY,
  slots: buildRound2InterviewDaySlots(),
  hoursLabel: "9:00 AM – 3:00 PM",
  applicantsPerRoom: APPLICANTS_PER_ROOM,
  hostingOfficersPerRoom: ROUND_2_HOSTING_OFFICERS_PER_ROOM,
  pipeline: "interview-schedule-round-2",
  enableAutoSort: false,
};
