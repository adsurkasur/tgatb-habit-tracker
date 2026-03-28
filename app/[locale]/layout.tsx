import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, isValidLocale } from "@/i18n/routing";
import { getMessagesForLocale } from "@/i18n/messages";
import { AppReadyMarker } from "@/components/app-ready-marker";
import { LocaleRuntimeSync } from "@/components/locale-runtime-sync";

const openGraphLocaleByAppLocale: Record<string, string> = {
  en: "en_US",
  id: "id_ID",
  ms: "ms_MY",
  th: "th_TH",
  vi: "vi_VN",
  fil: "fil_PH",
  zh: "zh_CN",
  ja: "ja_JP",
  ko: "ko_KR",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  pt: "pt_BR",
  ar: "ar_SA",
  hi: "hi_IN",
  ru: "ru_RU",
};

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<LocaleLayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = isValidLocale(locale) ? locale : routing.defaultLocale;
  const messages = getMessagesForLocale(resolvedLocale);

  // Generate hreflang alternate links for all supported locales
  const alternates: Record<string, string> = {};
  const currentUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.tgatb.click";
  
  for (const loc of routing.locales) {
    const urlPath = loc === routing.defaultLocale ? "" : `/${loc}`;
    alternates[loc] = `${currentUrl}${urlPath}`;
  }

  return {
    title: messages.App.name,
    description: messages.App.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://www.tgatb.click"),
    alternates: {
      languages: alternates,
      canonical: alternates[resolvedLocale],
    },
    openGraph: {
      title: messages.App.name,
      description: messages.App.description,
      url: alternates[resolvedLocale],
      siteName: messages.App.name,
      locale: openGraphLocaleByAppLocale[resolvedLocale] ?? "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={routing.timeZone}>
      <LocaleRuntimeSync locale={locale} />
      <AppReadyMarker strategy="data-ready" />
      {children}
    </NextIntlClientProvider>
  );
}
