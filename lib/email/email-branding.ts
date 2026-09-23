import { getSiteOrigin } from "@/lib/auth/site-origin";
import { DEFAULT_EMAIL_REPLY_TO } from "@/lib/email/send-via-resend";

export const EMAIL_DISPLAY_NAME = "Irvine Consulting Group";

/** Public logo URL for HTML emails (must be absolute). */
export function getEmailLogoUrl(): string {
  return `${getSiteOrigin()}/images/icg-logo.png`;
}

export function resolveOutboundEmailIdentity(): { from: string; replyTo: string } {
  const replyTo =
    process.env.EMAIL_REPLY_TO?.trim() || DEFAULT_EMAIL_REPLY_TO;
  const displayName =
    process.env.EMAIL_DISPLAY_NAME?.trim() || EMAIL_DISPLAY_NAME;
  const explicitFrom = process.env.EMAIL_FROM?.trim();

  if (explicitFrom) {
    return { from: explicitFrom, replyTo };
  }

  return { from: `${displayName} <${replyTo}>`, replyTo };
}

const FOOTER_HTML =
  '<p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#374151;">Best regards,<br><strong>The ICG Recruitment Team</strong><br>Irvine Consulting Group<br>University of California, Irvine</p>';

const FOOTER_TEXT =
  "\n\nBest regards,\nThe ICG Recruitment Team\nIrvine Consulting Group\nUniversity of California, Irvine";

/** Wrap template body with logo header (no horizontal rules or dash signatures). */
export function wrapEmailHtml(bodyHtml: string): string {
  const logoUrl = getEmailLogoUrl();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:28px 24px;">
        <tr><td align="center" style="padding-bottom:20px;">
          <img src="${logoUrl}" alt="Irvine Consulting Group" width="220" style="max-width:100%;height:auto;display:block;" />
        </td></tr>
        <tr><td style="font-size:15px;line-height:1.6;color:#111827;">
          ${bodyHtml}
          ${FOOTER_HTML}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function wrapEmailText(bodyText: string): string {
  const trimmed = bodyText.trimEnd();
  if (trimmed.includes("The ICG Recruitment Team")) {
    return trimmed;
  }
  return `${trimmed}${FOOTER_TEXT}`;
}

/** Strip duplicate footers from template fragments before wrapping. */
export function stripLegacyTemplateFooter(html: string): string {
  return html
    .replace(
      /<p>Warm regards,[\s\S]*?University of California, Irvine<\/p>\s*$/i,
      "",
    )
    .replace(
      /<p>With excitement,[\s\S]*?University of California, Irvine<\/p>\s*$/i,
      "",
    )
    .replace(/<p>Best regards,[\s\S]*?University of California, Irvine<\/p>\s*$/i, "")
    .replace(/<p>— Irvine Consulting Group Recruitment<\/p>\s*$/i, "")
    .replace(/\nWarm regards,[\s\S]*?University of California, Irvine\s*$/i, "")
    .replace(/\nWith excitement,[\s\S]*?University of California, Irvine\s*$/i, "")
    .replace(/\nBest regards,[\s\S]*?University of California, Irvine\s*$/i, "")
    .replace(/\n— Irvine Consulting Group Recruitment\s*$/i, "");
}
