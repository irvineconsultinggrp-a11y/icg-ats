import { NextResponse } from "next/server";
import {
  getTransactionalTemplate,
  isTransactionalEmailId,
  renderTransactionalEmail,
  templateVarsFromApplicant,
} from "@/lib/email/transactional-templates";
import { requireOfficer } from "@/lib/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  const url = new URL(request.url);
  const templateId = url.searchParams.get("templateId") ?? "";
  const applicantId = url.searchParams.get("applicantId") ?? "";

  if (!isTransactionalEmailId(templateId)) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }
  if (!applicantId) {
    return NextResponse.json({ error: "Missing applicantId." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("applicants")
    .select("first_name, last_name, email")
    .eq("id", applicantId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Applicant not found." }, { status: 404 });

  const meta = getTransactionalTemplate(templateId);
  const vars = templateVarsFromApplicant({
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
  });
  const rendered = renderTransactionalEmail(templateId, vars);

  return NextResponse.json({
    templateId,
    templateName: meta.name,
    to: row.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}
