/**
 * Google Apps Script webhook — fire-and-forget after applicant creation.
 *
 * Contract when GOOGLE_APPS_SCRIPT_WEBHOOK_URL is set:
 *   POST {url}
 *   Headers: Content-Type: application/json
 *            X-Webhook-Secret: <GOOGLE_APPS_SCRIPT_SECRET> (optional)
 *   Body:
 *     {
 *       "event": "applicant.created",
 *       "applicant": {
 *         "id": string,
 *         "email": string,
 *         "firstName": string,
 *         "lastName": string,
 *         "position": string,
 *         "resumeUrl": string | null,
 *         "createdAt": string
 *       }
 *     }
 */

export type ApplicantWebhookPayload = {
  event: "applicant.created";
  applicant: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    position: string;
    resumeUrl: string | null;
    createdAt: string;
  };
};

export function notifyApplicantCreated(payload: ApplicantWebhookPayload): void {
  const url = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL;
  if (!url?.trim()) return;

  const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) headers["X-Webhook-Secret"] = secret;

  void fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.error("[google-apps-script] webhook failed", err);
  });
}
