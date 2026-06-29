import { NextResponse } from "next/server";

import { requireOfficer } from "@/lib/auth/session";

import { createAdminClient } from "@/utils/supabase/admin";

export type ApplicantStats = {
  total: number;
  byStatus: {
    new: number;
    reviewing: number;
    advanced: number;
    rejected: number;
  };
  pipeline: {
    groupInterview: number;
    coffeeChats: number;
    decisions: number;
    pendingDecisions: number;
  };
  giByStatus: {
    total: number;
    pending: number;
    scheduled: number;
    completed: number;
    rejected: number;
  };
  ccByStatus: {
    total: number;
    pending: number;
    scheduled: number;
    completed: number;
    rejected: number;
  };
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

async function countPendingDecisions(
  admin: ReturnType<typeof createAdminClient>,
): Promise<number> {
  const { count, error } = await admin
    .from("applicants")
    .select("id", { count: "exact", head: true })
    .eq("cc_status", "completed")
    .eq("decision_status", "pending");
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
      giPending,
      giScheduled,
      giCompleted,
      giRejected,
      ccPending,
      ccScheduled,
      ccCompleted,
      ccRejected,
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
      settledCount("giPending", () =>
        countWhere(admin, { app_status: "advanced", gi_status: "pending" }),
      ),
      settledCount("giScheduled", () =>
        countWhere(admin, { app_status: "advanced", gi_status: "scheduled" }),
      ),
      settledCount("giCompleted", () =>
        countWhere(admin, { app_status: "advanced", gi_status: "completed" }),
      ),
      settledCount("giRejected", () =>
        countWhere(admin, { app_status: "advanced", gi_status: "rejected" }),
      ),
      settledCount("ccPending", () =>
        countWhere(admin, { gi_status: "completed", cc_status: "pending" }),
      ),
      settledCount("ccScheduled", () =>
        countWhere(admin, { gi_status: "completed", cc_status: "scheduled" }),
      ),
      settledCount("ccCompleted", () =>
        countWhere(admin, { gi_status: "completed", cc_status: "completed" }),
      ),
      settledCount("ccRejected", () =>
        countWhere(admin, { gi_status: "completed", cc_status: "rejected" }),
      ),
    ]);

    if (recentResult.error) throw recentResult.error;

    const [groupInterview, coffeeChats, decisions, pendingDecisions, pendingRequests] =
      await Promise.all([
        settledCount("groupInterview", () => countWhere(admin, { app_status: "advanced" })),
        settledCount("coffeeChats", () => countWhere(admin, { gi_status: "completed" })),
        settledCount("decisions", () => countWhere(admin, { cc_status: "completed" })),
        settledCount("pendingDecisions", () => countPendingDecisions(admin)),
        settledCount("pendingCoffeeChatRequests", () =>
          countPendingCoffeeChatRequests(admin),
        ),
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
        groupInterview,
        coffeeChats,
        decisions,
        pendingDecisions,
      },
      giByStatus: {
        total: groupInterview,
        pending: giPending,
        scheduled: giScheduled,
        completed: giCompleted,
        rejected: giRejected,
      },
      ccByStatus: {
        total: coffeeChats,
        pending: ccPending,
        scheduled: ccScheduled,
        completed: ccCompleted,
        rejected: ccRejected,
      },
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
