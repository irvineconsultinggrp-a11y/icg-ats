/** Columns for officer list/table views — omit large text/json fields. */

export const APPLICANT_LIST_COLUMNS =
  "id, first_name, last_name, email, grad_year, majors, gpa, position, created_at, app_status, notes";

export const APPLICANT_GROUP_INTERVIEW_COLUMNS =
  "id, first_name, last_name, email, grad_year, majors, gpa, position, available_slots, gi_session_id, gi_status, gi_score, gi_notes";

export const APPLICANT_COFFEE_CHAT_COLUMNS =
  "id, first_name, last_name, email, grad_year, majors, gpa, cc_scheduled_date, cc_scheduled_time, cc_assigned_officer_name, cc_status, cc_score, cc_notes";

export const APPLICANT_DECISION_COLUMNS =
  "id, first_name, last_name, email, grad_year, majors, gpa, gi_score, cc_score, decision_status, decision_notes";

export const APPLICANT_MINE_LIST_COLUMNS =
  "id, position, created_at, app_status";

export type ApplicantPipelineParam =
  | "group-interview"
  | "coffee-chats"
  | "decisions"
  | null;

export function selectColumnsForPipeline(
  pipeline: ApplicantPipelineParam,
): string {
  switch (pipeline) {
    case "group-interview":
      return APPLICANT_GROUP_INTERVIEW_COLUMNS;
    case "coffee-chats":
      return APPLICANT_COFFEE_CHAT_COLUMNS;
    case "decisions":
      return APPLICANT_DECISION_COLUMNS;
    default:
      return APPLICANT_LIST_COLUMNS;
  }
}
