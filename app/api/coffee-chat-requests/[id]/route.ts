import { NextResponse } from "next/server";
import { requireApplicant, requireOfficer } from "@/lib/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

const ALLOWED = new Set(["pending", "accepted", "declined", "completed", "canceled"]);

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.status || !ALLOWED.has(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const officerGate = await requireOfficer();
  if (!("response" in officerGate)) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("coffee_chat_requests")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[coffee-chat-requests PATCH officer]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data });
  }

  const applicantGate = await requireApplicant();
  if ("response" in applicantGate) return applicantGate.response;

  if (body.status !== "canceled") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("coffee_chat_requests")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("applicant_user_id", applicantGate.user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[coffee-chat-requests PATCH applicant]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data });
}
