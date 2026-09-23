import {
  stripLegacyTemplateFooter,
  wrapEmailHtml,
  wrapEmailText,
} from "@/lib/email/email-branding";
import { renderTemplateString, type TemplateVars } from "@/lib/email/render-template";

export type TransactionalEmailId =
  | "app-received"
  | "app-not-selected"
  | "cc-invitation"
  | "cc-reminder"
  | "round-1-reject"
  | "round-2-reject"
  | "decision-accept"
  | "decision-reject";

export type TransactionalEmailMeta = {
  id: TransactionalEmailId;
  name: string;
  description: string;
  subject: string;
  html: string;
  text: string;
};

const TEMPLATES: Record<TransactionalEmailId, TransactionalEmailMeta> = {
  "app-received": {
    id: "app-received",
    name: "Application Received",
    description: "Confirm receipt of application",
    subject: "Your ICG Application Has Been Received",
    html: `<p>Dear <strong>{{firstName}}</strong>,</p>
<p>Thank you for applying to <strong>Irvine Consulting Group (ICG)</strong> for the <strong>Junior Associate</strong> position for <strong>Fall 2026</strong>.</p>
<p>We have successfully received your application and our team will be reviewing it shortly. You can expect to hear back from us regarding next steps within the next <strong>1 to 2 weeks</strong>.</p>
<p>In the meantime, if you have any questions, feel free to reach out by replying to this email.</p>
<p>We appreciate your interest in ICG and look forward to learning more about you!</p>`,
    text: `Dear {{firstName}},

Thank you for applying to Irvine Consulting Group (ICG) for the Junior Associate position for Fall 2026.

We have successfully received your application and our team will be reviewing it shortly. You can expect to hear back from us regarding next steps within the next 1 to 2 weeks.

In the meantime, if you have any questions, feel free to reach out by replying to this email.

We appreciate your interest in ICG and look forward to learning more about you!`,
  },
  "app-not-selected": {
    id: "app-not-selected",
    name: "Not Moving Forward",
    description: "Early-stage rejection",
    subject: "ICG Application Update",
    html: `<p>Dear <strong>{{firstName}}</strong>,</p>
<p>Thank you for your interest in <strong>Irvine Consulting Group (ICG)</strong> and for taking the time to apply for the <strong>Junior Associate</strong> position.</p>
<p>After carefully reviewing your application, we regret to inform you that we will not be moving forward with your candidacy at this time. This was a competitive process, and this decision is in no way a reflection of your potential.</p>
<p>We encourage you to apply again in a future recruitment cycle and wish you all the best in your academic and professional journey.</p>
<p>Thank you again for your interest in ICG.</p>`,
    text: `Dear {{firstName}},

Thank you for your interest in Irvine Consulting Group (ICG) and for taking the time to apply for the Junior Associate position.

After carefully reviewing your application, we regret to inform you that we will not be moving forward with your candidacy at this time. This was a competitive process, and this decision is in no way a reflection of your potential.

We encourage you to apply again in a future recruitment cycle and wish you all the best in your academic and professional journey.

Thank you again for your interest in ICG.`,
  },
  "cc-invitation": {
    id: "cc-invitation",
    name: "Coffee Chat Invite",
    description: "Invite applicant to schedule a chat",
    subject: "ICG Coffee Chat Invitation",
    html: `<p>Dear <strong>{{firstName}}</strong>,</p>
<p>Congratulations on your performance in the <strong>ICG</strong> recruitment process! We would like to invite you to a <strong>coffee chat</strong> with one of our officers as the next step.</p>
<p><strong>Coffee Chat Details</strong></p>
<p><strong>Format:</strong> 1-on-1 informal conversation (~30 minutes)<br><strong>Date &amp; Time:</strong> [Date and Time]<br><strong>Location / Platform:</strong> [Zoom Link or In-Person Location]</p>
<p>This is a wonderful opportunity for us to get to know you better and for you to ask any questions about life at <strong>ICG</strong>.</p>
<p>Please reply to confirm your availability. If the proposed time doesn't work, let us know and we'll find a time that suits you.</p>
<p>We look forward to connecting with you!</p>`,
    text: `Dear {{firstName}},

Congratulations on your performance in the ICG recruitment process! We would like to invite you to a coffee chat with one of our officers as the next step.

Coffee Chat Details
Format: 1-on-1 informal conversation (~30 minutes)
Date & Time: [Date and Time]
Location / Platform: [Zoom Link or In-Person Location]

Please reply to confirm your availability.

We look forward to connecting with you!`,
  },
  "cc-reminder": {
    id: "cc-reminder",
    name: "Chat Reminder",
    description: "Day-before reminder",
    subject: "Reminder: ICG Coffee Chat Tomorrow",
    html: `<p>Dear <strong>{{firstName}}</strong>,</p>
<p>Just a friendly reminder that your <strong>ICG Coffee Chat</strong> is scheduled for <strong>tomorrow</strong>.</p>
<p><strong>Date:</strong> [Date]<br><strong>Time:</strong> [Time]<br><strong>Location / Platform:</strong> [Zoom Link or In-Person Location]<br><strong>Your Officer:</strong> [Officer Name]</p>
<p>There's nothing to prepare; just come ready for a relaxed conversation!</p>
<p>If anything comes up, please reply to this email as soon as possible.</p>
<p>See you tomorrow!</p>`,
    text: `Dear {{firstName}},

Just a friendly reminder that your ICG Coffee Chat is scheduled for tomorrow.

Date: [Date]
Time: [Time]
Location / Platform: [Zoom Link or In-Person Location]
Your Officer: [Officer Name]

If anything comes up, please reply to this email as soon as possible.

See you tomorrow!`,
  },
  "round-1-reject": {
    id: "round-1-reject",
    name: "Round 1 Rejection",
    description: "After Round 1 interview",
    subject: "ICG Round 1 Interview Update",
    html: `<p>Dear <strong>{{firstName}}</strong>,</p>
<p>Thank you for taking the time to interview with <strong>Irvine Consulting Group (ICG)</strong> during Round 1.</p>
<p>After careful consideration, we regret to inform you that we will not be moving forward with your candidacy at this time. This was a competitive process, and this decision is in no way a reflection of your potential.</p>
<p>We encourage you to apply again in a future recruitment cycle and wish you all the best in your academic and professional journey.</p>
<p>Thank you again for your interest in ICG.</p>`,
    text: `Dear {{firstName}},

Thank you for taking the time to interview with Irvine Consulting Group (ICG) during Round 1.

After careful consideration, we regret to inform you that we will not be moving forward with your candidacy at this time.

We encourage you to apply again in a future recruitment cycle.

Thank you again for your interest in ICG.`,
  },
  "round-2-reject": {
    id: "round-2-reject",
    name: "Round 2 Rejection",
    description: "After final interview",
    subject: "ICG Final Interview Update",
    html: `<p>Dear <strong>{{firstName}}</strong>,</p>
<p>Thank you for taking the time to interview with <strong>Irvine Consulting Group (ICG)</strong> during our final interview round.</p>
<p>After careful consideration, we regret to inform you that we will not be moving forward with your candidacy at this time. This was a competitive process, and this decision is in no way a reflection of your potential.</p>
<p>We encourage you to apply again in a future recruitment cycle and wish you all the best in your academic and professional journey.</p>
<p>Thank you again for your interest in ICG.</p>`,
    text: `Dear {{firstName}},

Thank you for taking the time to interview with Irvine Consulting Group (ICG) during our final interview round.

After careful consideration, we regret to inform you that we will not be moving forward with your candidacy at this time.

We encourage you to apply again in a future recruitment cycle.

Thank you again for your interest in ICG.`,
  },
  "decision-accept": {
    id: "decision-accept",
    name: "Acceptance Offer",
    description: "Extend membership offer",
    subject: "Welcome to ICG! Offer of Membership",
    html: `<p>Dear <strong>{{firstName}}</strong>,</p>
<p>On behalf of the entire <strong>Irvine Consulting Group (ICG)</strong> team, we are absolutely thrilled to offer you a position as a <strong>Junior Associate</strong> for the <strong>Fall 2026</strong> term!</p>
<p>Your performance throughout the recruitment process truly stood out, and we are confident you will be a tremendous asset to our team.</p>
<p><strong>Next Steps</strong></p>
<ul>
<li>Please confirm your acceptance by replying to this email by <strong>[Acceptance Deadline]</strong></li>
<li>Attend our <strong>New Member Orientation</strong> on <strong>[Orientation Date &amp; Time]</strong></li>
<li>Watch for a Slack workspace invitation to join our member channels</li>
</ul>
<p>We cannot wait to have you on the team. <strong>Welcome to ICG!</strong></p>`,
    text: `Dear {{firstName}},

On behalf of the entire Irvine Consulting Group (ICG) team, we are absolutely thrilled to offer you a position as a Junior Associate for the Fall 2026 term!

Next Steps
- Please confirm your acceptance by replying to this email by [Acceptance Deadline]
- Attend our New Member Orientation on [Orientation Date & Time]
- Watch for a Slack workspace invitation

Welcome to ICG!`,
  },
  "decision-reject": {
    id: "decision-reject",
    name: "Rejection Notice",
    description: "Final decision, no offer",
    subject: "ICG Recruitment Update",
    html: `<p>Dear <strong>{{firstName}}</strong>,</p>
<p>Thank you sincerely for your time and dedication throughout the <strong>Irvine Consulting Group (ICG)</strong> recruitment process.</p>
<p>After thoughtful deliberation, we regret to inform you that we are unable to extend an offer at this time. This was an exceptionally competitive cycle, and this decision is in absolutely no way a reflection of your abilities or potential.</p>
<p>We deeply appreciate the effort you invested at every stage of the process, and we genuinely encourage you to apply again in a future recruitment cycle. We would love to see you back.</p>
<p>We wish you all the best in your academic and professional pursuits, and hope to stay connected.</p>`,
    text: `Dear {{firstName}},

Thank you sincerely for your time and dedication throughout the Irvine Consulting Group (ICG) recruitment process.

After thoughtful deliberation, we regret to inform you that we are unable to extend an offer at this time.

We encourage you to apply again in a future recruitment cycle.

We wish you all the best in your academic and professional pursuits.`,
  },
};

export function isTransactionalEmailId(raw: string): raw is TransactionalEmailId {
  return raw in TEMPLATES;
}

export function getTransactionalTemplate(id: TransactionalEmailId): TransactionalEmailMeta {
  return TEMPLATES[id];
}

export function listTransactionalTemplates(): TransactionalEmailMeta[] {
  return Object.values(TEMPLATES);
}

export function templateVarsFromApplicant(input: {
  firstName: string;
  lastName: string;
  email: string;
}): TemplateVars {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    fullName: `${input.firstName} ${input.lastName}`.trim(),
    email: input.email,
    room: "",
    roomLabel: "",
    location: "",
    timeBlock: "",
    scheduleDate: "",
    roundLabel: "",
  };
}

export function renderTransactionalEmail(id: TransactionalEmailId, vars: TemplateVars) {
  const t = TEMPLATES[id];
  const htmlBody = stripLegacyTemplateFooter(renderTemplateString(t.html, vars));
  const textBody = stripLegacyTemplateFooter(renderTemplateString(t.text, vars));
  return {
    subject: renderTemplateString(t.subject, vars),
    html: wrapEmailHtml(htmlBody),
    text: wrapEmailText(textBody),
  };
}

/** For copy-to-clipboard modals (bracket placeholders preserved in body). */
export function transactionalTemplatesForUi(ids: TransactionalEmailId[]) {
  return ids.map((id) => {
    const t = TEMPLATES[id];
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      subject: t.subject.replace(/\{\{firstName\}\}/g, "[First Name]"),
      html: t.html.replace(/\{\{firstName\}\}/g, "[First Name]"),
      text: t.text.replace(/\{\{firstName\}\}/g, "[First Name]"),
    };
  });
}

export const APPLICATION_EMAIL_UI = transactionalTemplatesForUi([
  "app-received",
  "app-not-selected",
]);

export const COFFEE_CHAT_EMAIL_UI = transactionalTemplatesForUi([
  "cc-invitation",
  "cc-reminder",
]);

export const DECISION_EMAIL_UI = transactionalTemplatesForUi([
  "decision-accept",
  "decision-reject",
]);
