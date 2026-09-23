import { sendTransactionalEmailToApplicant } from "@/lib/email/send-transactional-email";
import { createAdminClient } from "@/utils/supabase/admin";

export type ApplicationReceivedEmailResult = {
  sent: boolean;
  skipped?: boolean;
  alreadySent?: boolean;
  error?: string;
};

/** Sends the application-received template once per applicant (unless disabled). */
export async function maybeSendApplicationReceivedEmail(
  applicantId: string,
): Promise<ApplicationReceivedEmailResult> {
  if (process.env.AUTO_SEND_APPLICATION_RECEIVED_EMAIL === "false") {
    return { sent: false, skipped: true };
  }

  try {
    const admin = createAdminClient();
    const { data: existing, error: lookupError } = await admin
      .from("applicant_email_sends")
      .select("id")
      .eq("applicant_id", applicantId)
      .eq("template_id", "app-received")
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error("[app-received] send log lookup:", lookupError.message);
    } else if (existing) {
      return { sent: false, alreadySent: true };
    }

    const emailResult = await sendTransactionalEmailToApplicant({
      applicantId,
      templateId: "app-received",
      sentBy: null,
    });

    if (emailResult.ok) {
      return { sent: true };
    }

    console.error("[app-received] send failed:", emailResult.error);
    return { sent: false, error: emailResult.error };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[app-received] unexpected:", message);
    return { sent: false, error: message };
  }
}
