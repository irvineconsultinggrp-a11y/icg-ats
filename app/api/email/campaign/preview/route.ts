import { NextResponse } from "next/server";
import { getCampaignMeta, renderCampaignEmail } from "@/lib/email/campaign-templates";
import { resolveCampaignRecipients } from "@/lib/email/campaign-recipients";
import { varsFromRecipient } from "@/lib/email/render-template";
import type { CampaignPreviewRequest, EmailCampaignId } from "@/lib/email/types";
import { requireOfficer } from "@/lib/auth/session";

function parseCampaign(raw: string | undefined): EmailCampaignId | null {
  if (raw === "round-1" || raw === "round-2" || raw === "bbq") return raw;
  return null;
}

export async function POST(request: Request) {
  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  let body: CampaignPreviewRequest;
  try {
    body = (await request.json()) as CampaignPreviewRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const campaign = parseCampaign(body.campaign);
  if (!campaign) {
    return NextResponse.json({ error: "Invalid campaign." }, { status: 400 });
  }
  if (campaign === "bbq") {
    body.scope = "all-assigned";
  } else if (body.scope !== "time-block" && body.scope !== "room" && body.scope !== "all-assigned") {
    return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
  }

  const { recipients, error } = await resolveCampaignRecipients({ ...body, campaign });
  if (error) return NextResponse.json({ error }, { status: 400 });

  const meta = getCampaignMeta(campaign);
  const sample = recipients[0];
  const sampleRendered = sample
    ? renderCampaignEmail(campaign, varsFromRecipient(sample, meta.roundLabel))
    : null;

  return NextResponse.json({
    campaign,
    campaignLabel: meta.label,
    recipients,
    recipientCount: recipients.length,
    sampleSubject: sampleRendered?.subject ?? meta.subject,
    sampleHtml: sampleRendered?.html ?? meta.html,
  });
}
