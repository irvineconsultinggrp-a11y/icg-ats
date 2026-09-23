import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  formToRow,
  parseApplicationFormData,
  uploadResumeForApplication,
} from "@/lib/applicants/form";
import { escapeIlikePattern, parseListApplicantsQuery } from "@/lib/applicants/queries";
import {
  selectColumnsForPipeline,
  type ApplicantPipelineParam,
} from "@/lib/applicants/select-columns";
import { maybeSendApplicationReceivedEmail } from "@/lib/email/maybe-send-application-received-email";
import { notifyApplicantCreated } from "@/lib/google-apps-script";
import { canApplyToPosition } from "@/lib/positions";
import { requireApplicant, requireOfficer } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  const url = new URL(request.url);
  const listQuery = parseListApplicantsQuery(url.searchParams);
  const pipelineParam = url.searchParams.get("pipeline");
  const pipeline: ApplicantPipelineParam =
    pipelineParam === "coffee-chats" ||
    pipelineParam === "interview-schedule" ||
    pipelineParam === "interview-schedule-round-2" ||
    pipelineParam === "round-1" ||
    pipelineParam === "round-2" ||
    pipelineParam === "bbq-social" ||
    pipelineParam === "decisions"
      ? pipelineParam
      : null;

  const admin = createAdminClient();
  const columns = selectColumnsForPipeline(pipeline);

  let query = admin.from("applicants").select(columns, { count: "exact" });
  if (pipeline === "interview-schedule" || pipeline === "round-1") {
    query = query.eq("app_status", "advanced");
  } else if (pipeline === "interview-schedule-round-2") {
    query = query.eq("gi_status", "completed");
  } else if (pipeline === "round-2") {
    query = query.eq("gi_status", "completed");
  } else if (pipeline === "bbq-social") {
    query = query.eq("social_status", "accepted");
  } else if (pipeline === "decisions") {
    query = query.eq("social_status", "accepted");
  }
  // "coffee-chats" has no stage gate: it's an early data-collection surface
  // where members log notes on any applicant.
  if (listQuery.status) {
    query = query.eq("app_status", listQuery.status);
  }
  if (listQuery.gi_status) {
    query = query.eq("gi_status", listQuery.gi_status);
  }
  if (listQuery.r2_status) {
    query = query.eq("r2_status", listQuery.r2_status);
  }
  if (listQuery.cc_status) {
    query = query.eq("cc_status", listQuery.cc_status);
  }
  if (listQuery.social_status) {
    query = query.eq("social_status", listQuery.social_status);
  }
  if (listQuery.decision_status) {
    query = query.eq("decision_status", listQuery.decision_status);
  }
  if (listQuery.position) {
    const term = escapeIlikePattern(listQuery.position);
    query = query.ilike("position", `%${term}%`);
  }
  if (listQuery.search) {
    const term = escapeIlikePattern(listQuery.search);
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,majors.ilike.%${term}%`,
    );
  }
  query = query.order(listQuery.sort, {
    ascending: listQuery.order === "asc",
  });
  query = query.range(
    listQuery.offset,
    listQuery.offset + listQuery.limit - 1,
  );

  const { data, error, count } = await query;

  if (error) {
    console.error("[applicants GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
  });
}

export async function POST(request: Request) {
  const gate = await requireApplicant();
  if ("response" in gate) return gate.response;

  const { user } = gate;
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data" },
      { status: 400 },
    );
  }

  const parsed = parseApplicationFormData(formData);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (!canApplyToPosition(parsed.position)) {
    return NextResponse.json(
      { error: "Applications for this position are closed." },
      { status: 403 },
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: existing } = await supabase
    .from("applicants")
    .select("id")
    .eq("user_id", user.id)
    .eq("position", parsed.position)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: "You have already applied for this position. Edit your existing application instead.",
        applicationId: existing.id,
      },
      { status: 409 },
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("applicants")
    .insert(formToRow(parsed, user.id))
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "You have already applied for this position." },
        { status: 409 },
      );
    }
    console.error("[applicants POST insert]", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  let resumePath: string | null = inserted.resume_path;
  if (parsed.resumeFile) {
    const uploaded = await uploadResumeForApplication(user.id, inserted.id, parsed.resumeFile);
    if ("error" in uploaded) {
      return NextResponse.json({ error: uploaded.error }, { status: 500 });
    }
    resumePath = uploaded.path;
    const admin = createAdminClient();
    const { error: updErr } = await admin
      .from("applicants")
      .update({ resume_path: resumePath })
      .eq("id", inserted.id)
      .eq("user_id", user.id);
    if (updErr) {
      console.error("[applicants POST resume_path]", updErr);
      return NextResponse.json({ error: "Failed to save resume reference" }, { status: 500 });
    }
  }

  const created = { ...inserted, resume_path: resumePath };

  notifyApplicantCreated({
    event: "applicant.created",
    applicant: {
      id: created.id,
      email: created.email,
      firstName: created.first_name,
      lastName: created.last_name,
      position: created.position,
      resumeUrl: created.resume_path,
      createdAt: created.created_at,
    },
  });

  const applicationReceivedEmail = await maybeSendApplicationReceivedEmail(created.id);

  return NextResponse.json(
    { data: created, applicationReceivedEmail },
    { status: 201 },
  );
}
