import {
  buildAssignmentId,
  interviewRoomEmailLabel,
  type InterviewRoom,
} from "@/lib/group-interview/sessions";
import type { EmailCampaignId, EmailRecipient } from "@/lib/email/types";
import { createAdminClient } from "@/utils/supabase/admin";

export type ScheduleEmailSendRecord = {
  id: string;
  applicantId: string;
  campaign: EmailCampaignId;
  assignmentId: string | null;
  scheduleDate: string | null;
  timeBlock: string | null;
  room: string | null;
  sentAt: string;
};

type DbRow = {
  id: string;
  applicant_id: string;
  campaign: EmailCampaignId;
  assignment_id: string | null;
  schedule_date: string | null;
  time_block: string | null;
  room: string | null;
  sent_at: string;
};

function rowToRecord(row: DbRow): ScheduleEmailSendRecord {
  return {
    id: row.id,
    applicantId: row.applicant_id,
    campaign: row.campaign,
    assignmentId: row.assignment_id,
    scheduleDate: row.schedule_date,
    timeBlock: row.time_block,
    room: row.room,
    sentAt: row.sent_at,
  };
}

export function assignmentIdFromRecipient(recipient: EmailRecipient): string | null {
  if (!recipient.scheduleDate || !recipient.timeBlock || !recipient.room) return null;
  if (!recipient.room.startsWith("Room ")) return null;
  return buildAssignmentId(
    recipient.scheduleDate,
    recipient.timeBlock,
    recipient.room as InterviewRoom,
  );
}

export async function logScheduleEmailSend(input: {
  applicantId: string;
  campaign: EmailCampaignId;
  recipient: EmailRecipient;
  sentBy: string | null;
  resendMessageId?: string;
}): Promise<{ record?: ScheduleEmailSendRecord; error?: string }> {
  const admin = createAdminClient();
  const assignmentId = assignmentIdFromRecipient(input.recipient);

  const { data, error } = await admin
    .from("interview_schedule_email_sends")
    .insert({
      applicant_id: input.applicantId,
      campaign: input.campaign,
      assignment_id: assignmentId,
      schedule_date: input.recipient.scheduleDate,
      time_block: input.recipient.timeBlock,
      room: input.recipient.room,
      sent_by: input.sentBy,
      resend_message_id: input.resendMessageId ?? null,
    })
    .select(
      "id, applicant_id, campaign, assignment_id, schedule_date, time_block, room, sent_at",
    )
    .single();

  if (error) return { error: error.message };
  return { record: rowToRecord(data as DbRow) };
}

export async function fetchScheduleEmailSends(
  campaign: EmailCampaignId,
): Promise<{ records: ScheduleEmailSendRecord[]; error?: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("interview_schedule_email_sends")
    .select(
      "id, applicant_id, campaign, assignment_id, schedule_date, time_block, room, sent_at",
    )
    .eq("campaign", campaign)
    .order("sent_at", { ascending: false });

  if (error) return { records: [], error: error.message };
  return { records: (data ?? []).map((row) => rowToRecord(row as DbRow)) };
}

/** Latest send for this applicant + current room/time assignment (if any). */
export function recipientWasEmailedForAssignment(
  recipient: EmailRecipient,
  records: ScheduleEmailSendRecord[],
): ScheduleEmailSendRecord | undefined {
  const assignmentId = assignmentIdFromRecipient(recipient);
  return records.find(
    (r) =>
      r.applicantId === recipient.applicantId &&
      (assignmentId ? r.assignmentId === assignmentId : true),
  );
}

export function sendForCurrentAssignment(
  applicantId: string,
  assignedSlot: string | null,
  records: ScheduleEmailSendRecord[],
): ScheduleEmailSendRecord | undefined {
  if (!assignedSlot) return undefined;
  return records.find(
    (r) => r.applicantId === applicantId && r.assignmentId === assignedSlot,
  );
}

export async function fetchScheduleEmailSendsClient(
  campaign: EmailCampaignId,
): Promise<{ records: ScheduleEmailSendRecord[]; error?: string }> {
  const res = await fetch(`/api/email/campaign/sent-log?campaign=${encodeURIComponent(campaign)}`, {
    credentials: "include",
  });
  const body = (await res.json()) as { records?: ScheduleEmailSendRecord[]; error?: string };
  if (!res.ok) return { records: [], error: body.error ?? "Could not load email log." };
  return { records: body.records ?? [] };
}

export function formatSendLabel(record: ScheduleEmailSendRecord): string {
  const parts: string[] = [];
  if (record.timeBlock) parts.push(record.timeBlock);
  if (record.room) parts.push(interviewRoomEmailLabel(record.room));
  const when = new Date(record.sentAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const detail = parts.length > 0 ? parts.join(" · ") : "Schedule email";
  return `Emailed ${when} — ${detail}`;
}
