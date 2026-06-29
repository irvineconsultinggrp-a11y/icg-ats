import {
  APPLICANT_SORT_COLUMNS,
  type ApplicantSortColumn,
  type ListApplicantsQuery,
} from "@/lib/types/database";

export const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

export function sanitizeStorageFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  return base || "resume";
}

/** Basic ilike term hardening for PostgREST `.or()` filter strings */
export function escapeIlikePattern(s: string): string {
  return s.replace(/[%_]/g, "\\$&");
}

export function parseListApplicantsQuery(
  searchParams: URLSearchParams,
): ListApplicantsQuery {
  const searchRaw = searchParams.get("search");
  const search =
    searchRaw && searchRaw.trim().length > 0 ? searchRaw.trim() : null;

  const statusRaw = searchParams.get("status");
  const status =
    statusRaw && statusRaw !== "all" && statusRaw.trim().length > 0
      ? statusRaw.trim()
      : null;

  const positionRaw = searchParams.get("position");
  const position =
    positionRaw && positionRaw.trim().length > 0 ? positionRaw.trim() : null;

  const sortRaw = searchParams.get("sort");
  const sort: ApplicantSortColumn =
    sortRaw &&
    (APPLICANT_SORT_COLUMNS as readonly string[]).includes(sortRaw)
      ? (sortRaw as ApplicantSortColumn)
      : "created_at";

  const orderParam = searchParams.get("order");
  const order: "asc" | "desc" =
    orderParam === "asc" || orderParam === "desc" ? orderParam : "desc";

  let limit = Number.parseInt(searchParams.get("limit") ?? "50", 10);
  if (!Number.isFinite(limit) || limit < 1) limit = 50;
  if (limit > 100) limit = 100;

  let offset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  if (!Number.isFinite(offset) || offset < 0) offset = 0;

  const giStatusRaw = searchParams.get("gi_status");
  const gi_status =
    giStatusRaw && giStatusRaw !== "all" && giStatusRaw.trim().length > 0
      ? giStatusRaw.trim()
      : null;

  const ccStatusRaw = searchParams.get("cc_status");
  const cc_status =
    ccStatusRaw && ccStatusRaw !== "all" && ccStatusRaw.trim().length > 0
      ? ccStatusRaw.trim()
      : null;

  const decisionStatusRaw = searchParams.get("decision_status");
  const decision_status =
    decisionStatusRaw &&
    decisionStatusRaw !== "all" &&
    decisionStatusRaw.trim().length > 0
      ? decisionStatusRaw.trim()
      : null;

  return {
    search,
    status,
    position,
    sort,
    order,
    limit,
    offset,
    gi_status,
    cc_status,
    decision_status,
  };
}
