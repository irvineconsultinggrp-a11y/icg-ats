import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireApplicant, requireOfficer } from "@/lib/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");

  if (scope === "officer") {
    const gate = await requireOfficer();
    if ("response" in gate) return gate.response;

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("coffee_chat_requests")
      .select(
        "id, applicant_user_id, applicant_id, officer_id, status, message, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[coffee-chat-requests GET officer]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: data ?? [] });
  }

  const gate = await requireApplicant();
  if ("response" in gate) return gate.response;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("coffee_chat_requests")
    .select("id, officer_id, status, created_at")
    .eq("applicant_user_id", gate.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[coffee-chat-requests GET mine]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const gate = await requireApplicant();
  if ("response" in gate) return gate.response;

  let body: { officerId?: string; message?: string };
  try {
    body = (await request.json()) as { officerId?: string; message?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.officerId?.trim()) {
    return NextResponse.json({ error: "officerId is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: application } = await supabase
    .from("applicants")
    .select("id")
    .eq("user_id", gate.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: existing } = await supabase
    .from("coffee_chat_requests")
    .select("id")
    .eq("applicant_user_id", gate.user.id)
    .eq("officer_id", body.officerId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You already have a pending request with this officer." },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("coffee_chat_requests")
    .insert({
      applicant_user_id: gate.user.id,
      applicant_id: application?.id ?? null,
      officer_id: body.officerId,
      message: body.message?.trim() ?? "",
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You already have a pending request with this officer." },
        { status: 409 },
      );
    }
    console.error("[coffee-chat-requests POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
