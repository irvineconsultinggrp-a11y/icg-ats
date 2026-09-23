import type { SendEmailInput, SendEmailResult } from "@/lib/email/send-via-resend";
import { sendViaGmail } from "@/lib/email/send-via-gmail";
import { sendViaResend } from "@/lib/email/send-via-resend";

/**
 * Resend when RESEND_API_KEY is set (production). Gmail only when GMAIL_APP_PASSWORD is set.
 * Do not infer Gmail from EMAIL_FROM alone — that breaks local/dev when From mentions @gmail.com
 * but mail actually goes through Resend with a verified domain.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim()?.replace(/\s/g, "");

  if (resendKey) {
    return sendViaResend(input);
  }

  if (gmailPass) {
    return sendViaGmail(input);
  }

  return sendViaResend(input);
}

export type { SendEmailInput, SendEmailResult };
