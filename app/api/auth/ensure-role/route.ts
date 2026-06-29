import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  APPLICANT_EMAIL_ERROR,
  isApplicantEmailAllowed,
} from "@/lib/auth/applicant-email";
import { createAdminClient } from "@/utils/supabase/admin";

/** Self-assign applicant role after signup/login (officers must be set in Supabase dashboard). */
export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.email && !isApplicantEmailAllowed(user.email)) {
    return NextResponse.json({ error: APPLICANT_EMAIL_ERROR }, { status: 403 });
  }

  if (user.app_metadata?.role === "applicant") {
    return NextResponse.json({ ok: true, role: "applicant" });
  }

  if (user.app_metadata?.role === "officer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, role: "applicant" },
    });
    if (error) {
      console.error("[ensure-role]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (e) {
    console.error("[ensure-role admin]", e);
    return NextResponse.json(
      { error: "Server configuration error (service role?)" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, role: "applicant" });
}
