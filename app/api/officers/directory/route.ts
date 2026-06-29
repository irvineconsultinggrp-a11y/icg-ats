import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireApplicant } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";

/** Public officer directory for applicants (browse + coffee chat requests). */
export async function GET() {
  const gate = await requireApplicant();
  if ("response" in gate) return gate.response;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("officers")
    .select(
      "id, name, email, role, category, avatar_url, class_year, hobbies, calendly_link",
    )
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[officers/directory GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
