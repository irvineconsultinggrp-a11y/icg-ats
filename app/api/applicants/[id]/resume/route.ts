import { cookies } from "next/headers";

import { NextResponse } from "next/server";

import { roleFromUser } from "@/lib/auth/session";

import { createClient } from "@/utils/supabase/server";

import { createAdminClient } from "@/utils/supabase/admin";



const RESUME_BUCKET = "resumes";



type RouteContext = { params: Promise<{ id: string }> };



/** Lightweight resume signed URL — avoids loading the full applicant row. */

export async function GET(_request: Request, context: RouteContext) {

  const { id } = await context.params;

  if (!id) {

    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  }



  const cookieStore = await cookies();

  const supabase = createClient(cookieStore);

  const {

    data: { user },

  } = await supabase.auth.getUser();

  if (!user) {

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  }



  const role = roleFromUser(user);

  const { data: row, error } = await supabase

    .from("applicants")

    .select("user_id, resume_path")

    .eq("id", id)

    .maybeSingle();



  if (error) {

    console.error("[applicants/[id]/resume GET]", error);

    return NextResponse.json({ error: error.message }, { status: 500 });

  }

  if (!row) {

    return NextResponse.json({ error: "Not found" }, { status: 404 });

  }



  const isOwner = row.user_id === user.id;

  if (role !== "officer" && !isOwner) {

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  }



  let resumeSignedUrl: string | null = null;

  if (row.resume_path) {

    try {

      const admin = createAdminClient();

      const { data: signed, error: signErr } = await admin.storage

        .from(RESUME_BUCKET)

        .createSignedUrl(row.resume_path, 3600);

      if (!signErr && signed?.signedUrl) {

        resumeSignedUrl = signed.signedUrl;

      }

    } catch (e) {

      console.error("[applicants/[id]/resume signed url]", e);

    }

  }



  return NextResponse.json({ resumeSignedUrl });

}

