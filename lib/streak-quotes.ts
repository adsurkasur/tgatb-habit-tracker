import type { UserSettings } from "@shared/schema";
import streakQuotesSource from "@/messages/streak-quotes.json";

type AppLocale = UserSettings["language"];

export interface StreakQuote {
  id: string;
  author: string;
  originalLanguage: string;
  originalText: string;
  translation: Partial<Record<AppLocale, string>> & { en: string };
}

const STREAK_QUOTES: StreakQuote[] = streakQuotesSource.quotes;

export const STREAK_QUOTE_IDS: string[] = STREAK_QUOTES.map((quote) => quote.id);

export function getStreakQuoteById(id: string): StreakQuote {
  return STREAK_QUOTES.find((quote) => quote.id === id) ?? STREAK_QUOTES[0];
}

export function getStreakQuoteTranslation(quote: StreakQuote, locale: string): string {
  const localized = quote.translation[locale as AppLocale];
  return localized ?? quote.translation.en;
}
