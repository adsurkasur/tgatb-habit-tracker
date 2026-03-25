export const routing = {
  locales: ["en", "id"] as const,
  defaultLocale: "en" as const,
  timeZone: "Asia/Jakarta" as const,
};

export type AppLocale = (typeof routing.locales)[number];

export function isValidLocale(locale: string): locale is AppLocale {
  return routing.locales.includes(locale as AppLocale);
}
