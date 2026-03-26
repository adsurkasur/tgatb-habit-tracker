export const routing = {
  locales: [
    "en",
    "id",
    "ms",
    "th",
    "vi",
    "fil",
    "zh",
    "ja",
    "ko",
    "es",
    "fr",
    "de",
    "pt",
    "ar",
    "hi",
    "ru",
  ] as const,
  defaultLocale: "en" as const,
  timeZone: "Asia/Jakarta" as const,
};

export type AppLocale = (typeof routing.locales)[number];

export function isValidLocale(locale: string): locale is AppLocale {
  return routing.locales.includes(locale as AppLocale);
}
