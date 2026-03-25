import { getRequestConfig } from "next-intl/server";
import { routing, isValidLocale } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isValidLocale(requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    timeZone: routing.timeZone,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
