import type enMessages from "@/messages/en.json";
import { routing, type AppLocale } from "@/i18n/routing";
import ar from "@/messages/ar.json";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import fil from "@/messages/fil.json";
import fr from "@/messages/fr.json";
import hi from "@/messages/hi.json";
import id from "@/messages/id.json";
import ja from "@/messages/ja.json";
import ko from "@/messages/ko.json";
import ms from "@/messages/ms.json";
import pt from "@/messages/pt.json";
import ru from "@/messages/ru.json";
import th from "@/messages/th.json";
import vi from "@/messages/vi.json";
import zh from "@/messages/zh.json";

export type AppMessages = typeof enMessages;

const messagesByLocale: Record<AppLocale, AppMessages> = {
  en,
  id,
  ms,
  th,
  vi,
  fil,
  zh,
  ja,
  ko,
  es,
  fr,
  de,
  pt,
  ar,
  hi,
  ru,
};

export function getMessagesForLocale(locale: AppLocale): AppMessages {
  return messagesByLocale[locale] ?? messagesByLocale[routing.defaultLocale];
}
