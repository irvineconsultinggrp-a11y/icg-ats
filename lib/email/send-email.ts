import type { SendEmailInput, SendEmailResult } from "@/lib/email/send-via-resend";
import { sendViaGmail } from "@/lib/email/send-via-gmail";
import { sendViaResend } from "@/lib/email/send-via-resend";

function configuredFromLooksLikeGmail(): boolean {
  const from = process.env.EMAIL_FROM?.trim().toLowerCase() ?? "";
  const user = process.env.GMAIL_USER?.trim().toLowerCase() ?? "";
  return from.includes("@gmail.com") || user.includes("@gmail.com");
}

/** Schedule/campaign mail: Gmail when app password is set (required for @gmail From). */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();
  const useGmail = Boolean(gmailPass) || configuredFromLooksLikeGmail();

  if (useGmail) {
    if (!gmailPass) {
      return {
        ok: false,
        dryRun: true,
        error:
          "Sending from Gmail requires GMAIL_APP_PASSWORD (Google App Password for irvineconsulting.grp@gmail.com).",
      };
    }
    return sendViaGmail(input);
  }
  return sendViaResend(input);
}

export type { SendEmailInput, SendEmailResult };
