import { NextResponse } from "next/server";

import { requireOfficer } from "@/lib/auth/session";

import { createAdminClient } from "@/utils/supabase/admin";

export type RoundStatusCounts = {
  total: number;
  pending: number;
  scheduled: number;
  completed: number;
  rejected: number;
};

export type ApplicantStats = {
  total: number;
  byStatus: {
    new: number;
    reviewing: number;
    advanced: number;
    rejected: number;
  };
  pipeline: {
    coffeeChats: number;
    round1: number;
    round2: number;
    bbqSocial: number;
    decisions: number;
    pendingDecisions: number;
  };
  /** Individual Round 1 (gi_*) status breakdown. */
  r1ByStatus: RoundStatusCounts;
  /** Individual Round 2 (r2_*) status breakdown. */
  r2ByStatus: RoundStatusCounts;
  /** Coffee-chat status breakdown (across all applicants). */
  ccByStatus: RoundStatusCounts;
  pendingCoffeeChatRequests: number;
  recent: {
    id: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  }[];
};

function formatDbError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return "Unknown database error";
}

async function countWhere(
  admin: ReturnType<typeof createAdminClient>,
  filters: Record<string, string>,
): Promise<number> {
  let query = admin.from("applicants").select("id", { count: "exact", head: true });
  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function countPendingCoffeeChatRequests(
  admin: ReturnType<typeof createAdminClient>,
): Promise<number> {
  const { count, error } = await admin
    .from("coffee_chat_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}

async function settledCount(
  label: string,
  fn: () => Promise<number>,
): Promise<number> {
  try {
    return await fn();
  } catch (error) {
    console.warn(`[applicants/stats GET] ${label}:`, formatDbError(error));
    return 0;
  }
}

/** Status breakdown for a round, scoped by an upstream gate. */
async function roundBreakdown(
  admin: ReturnType<typeof createAdminClient>,
  statusColumn: "gi_status" | "r2_status" | "cc_status",
  gate: Record<string, string>,
): Promise<RoundStatusCounts> {
  const [total, pending, scheduled, completed, rejected] = await Promise.all([
    settledCount(`${statusColumn}-total`, () => countWhere(admin, gate)),
    settledCount(`${statusColumn}-pending`, () => countWhere(admin, { ...gate, [statusColumn]: "pending" })),
    settledCount(`${statusColumn}-scheduled`, () => countWhere(admin, { ...gate, [statusColumn]: "scheduled" })),
    settledCount(`${statusColumn}-completed`, () => countWhere(admin, { ...gate, [statusColumn]: "completed" })),
    settledCount(`${statusColumn}-rejected`, () => countWhere(admin, { ...gate, [statusColumn]: "rejected" })),
  ]);
  return { total, pending, scheduled, completed, rejected };
}

export async function GET() {
  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error("[applicants/stats GET] admin client:", formatDbError(error));
    return NextResponse.json(
      { error: "Server configuration error (Supabase service role?)" },
      { status: 500 },
    );
  }

  try {
    const [
      total,
      newCount,
      reviewingCount,
      advancedCount,
      rejectedCount,
      recentResult,
      r1ByStatus,
      r2ByStatus,
      ccByStatus,
    ] = await Promise.all([
      countWhere(admin, {}),
      countWhere(admin, { app_status: "new" }),
      countWhere(admin, { app_status: "reviewing" }),
      countWhere(admin, { app_status: "advanced" }),
      countWhere(admin, { app_status: "rejected" }),
      admin
        .from("applicants")
        .select("id, first_name, last_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      roundBreakdown(admin, "gi_status", { app_status: "advanced" }),
      roundBreakdown(admin, "r2_status", { gi_status: "completed" }),
      roundBreakdown(admin, "cc_status", {}),
    ]);

    if (recentResult.error) throw recentResult.error;

    const [bbqSocial, pendingDecisions, pendingRequests] = await Promise.all([
      settledCount("bbqSocial", () => countWhere(admin, { social_status: "accepted" })),
      settledCount("pendingDecisions", () =>
        countWhere(admin, { social_status: "accepted", decision_status: "pending" }),
      ),
      settledCount("pendingCoffeeChatRequests", () => countPendingCoffeeChatRequests(admin)),
    ]);

    const stats: ApplicantStats = {
      total,
      byStatus: {
        new: newCount,
        reviewing: reviewingCount,
        advanced: advancedCount,
        rejected: rejectedCount,
      },
      pipeline: {
        coffeeChats: total,
        round1: r1ByStatus.total,
        round2: r2ByStatus.total,
        bbqSocial,
        decisions: bbqSocial,
        pendingDecisions,
      },
      r1ByStatus,
      r2ByStatus,
      ccByStatus,
      pendingCoffeeChatRequests: pendingRequests,
      recent: (recentResult.data ?? []).map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        createdAt: row.created_at,
      })),
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("[applicants/stats GET]", formatDbError(error), error);
    return NextResponse.json(
      { error: formatDbError(error) || "Failed to load stats" },
      { status: 500 },
    );
  }
}
