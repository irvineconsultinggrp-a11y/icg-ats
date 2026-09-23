import { NextResponse } from "next/server";
import { fetchLatestTransactionalEmailSend } from "@/lib/email/fetch-transactional-email-sends";
import { isTransactionalEmailId } from "@/lib/email/transactional-templates";
import { requireOfficer } from "@/lib/auth/session";

export async function GET(request: Request) {
  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  const params = new URL(request.url).searchParams;
  const applicantId = params.get("applicantId")?.trim();
  const templateId = params.get("templateId")?.trim() ?? "";

  if (!applicantId) {
    return NextResponse.json({ error: "Missing applicantId." }, { status: 400 });
  }
  if (!isTransactionalEmailId(templateId)) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }

  const { record, error } = await fetchLatestTransactionalEmailSend({
    applicantId,
    templateId,
  });
  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({
    sent: Boolean(record),
    sentAt: record?.sentAt ?? null,
  });
}
