import { NextResponse } from "next/server";
import { isTransactionalEmailId } from "@/lib/email/transactional-templates";
import { sendTransactionalEmailToApplicant } from "@/lib/email/send-transactional-email";
import { requireOfficer } from "@/lib/auth/session";

export async function POST(request: Request) {
  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  let body: { applicantId?: string; templateId?: string; confirmed?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.confirmed !== true) {
    return NextResponse.json(
      { error: "Confirm before sending this email." },
      { status: 400 },
    );
  }

  const templateId = body.templateId ?? "";
  if (!isTransactionalEmailId(templateId)) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }
  if (!body.applicantId) {
    return NextResponse.json({ error: "Missing applicantId." }, { status: 400 });
  }

  const result = await sendTransactionalEmailToApplicant({
    applicantId: body.applicantId,
    templateId,
    sentBy: gate.user.id,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, dryRun: result.dryRun },
      { status: result.dryRun ? 503 : 502 },
    );
  }

  return NextResponse.json({ ok: true, messageId: result.messageId });
}
