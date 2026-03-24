import { AppLocale, routing, isValidLocale } from "@/i18n/routing";

export function extractLocaleFromPathname(pathname: string): AppLocale | null {
  const [firstSegment] = pathname.split("/").filter(Boolean);
  if (!firstSegment) return null;
  return isValidLocale(firstSegment) ? firstSegment : null;
}

export function withLocalePath(pathname: string, locale: AppLocale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return `/${locale}`;
  }

  if (isValidLocale(segments[0])) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  return `/${locale}/${segments.join("/")}`;
}

export function normalizeLocale(input: string | null | undefined): AppLocale {
  if (input && isValidLocale(input)) return input;
  return routing.defaultLocale;
}
