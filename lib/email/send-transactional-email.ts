import { sendEmail } from "@/lib/email/send-email";
import { logTransactionalEmailSend } from "@/lib/email/log-transactional-email";
import {
  isTransactionalEmailId,
  renderTransactionalEmail,
  templateVarsFromApplicant,
  type TransactionalEmailId,
} from "@/lib/email/transactional-templates";
import { createAdminClient } from "@/utils/supabase/admin";

export async function sendTransactionalEmailToApplicant(input: {
  applicantId: string;
  templateId: TransactionalEmailId;
  sentBy: string | null;
}): Promise<{ ok: true; messageId?: string } | { ok: false; error: string; dryRun?: boolean }> {
  if (!isTransactionalEmailId(input.templateId)) {
    return { ok: false, error: "Unknown email template." };
  }

  const admin = createAdminClient();
  const { data: row, error: fetchError } = await admin
    .from("applicants")
    .select("id, first_name, last_name, email")
    .eq("id", input.applicantId)
    .maybeSingle();

  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row?.email) return { ok: false, error: "Applicant not found." };

  const vars = templateVarsFromApplicant({
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
  });
  const rendered = renderTransactionalEmail(input.templateId, vars);

  const sent = await sendEmail({
    to: row.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });

  if (!sent.ok) {
    return { ok: false, error: sent.error, dryRun: sent.dryRun };
  }

  const logged = await logTransactionalEmailSend({
    applicantId: input.applicantId,
    templateId: input.templateId,
    sentBy: input.sentBy,
    messageId: sent.id,
  });
  if (logged.error) {
    console.error("transactional email log failed:", logged.error);
  }

  return { ok: true, messageId: sent.id };
}
