import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireApplicant } from "@/lib/auth/session";
import { canApplyToPosition, canEditApplication } from "@/lib/positions";
import { APPLICANT_MINE_LIST_COLUMNS } from "@/lib/applicants/select-columns";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const gate = await requireApplicant();
  if ("response" in gate) return gate.response;

  const { user } = gate;
  const url = new URL(request.url);
  const position = url.searchParams.get("position")?.trim() || null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (position) {
    const { data, error } = await supabase
      .from("applicants")
      .select("*")
      .eq("user_id", user.id)
      .eq("position", position)
      .maybeSingle();

    if (error) {
      console.error("[applicants/mine GET]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? null,
      canEdit: data ? canEditApplication(position) : canApplyToPosition(position),
    });
  }

  const { data, error } = await supabase
    .from("applicants")
    .select(APPLICANT_MINE_LIST_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[applicants/mine GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  return NextResponse.json({
    data: rows,
    meta: rows.map((row) => ({
      position: row.position as string,
      canEdit: canEditApplication(row.position as string),
    })),
  });
}
