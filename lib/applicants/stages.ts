import type { ApplicantRow } from "@/lib/types/database";

export type PipelineStage =
  | "applications"
  | "group-interview"
  | "coffee-chats"
  | "decisions";

export type AppStatus = "new" | "reviewing" | "advanced" | "rejected";
export type GIStatus = "pending" | "scheduled" | "completed" | "rejected";
export type CCStatus = "pending" | "scheduled" | "completed" | "rejected";
export type DecisionStatus = "pending" | "accepted" | "rejected";

export type OfficerApplicantPatch = {
  app_status?: AppStatus;
  notes?: string;
  gi_status?: GIStatus;
  gi_session_id?: string | null;
  gi_score?: number | null;
  gi_notes?: string;
  cc_status?: CCStatus;
  cc_scheduled_date?: string | null;
  cc_scheduled_time?: string | null;
  cc_assigned_officer_id?: string | null;
  cc_assigned_officer_name?: string | null;
  cc_score?: number | null;
  cc_notes?: string;
  decision_status?: DecisionStatus;
  decision_notes?: string;
};

const GI_STATUSES = new Set<GIStatus>(["pending", "scheduled", "completed", "rejected"]);
const CC_STATUSES = new Set<CCStatus>(["pending", "scheduled", "completed", "rejected"]);
const DECISION_STATUSES = new Set<DecisionStatus>(["pending", "accepted", "rejected"]);
const APP_STATUSES = new Set<AppStatus>(["new", "reviewing", "advanced", "rejected"]);

export function parseOfficerApplicantPatch(
  body: Record<string, unknown>,
): { patch: OfficerApplicantPatch & { updated_at: string } } | { error: string } {
  const patch: OfficerApplicantPatch & { updated_at?: string } = {};

  if (body.app_status !== undefined) {
    if (typeof body.app_status !== "string" || !APP_STATUSES.has(body.app_status as AppStatus)) {
      return { error: "Invalid app_status" };
    }
    patch.app_status = body.app_status as AppStatus;
    if (body.gi_status === undefined && patch.app_status === "advanced") {
      patch.gi_status = "pending";
    }
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== "string") return { error: "Invalid notes" };
    patch.notes = body.notes;
  }
  if (body.gi_status !== undefined) {
    if (typeof body.gi_status !== "string" || !GI_STATUSES.has(body.gi_status as GIStatus)) {
      return { error: "Invalid gi_status" };
    }
    patch.gi_status = body.gi_status as GIStatus;
  }
  if (body.gi_session_id !== undefined) {
    patch.gi_session_id =
      body.gi_session_id === null ? null : String(body.gi_session_id);
  }
  if (body.gi_score !== undefined) {
    patch.gi_score =
      body.gi_score === null ? null : Number(body.gi_score);
    if (patch.gi_score !== null && !Number.isFinite(patch.gi_score)) {
      return { error: "Invalid gi_score" };
    }
  }
  if (body.gi_notes !== undefined) {
    if (typeof body.gi_notes !== "string") return { error: "Invalid gi_notes" };
    patch.gi_notes = body.gi_notes;
  }
  if (body.cc_status !== undefined) {
    if (typeof body.cc_status !== "string" || !CC_STATUSES.has(body.cc_status as CCStatus)) {
      return { error: "Invalid cc_status" };
    }
    patch.cc_status = body.cc_status as CCStatus;
  }
  if (body.cc_scheduled_date !== undefined) {
    patch.cc_scheduled_date =
      body.cc_scheduled_date === null ? null : String(body.cc_scheduled_date);
  }
  if (body.cc_scheduled_time !== undefined) {
    patch.cc_scheduled_time =
      body.cc_scheduled_time === null ? null : String(body.cc_scheduled_time);
  }
  if (body.cc_assigned_officer_id !== undefined) {
    patch.cc_assigned_officer_id =
      body.cc_assigned_officer_id === null ? null : String(body.cc_assigned_officer_id);
  }
  if (body.cc_assigned_officer_name !== undefined) {
    patch.cc_assigned_officer_name =
      body.cc_assigned_officer_name === null ? null : String(body.cc_assigned_officer_name);
  }
  if (body.cc_score !== undefined) {
    patch.cc_score =
      body.cc_score === null ? null : Number(body.cc_score);
    if (patch.cc_score !== null && !Number.isFinite(patch.cc_score)) {
      return { error: "Invalid cc_score" };
    }
  }
  if (body.cc_notes !== undefined) {
    if (typeof body.cc_notes !== "string") return { error: "Invalid cc_notes" };
    patch.cc_notes = body.cc_notes;
  }
  if (body.decision_status !== undefined) {
    if (
      typeof body.decision_status !== "string" ||
      !DECISION_STATUSES.has(body.decision_status as DecisionStatus)
    ) {
      return { error: "Invalid decision_status" };
    }
    patch.decision_status = body.decision_status as DecisionStatus;
  }
  if (body.decision_notes !== undefined) {
    if (typeof body.decision_notes !== "string") return { error: "Invalid decision_notes" };
    patch.decision_notes = body.decision_notes;
  }

  if (patch.gi_status === "completed" && patch.cc_status === undefined) {
    patch.cc_status = "pending";
  }

  if (Object.keys(patch).length === 0) {
    return { error: "No fields to update" };
  }

  return { patch: { ...patch, updated_at: new Date().toISOString() } };
}

export function parseAvailableSlots(row: ApplicantRow): string[] {
  return Array.isArray(row.available_slots) ? (row.available_slots as string[]) : [];
}

export function rowToGroupInterview(row: ApplicantRow) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    year: row.grad_year ?? 0,
    major: row.majors ?? "—",
    gpa: row.gpa ?? "—",
    position: row.position,
    availableSlots: parseAvailableSlots(row),
    assignedSlot: row.gi_session_id ?? null,
    status: ((row.gi_status ?? "pending") as GIStatus),
    score: row.gi_score ?? null,
    notes: row.gi_notes ?? "",
  };
}

export function rowToCoffeeChat(row: ApplicantRow) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    year: row.grad_year ?? 0,
    major: row.majors ?? "—",
    gpa: row.gpa ?? "—",
    scheduledDate: row.cc_scheduled_date ?? null,
    scheduledTime: row.cc_scheduled_time ?? null,
    assignedOfficer: row.cc_assigned_officer_name ?? null,
    status: (row.cc_status as CCStatus) || "pending",
    score: row.cc_score ?? null,
    notes: row.cc_notes ?? "",
  };
}

export function rowToDecision(row: ApplicantRow) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    year: row.grad_year ?? 0,
    major: row.majors ?? "—",
    gpa: row.gpa ?? "—",
    giScore: row.gi_score ?? null,
    ccScore: row.cc_score ?? null,
    status: (row.decision_status as DecisionStatus) || "pending",
    notes: row.decision_notes ?? "",
  };
}

export function groupInterviewToPatch(
  patch: Partial<ReturnType<typeof rowToGroupInterview>>,
): OfficerApplicantPatch {
  const out: OfficerApplicantPatch = {};
  if (patch.status !== undefined) out.gi_status = patch.status;
  if (patch.assignedSlot !== undefined) out.gi_session_id = patch.assignedSlot;
  if (patch.score !== undefined) out.gi_score = patch.score;
  if (patch.notes !== undefined) out.gi_notes = patch.notes;
  return out;
}

export function coffeeChatToPatch(
  patch: Partial<ReturnType<typeof rowToCoffeeChat>>,
): OfficerApplicantPatch {
  const out: OfficerApplicantPatch = {};
  if (patch.status !== undefined) out.cc_status = patch.status;
  if (patch.scheduledDate !== undefined) out.cc_scheduled_date = patch.scheduledDate;
  if (patch.scheduledTime !== undefined) out.cc_scheduled_time = patch.scheduledTime;
  if (patch.assignedOfficer !== undefined) {
    out.cc_assigned_officer_name = patch.assignedOfficer;
  }
  if (patch.score !== undefined) out.cc_score = patch.score;
  if (patch.notes !== undefined) out.cc_notes = patch.notes;
  return out;
}

export function decisionToPatch(
  patch: Partial<ReturnType<typeof rowToDecision>>,
): OfficerApplicantPatch {
  const out: OfficerApplicantPatch = {};
  if (patch.status !== undefined) out.decision_status = patch.status;
  if (patch.notes !== undefined) out.decision_notes = patch.notes;
  return out;
}

export type FetchApplicantsOptions = {
  search?: string;
  appStatus?: string;
  giStatus?: string;
  ccStatus?: string;
  decisionStatus?: string;
  limit?: number;
  offset?: number;
};

export async function fetchApplicantsList(
  options: FetchApplicantsOptions & { pipeline?: PipelineStage } = {},
): Promise<{ data?: ApplicantRow[]; total?: number; error?: string }> {
  const params = new URLSearchParams();
  if (options.pipeline) params.set("pipeline", options.pipeline);
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.appStatus && options.appStatus !== "all") {
    params.set("status", options.appStatus);
  }
  if (options.giStatus && options.giStatus !== "all") {
    params.set("gi_status", options.giStatus);
  }
  if (options.ccStatus && options.ccStatus !== "all") {
    params.set("cc_status", options.ccStatus);
  }
  if (options.decisionStatus && options.decisionStatus !== "all") {
    params.set("decision_status", options.decisionStatus);
  }
  params.set("limit", String(options.limit ?? 50));
  if (options.offset) params.set("offset", String(options.offset));

  const res = await fetch(`/api/applicants?${params.toString()}`, {
    credentials: "include",
  });
  const body = (await res.json()) as {
    data?: ApplicantRow[];
    total?: number;
    error?: string;
  };
  if (!res.ok) return { error: body.error ?? "Failed to load applicants." };
  return { data: body.data ?? [], total: body.total ?? 0 };
}

export async function fetchPipelineApplicants(
  stage: PipelineStage,
  options: Omit<FetchApplicantsOptions, "pipeline"> = {},
): Promise<{ data?: ApplicantRow[]; total?: number; error?: string }> {
  return fetchApplicantsList({ ...options, pipeline: stage });
}

export async function patchApplicant(
  id: string,
  patch: OfficerApplicantPatch,
): Promise<{ data?: ApplicantRow; error?: string }> {
  const res = await fetch(`/api/applicants/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const body = (await res.json()) as { data?: ApplicantRow; error?: string };
  if (!res.ok || !body.data) {
    return { error: body.error ?? "Failed to save changes." };
  }
  return { data: body.data };
}
