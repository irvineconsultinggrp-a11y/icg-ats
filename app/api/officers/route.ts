import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireOfficer } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("officers")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[officers GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
