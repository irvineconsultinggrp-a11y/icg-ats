import { NextResponse } from "next/server";
import { renderCampaignEmail, getCampaignMeta } from "@/lib/email/campaign-templates";
import { resolveCampaignRecipients } from "@/lib/email/campaign-recipients";
import { varsFromRecipient } from "@/lib/email/render-template";
import { logScheduleEmailSend } from "@/lib/email/schedule-email-sends";
import { sendEmail } from "@/lib/email/send-email";
import type { CampaignPreviewRequest, EmailCampaignId } from "@/lib/email/types";
import { requireOfficer } from "@/lib/auth/session";

function parseCampaign(raw: string | undefined): EmailCampaignId | null {
  if (raw === "round-1" || raw === "round-2" || raw === "bbq") return raw;
  return null;
}

export async function POST(request: Request) {
  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  let body: CampaignPreviewRequest & {
    confirmed?: boolean;
    recipientIds?: string[];
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.confirmed !== true) {
    return NextResponse.json(
      { error: "Confirm the recipient list before sending." },
      { status: 400 },
    );
  }

  const campaign = parseCampaign(body.campaign);
  if (!campaign) {
    return NextResponse.json({ error: "Invalid campaign." }, { status: 400 });
  }

  const { recipients, error } = await resolveCampaignRecipients({ ...body, campaign });
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (recipients.length === 0) {
    return NextResponse.json({ error: "No recipients match this selection." }, { status: 400 });
  }

  const idSet = body.recipientIds?.length
    ? new Set(body.recipientIds)
    : null;
  const toSend = idSet
    ? recipients.filter((r) => idSet.has(r.applicantId))
    : recipients;

  if (toSend.length === 0) {
    return NextResponse.json({ error: "No matching recipients to send." }, { status: 400 });
  }

  const meta = getCampaignMeta(campaign);
  const officerId = gate.user.id;
  const results: {
    applicantId: string;
    email: string;
    ok: boolean;
    error?: string;
    logId?: string;
  }[] = [];

  for (const recipient of toSend) {
    const rendered = renderCampaignEmail(
      campaign,
      varsFromRecipient(recipient, meta.roundLabel),
    );
    const sent = await sendEmail({
      to: recipient.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
    let logId: string | undefined;
    if (sent.ok) {
      const logged = await logScheduleEmailSend({
        applicantId: recipient.applicantId,
        campaign,
        recipient,
        sentBy: officerId,
        resendMessageId: sent.id,
      });
      if (logged.error) {
        console.error("schedule email log failed:", logged.error);
      } else {
        logId = logged.record?.id;
      }
    }

    results.push({
      applicantId: recipient.applicantId,
      email: recipient.email,
      ok: sent.ok,
      error: sent.ok ? undefined : sent.error,
      logId,
    });
    if (!sent.ok && sent.dryRun) {
      return NextResponse.json(
        {
          error: sent.error,
          dryRun: true,
          results,
        },
        { status: 503 },
      );
    }
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    return NextResponse.json(
      {
        error: `Failed to send ${failed.length} of ${results.length} emails.`,
        results,
        sent: results.length - failed.length,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    sent: results.length,
    results,
  });
}
