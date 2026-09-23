import nodemailer from "nodemailer";
import { resolveOutboundEmailIdentity } from "@/lib/email/email-branding";
import type { SendEmailInput, SendEmailResult } from "@/lib/email/send-via-resend";

export const DEFAULT_GMAIL_SENDER = "irvineconsulting.grp@gmail.com";

export async function sendViaGmail(input: SendEmailInput): Promise<SendEmailResult> {
  const user = process.env.GMAIL_USER?.trim() || DEFAULT_GMAIL_SENDER;
  const pass = process.env.GMAIL_APP_PASSWORD?.trim()?.replace(/\s/g, "");
  if (!pass) {
    return {
      ok: false,
      dryRun: true,
      error:
        "Gmail send is not configured. Set GMAIL_APP_PASSWORD (Google App Password for this account).",
    };
  }

  const { from, replyTo } = resolveOutboundEmailIdentity();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    const info = await transporter.sendMail({
      from: from.includes("@") ? from : `${from} <${user}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: replyTo || user,
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gmail send failed.";
    return { ok: false, error: message };
  }
}
