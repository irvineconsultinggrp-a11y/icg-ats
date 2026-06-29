import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  assertCanEditPosition,
  formToRow,
  parseApplicationFormData,
  uploadResumeForApplication,
} from "@/lib/applicants/form";
import { parseOfficerApplicantPatch } from "@/lib/applicants/stages";
import { roleFromUser, requireOfficer } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const RESUME_BUCKET = "resumes";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = roleFromUser(user);
  const { data: row, error } = await supabase
    .from("applicants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[applicants/[id] GET]", error);
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
  const resumeObjectPath = row.resume_path ?? null;
  if (resumeObjectPath && (role === "officer" || isOwner)) {
    try {
      const admin = createAdminClient();
      const { data: signed, error: signErr } = await admin.storage
        .from(RESUME_BUCKET)
        .createSignedUrl(resumeObjectPath, 3600);
      if (!signErr && signed?.signedUrl) {
        resumeSignedUrl = signed.signedUrl;
      }
    } catch (e) {
      console.error("[applicants/[id] signed url]", e);
    }
  }

  return NextResponse.json({
    data: row,
    resumeSignedUrl,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = roleFromUser(user);
  const { data: row, error: fetchError } = await supabase
    .from("applicants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("[applicants/[id] PATCH fetch]", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = row.user_id === user.id;
  const contentType = request.headers.get("content-type") ?? "";

  if (isOwner && role === "applicant" && contentType.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
    }

    const parsed = parseApplicationFormData(formData);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (parsed.position !== row.position) {
      return NextResponse.json({ error: "Cannot change position on an existing application." }, { status: 400 });
    }

    const deadlineError = assertCanEditPosition(parsed.position);
    if (deadlineError) {
      return NextResponse.json({ error: deadlineError }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("applicants")
      .update(formToRow(parsed, user.id))
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .maybeSingle();

    if (updateError) {
      console.error("[applicants/[id] PATCH applicant]", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    let resumePath = updated?.resume_path ?? row.resume_path;
    if (parsed.resumeFile) {
      const uploaded = await uploadResumeForApplication(user.id, id, parsed.resumeFile);
      if ("error" in uploaded) {
        return NextResponse.json({ error: uploaded.error }, { status: 500 });
      }
      resumePath = uploaded.path;
      const admin = createAdminClient();
      await admin.from("applicants").update({ resume_path: resumePath }).eq("id", id);
    }

    return NextResponse.json({ data: { ...updated, resume_path: resumePath } });
  }

  if (role !== "officer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseOfficerApplicantPatch(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("applicants")
    .update(parsed.patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[applicants/[id] PATCH officer]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
