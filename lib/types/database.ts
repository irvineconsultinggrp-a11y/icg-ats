/** DB row shapes after incremental migration (legacy + new columns). */

export type ApplicantRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  /** Legacy pipeline enum (new, screening, interview, …) */
  status: string | null;
  assigned_officer_id: string | null;
  created_at: string;
  updated_at: string | null;
  /** Storage object path in `resumes` bucket */
  resume_path: string | null;
  user_id: string | null;
  position: string;
  grad_year: number | null;
  majors: string | null;
  minors: string | null;
  career_goals: string | null;
  linkedin_url: string | null;
  commitments: string | null;
  info_session: string | null;
  available_slots: unknown;
  app_status: string;
  notes: string;
  gpa: string | null;
  gi_status: string;
  gi_session_id: string | null;
  gi_score: number | null;
  gi_notes: string;
  cc_status: string;
  cc_scheduled_date: string | null;
  cc_scheduled_time: string | null;
  cc_assigned_officer_id: string | null;
  cc_assigned_officer_name: string | null;
  cc_score: number | null;
  cc_notes: string;
  /** Individual Round 2 (Round 1 reuses the gi_* fields above). */
  r2_status: string;
  r2_score: number | null;
  r2_notes: string;
  /** BBQ social — 'accepted' means they appear in the BBQ Social tab. */
  social_status: string;
  decision_status: string;
  decision_notes: string;
};

export type OfficerRow = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  created_at: string | null;
  avatar_url: string | null;
  class_year: number | null;
  hobbies: string | null;
  category: string | null;
  calendly_link: string | null;
  auth_user_id: string | null;
};

export type CoffeeChatRequestRow = {
  id: string;
  applicant_user_id: string;
  applicant_id: string | null;
  officer_id: string;
  status: string;
  message: string;
  created_at: string;
  updated_at: string;
};

export type OfficerDirectoryRow = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  category: string | null;
  avatar_url: string | null;
  class_year: number | null;
  hobbies: string | null;
  calendly_link: string | null;
};

export const APPLICANT_SORT_COLUMNS = [
  "created_at",
  "last_name",
  "first_name",
  "email",
  "app_status",
  "position",
] as const;

export type ApplicantSortColumn = (typeof APPLICANT_SORT_COLUMNS)[number];

export type ListApplicantsQuery = {
  search: string | null;
  status: string | null;
  position: string | null;
  sort: ApplicantSortColumn;
  order: "asc" | "desc";
  limit: number;
  offset: number;
  gi_status: string | null;
  r2_status: string | null;
  cc_status: string | null;
  social_status: string | null;
  decision_status: string | null;
};
