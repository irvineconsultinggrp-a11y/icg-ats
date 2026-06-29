/** Set NEXT_PUBLIC_REQUIRE_UCI_EMAIL=true to restrict applicant signup to @uci.edu addresses. */
export function requireUciEmail(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_UCI_EMAIL === "true";
}

export function isUciEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@uci.edu");
}

export function isApplicantEmailAllowed(email: string): boolean {
  if (!requireUciEmail()) return true;
  return isUciEmail(email);
}

export const APPLICANT_EMAIL_ERROR =
  "Applicants must use a @uci.edu email address.";
