import { NextResponse } from "next/server";
import { fetchScheduleEmailSends } from "@/lib/email/schedule-email-sends";
import type { EmailCampaignId } from "@/lib/email/types";
import { requireOfficer } from "@/lib/auth/session";

function parseCampaign(raw: string | null): EmailCampaignId | null {
  if (raw === "round-1" || raw === "round-2" || raw === "bbq") return raw;
  return null;
}

export async function GET(request: Request) {
  const gate = await requireOfficer();
  if ("response" in gate) return gate.response;

  const campaign = parseCampaign(new URL(request.url).searchParams.get("campaign"));
  if (!campaign) {
    return NextResponse.json({ error: "Invalid campaign." }, { status: 400 });
  }

  const { records, error } = await fetchScheduleEmailSends(campaign);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ records });
}
