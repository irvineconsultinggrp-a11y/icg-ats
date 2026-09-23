/** Canonical site origin for auth emails and redirects (prod should set NEXT_PUBLIC_SITE_URL). */
export function getSiteOrigin(fallbackOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  if (fallbackOrigin) return fallbackOrigin.replace(/\/$/, "");
  return "http://localhost:3000";
}
