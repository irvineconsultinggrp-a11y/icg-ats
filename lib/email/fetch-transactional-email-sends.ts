import type { TransactionalEmailId } from "@/lib/email/transactional-templates";
import { createAdminClient } from "@/utils/supabase/admin";

export type TransactionalEmailSendRecord = {
  sentAt: string;
  templateId: string;
  providerMessageId: string | null;
};

export async function fetchLatestTransactionalEmailSend(input: {
  applicantId: string;
  templateId: TransactionalEmailId;
}): Promise<{ record: TransactionalEmailSendRecord | null; error?: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("applicant_email_sends")
    .select("sent_at, template_id, provider_message_id")
    .eq("applicant_id", input.applicantId)
    .eq("template_id", input.templateId)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { record: null, error: error.message };
  if (!data) return { record: null };

  return {
    record: {
      sentAt: data.sent_at,
      templateId: data.template_id,
      providerMessageId: data.provider_message_id,
    },
  };
}
