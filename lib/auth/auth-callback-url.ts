import { getSiteOrigin } from "./site-origin";

export type AuthCallbackOptions = {
  next: string;
  intent?: "applicant" | "officer";
};

/** URL Supabase should redirect to after email confirm, magic link, etc. */
export function buildAuthCallbackUrl(
  options: AuthCallbackOptions,
  fallbackOrigin?: string,
): string {
  const origin = getSiteOrigin(fallbackOrigin);
  const params = new URLSearchParams({ next: options.next });
  if (options.intent) params.set("intent", options.intent);
  return `${origin}/auth/callback?${params.toString()}`;
}
