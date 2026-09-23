import { buildAuthCallbackUrl } from "./auth-callback-url";

/** Redirect target for Supabase reset emails — must go through /auth/callback first. */
export function passwordResetRedirect(origin: string, nextPath: string, intent?: "applicant") {
  return buildAuthCallbackUrl({ next: nextPath, intent }, origin);
}
