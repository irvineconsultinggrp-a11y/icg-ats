import {
  buildAssignmentId,
  INTERVIEW_ROOMS,
  parseAssignmentId,
  ROUND_1_SCHEDULE_DAY,
  ROUND_2_SCHEDULE_DAY,
  type InterviewRoom,
} from "@/lib/group-interview/sessions";
import type {
  CampaignPreviewRequest,
  EmailCampaignId,
  EmailRecipient,
} from "./types";
import { createAdminClient } from "@/utils/supabase/admin";

type ApplicantRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  gi_session_id: string | null;
  r2_session_id: string | null;
  social_status: string | null;
};

function rowToRecipient(row: ApplicantRow, assigned: string | null): EmailRecipient | null {
  const parsed = parseAssignmentId(assigned);
  if (!parsed?.room) return null;
  return {
    applicantId: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    room: parsed.room,
    timeBlock: parsed.time,
    scheduleDate: parsed.date,
  };
}

function matchesScope(
  assigned: string | null,
  req: CampaignPreviewRequest,
  scheduleDay: string,
): boolean {
  const parsed = parseAssignmentId(assigned);
  if (!parsed || parsed.date !== scheduleDay || !parsed.room) return false;

  if (req.scope === "all-assigned") return true;
  if (req.scope === "time-block") {
    return Boolean(req.slotId && parsed.slotId === req.slotId);
  }
  if (req.scope === "room") {
    if (!req.slotId || !req.room) return false;
    const expected = buildAssignmentId(parsed.date, parsed.time, req.room as InterviewRoom);
    return assigned === expected;
  }
  return false;
}

export async function resolveCampaignRecipients(
  req: CampaignPreviewRequest,
): Promise<{ recipients: EmailRecipient[]; error?: string }> {
  const admin = createAdminClient();

  if (req.campaign === "bbq") {
    const { data, error } = await admin
      .from("applicants")
      .select("id, email, first_name, last_name, gi_session_id, r2_session_id, social_status")
      .eq("social_status", "accepted")
      .order("last_name", { ascending: true });

    if (error) return { recipients: [], error: error.message };

    const recipients: EmailRecipient[] = (data ?? []).map((row: ApplicantRow) => ({
      applicantId: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      room: null,
      timeBlock: null,
      scheduleDate: null,
    }));
    return { recipients };
  }

  const scheduleDay =
    req.scheduleDay ??
    (req.campaign === "round-1" ? ROUND_1_SCHEDULE_DAY : ROUND_2_SCHEDULE_DAY);

  if (req.scope === "time-block" && !req.slotId) {
    return { recipients: [], error: "Select a time block first." };
  }
  if (req.scope === "room") {
    if (!req.slotId) return { recipients: [], error: "Select a time block first." };
    if (!req.room || !INTERVIEW_ROOMS.includes(req.room as InterviewRoom)) {
      return { recipients: [], error: "Select a room." };
    }
  }

  const sessionColumn = req.campaign === "round-1" ? "gi_session_id" : "r2_session_id";

  const { data, error } = await admin
    .from("applicants")
    .select("id, email, first_name, last_name, gi_session_id, r2_session_id, social_status")
    .not(sessionColumn, "is", null);

  if (error) return { recipients: [], error: error.message };

  const recipients: EmailRecipient[] = [];
  for (const row of (data ?? []) as ApplicantRow[]) {
    const assigned = req.campaign === "round-1" ? row.gi_session_id : row.r2_session_id;
    if (!matchesScope(assigned, req, scheduleDay)) continue;
    const rec = rowToRecipient(row, assigned);
    if (rec) recipients.push(rec);
  }

  recipients.sort((a, b) =>
    `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, undefined, {
      sensitivity: "base",
    }),
  );

  return { recipients };
}
