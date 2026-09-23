export type EmailCampaignId = "round-1" | "round-2" | "bbq";

export function campaignFromRound(round: 1 | 2): EmailCampaignId {
  return round === 1 ? "round-1" : "round-2";
}

export type EmailCampaignScope = "time-block" | "room" | "all-assigned";

export type EmailRecipient = {
  applicantId: string;
  email: string;
  firstName: string;
  lastName: string;
  room: string | null;
  timeBlock: string | null;
  scheduleDate: string | null;
};

export type CampaignPreviewRequest = {
  campaign: EmailCampaignId;
  scope: EmailCampaignScope;
  scheduleDay?: string;
  slotId?: string;
  room?: string;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};
