/** Columns for officer list/table views — omit large text/json fields. */

export const APPLICANT_LIST_COLUMNS =
  "id, first_name, last_name, email, grad_year, majors, gpa, position, created_at, app_status, notes";

/** Individual Round 1 (reuses gi_* columns). */
export const APPLICANT_ROUND1_COLUMNS =
  "id, first_name, last_name, email, grad_year, majors, gpa, position, gi_status, gi_score, gi_notes";

/** Individual Round 2. */
export const APPLICANT_ROUND2_COLUMNS =
  "id, first_name, last_name, email, grad_year, majors, gpa, position, r2_status, r2_score, r2_notes";

/** BBQ social attendees. */
export const APPLICANT_BBQ_COLUMNS =
  "id, first_name, last_name, email, grad_year, majors, gpa, position, gi_score, r2_score, social_status";

export const APPLICANT_COFFEE_CHAT_COLUMNS =
  "id, first_name, last_name, email, grad_year, majors, gpa, cc_scheduled_date, cc_scheduled_time, cc_assigned_officer_name, cc_status, cc_score, cc_notes";

export const APPLICANT_DECISION_COLUMNS =
  "id, first_name, last_name, email, grad_year, majors, gpa, gi_score, r2_score, decision_status, decision_notes";

export const APPLICANT_MINE_LIST_COLUMNS =
  "id, position, created_at, app_status";

export type ApplicantPipelineParam =
  | "coffee-chats"
  | "round-1"
  | "round-2"
  | "bbq-social"
  | "decisions"
  | null;

export function selectColumnsForPipeline(
  pipeline: ApplicantPipelineParam,
): string {
  switch (pipeline) {
    case "round-1":
      return APPLICANT_ROUND1_COLUMNS;
    case "round-2":
      return APPLICANT_ROUND2_COLUMNS;
    case "bbq-social":
      return APPLICANT_BBQ_COLUMNS;
    case "coffee-chats":
      return APPLICANT_COFFEE_CHAT_COLUMNS;
    case "decisions":
      return APPLICANT_DECISION_COLUMNS;
    default:
      return APPLICANT_LIST_COLUMNS;
  }
}
