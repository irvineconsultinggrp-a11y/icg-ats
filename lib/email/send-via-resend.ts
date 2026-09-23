import { resolveOutboundEmailIdentity } from "@/lib/email/email-branding";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; dryRun?: boolean };

/** Inbox ICG uses for applicant replies (Reply-To header). */
export const DEFAULT_EMAIL_REPLY_TO = "irvineconsulting.grp@gmail.com";

export async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const { from, replyTo } = resolveOutboundEmailIdentity();

  if (!apiKey) {
    return {
      ok: false,
      dryRun: true,
      error:
        "Email is not configured (set RESEND_API_KEY and EMAIL_FROM on the server). Preview only.",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      reply_to: replyTo,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) {
    return { ok: false, error: body.message ?? `Resend error (${res.status})` };
  }
  return { ok: true, id: body.id };
}
