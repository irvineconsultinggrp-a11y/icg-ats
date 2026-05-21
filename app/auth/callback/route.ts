import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/applicant/dashboard";
  const intent = searchParams.get("intent");

  if (!code) {
    const loginPath = intent === "applicant" ? "/applicant/login" : "/applicant/login";
    return NextResponse.redirect(`${origin}${loginPath}?error=auth`);
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/applicant/login?error=auth`);
  }

  // Tag OAuth sign-ups with the applicant role if not already set
  if (intent === "applicant") {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && !user.user_metadata?.role) {
      await supabase.auth.updateUser({ data: { role: "applicant" } });
    }
  }

  const safeNext = next.startsWith("/") ? next : "/applicant/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
