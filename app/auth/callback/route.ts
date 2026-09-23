import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isApplicantEmailAllowed } from "@/lib/auth/applicant-email";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/applicant/dashboard";
  const intent = searchParams.get("intent");

  if (!code) {
    const fallback = next.startsWith("/officer/")
      ? `${origin}/officer/login?error=auth`
      : `${origin}/applicant/login?error=auth`;
    return NextResponse.redirect(fallback);
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const fallback = next.startsWith("/officer/")
      ? `${origin}/officer/login?error=auth`
      : `${origin}/applicant/login?error=auth`;
    return NextResponse.redirect(fallback);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (intent === "officer") {
    if (user?.app_metadata?.role !== "officer") {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/officer/login?error=role`);
    }
  }

  if (intent === "applicant") {
    if (user?.email && !isApplicantEmailAllowed(user.email)) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/applicant/login?error=email_domain`,
      );
    }
    if (user && user.app_metadata?.role !== "applicant" && user.app_metadata?.role !== "officer") {
      try {
        const admin = createAdminClient();
        await admin.auth.admin.updateUserById(user.id, {
          app_metadata: { ...user.app_metadata, role: "applicant" },
        });
      } catch (e) {
        console.error("[auth/callback ensure-role]", e);
      }
    }
  }

  const safeNext = next.startsWith("/") ? next : "/applicant/dashboard";
  const dest = new URL(safeNext, origin);
  return NextResponse.redirect(dest);
}
