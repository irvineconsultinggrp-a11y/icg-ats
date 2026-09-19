import { NextResponse } from "next/server";
import { requireOfficer } from "@/lib/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";
import type { NoteSignalCounts } from "@/lib/applicants/note-signal";

type SignalRow = { applicant_id: string; signal: string | null };

export async function GET() {
  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("applicant_notes")
    .select("applicant_id, signal")
    .not("signal", "is", null);

  if (error) {
    console.error("[applicants/note-signals GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byApplicant: Record<string, NoteSignalCounts> = {};
  for (const row of (data ?? []) as SignalRow[]) {
    if (!row.applicant_id || !row.signal) continue;
    const bucket =
      byApplicant[row.applicant_id] ?? { green: 0, yellow: 0, red: 0 };
    if (row.signal === "green") bucket.green += 1;
    else if (row.signal === "yellow") bucket.yellow += 1;
    else if (row.signal === "red") bucket.red += 1;
    byApplicant[row.applicant_id] = bucket;
  }

  return NextResponse.json({ data: byApplicant });
}
