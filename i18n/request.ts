import { getRequestConfig } from "next-intl/server";
import { routing, isValidLocale } from "@/i18n/routing";
import { getMessagesForLocale } from "@/i18n/messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isValidLocale(requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    timeZone: routing.timeZone,
    messages: getMessagesForLocale(locale),
  };
});
