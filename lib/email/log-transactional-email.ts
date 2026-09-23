import type { TransactionalEmailId } from "@/lib/email/transactional-templates";
import { createAdminClient } from "@/utils/supabase/admin";

export async function logTransactionalEmailSend(input: {
  applicantId: string;
  templateId: TransactionalEmailId;
  sentBy: string | null;
  messageId?: string;
}): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.from("applicant_email_sends").insert({
    applicant_id: input.applicantId,
    template_id: input.templateId,
    sent_by: input.sentBy,
    provider_message_id: input.messageId ?? null,
  });
  if (error) return { error: error.message };
  return {};
}
