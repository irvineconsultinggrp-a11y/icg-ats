import type { EmailCampaignId } from "./types";
import { renderTemplateString, type TemplateVars } from "./render-template";

/**
 * Edit these templates when copy is finalized. Supported placeholders:
 * {{firstName}}, {{lastName}}, {{fullName}}, {{email}}, {{room}}, {{roomLabel}},
 * {{location}}, {{timeBlock}}, {{scheduleDate}}, {{roundLabel}}
 */
const TEMPLATES: Record<
  EmailCampaignId,
  { label: string; subject: string; html: string; text: string; roundLabel: string }
> = {
  "round-1": {
    label: "Round 1 interview schedule",
    roundLabel: "Round 1",
    subject: "[ACTION REQUIRED] Round 1 Interview for Irvine Consulting Group",
    text: `Hello {{firstName}},

Congratulations on moving to the first round of ICG interviews for the Junior Associate program!

This interview will consist of 2 parts: a 45-minute individual case study and a 30-minute behavioral interview. We are looking forward to learning more about you and your skills.

Logistics:
- Time: {{timeBlock}} — {{scheduleDate}}
- Room: {{roomLabel}} (building {{location}})
- Dress code: Business professional

We strongly recommend an in-person interview so our team can get to know you better. Please reach out if you have any questions.

Best,
ICG Recruitment Team`,
    html: `<p>Hello {{firstName}},</p>
<p>Congratulations on moving to the <strong>first round</strong> of ICG interviews for the Junior Associate program!</p>
<p>This interview will consist of 2 parts: a <strong>45-minute individual case study</strong> and a <strong>30-minute behavioral interview</strong>. We are looking forward to learning more about you and your skills.</p>
<p><strong>Logistics:</strong></p>
<ul>
<li><strong>Time:</strong> {{timeBlock}} — {{scheduleDate}}</li>
<li><strong>Room:</strong> {{roomLabel}} (building {{location}})</li>
<li><strong>Dress code:</strong> Business professional</li>
</ul>
<p>We strongly recommend an in-person interview so our team can get to know you better. Please reach out if you have any questions.</p>
<p>Best,<br/>ICG Recruitment Team</p>`,
  },
  "round-2": {
    label: "Round 2 / final interview schedule",
    roundLabel: "Round 2",
    subject: "[ACTION REQUIRED] Final Interview for Irvine Consulting Group",
    text: `Hello {{firstName}},

Congratulations on moving to the second round of ICG interviews for the Junior Associate program!

This interview will consist of 2 parts: a 45-minute individual case study and a 30-minute behavioral interview. We are looking forward to learning more about you and your skills.

Logistics:
- Time: {{timeBlock}} — {{scheduleDate}}
- Room: {{roomLabel}} (building {{location}})
- Dress code: Business professional

We strongly recommend an in-person interview so our team can get to know you better. Please reach out if you have any questions.

Best,
ICG Recruitment Team`,
    html: `<p>Hello {{firstName}},</p>
<p>Congratulations on moving to the <strong>second round</strong> of ICG interviews for the Junior Associate program!</p>
<p>This interview will consist of 2 parts: a <strong>45-minute individual case study</strong> and a <strong>30-minute behavioral interview</strong>. We are looking forward to learning more about you and your skills.</p>
<p><strong>Logistics:</strong></p>
<ul>
<li><strong>Time:</strong> {{timeBlock}} — {{scheduleDate}}</li>
<li><strong>Room:</strong> {{roomLabel}} (building {{location}})</li>
<li><strong>Dress code:</strong> Business professional</li>
</ul>
<p>We strongly recommend an in-person interview so our team can get to know you better. Please reach out if you have any questions.</p>
<p>Best,<br/>ICG Recruitment Team</p>`,
  },
  bbq: {
    label: "BBQ Social invitation",
    roundLabel: "BBQ Social",
    subject: "You're invited — ICG Fall 2026 BBQ Social",
    text: `Hi {{firstName}},

Congratulations! You've been invited to the ICG BBQ Social — a casual evening with the team (no technical interviews).

We will follow up with date, time, and location details soon. Reply to this email if you have any conflicts.

— Irvine Consulting Group Recruitment`,
    html: `<p>Hi {{firstName}},</p>
<p>Congratulations! You've been invited to the <strong>ICG BBQ Social</strong> — a casual evening with the team (no technical interviews).</p>
<p>We will follow up with date, time, and location details soon. Reply to this email if you have any conflicts.</p>
<p>— Irvine Consulting Group Recruitment</p>`,
  },
};

export function getCampaignMeta(campaign: EmailCampaignId) {
  return TEMPLATES[campaign];
}

export function renderCampaignEmail(campaign: EmailCampaignId, vars: TemplateVars) {
  const t = TEMPLATES[campaign];
  return {
    subject: renderTemplateString(t.subject, vars),
    html: renderTemplateString(t.html, vars),
    text: renderTemplateString(t.text, vars),
  };
}
