/** Default applicant coffee chat scheduling link (set in .env.local when ready). */
export function getDefaultCoffeeChatCalendlyUrl(): string {
  return process.env.NEXT_PUBLIC_COFFEE_CHAT_CALENDLY_URL?.trim() ?? "";
}

export function resolveCoffeeChatCalendlyUrl(officerCalendly?: string | null): string {
  const officer = officerCalendly?.trim();
  if (officer) return officer;
  return getDefaultCoffeeChatCalendlyUrl();
}

export function hasCoffeeChatCalendlyUrl(officerCalendly?: string | null): boolean {
  return resolveCoffeeChatCalendlyUrl(officerCalendly).length > 0;
}
