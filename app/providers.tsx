"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider } from "@/hooks/use-loading";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { HabitStorage } from "@/lib/habit-storage";
import { initSentryClient } from "@/lib/sentry";
import { AuthProvider } from "@/hooks/use-auth";
import { routing, isValidLocale, type AppLocale } from "@/i18n/routing";
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";
import msMessages from "@/messages/ms.json";
import thMessages from "@/messages/th.json";
import viMessages from "@/messages/vi.json";
import filMessages from "@/messages/fil.json";
import zhMessages from "@/messages/zh.json";
import jaMessages from "@/messages/ja.json";
import koMessages from "@/messages/ko.json";
import esMessages from "@/messages/es.json";
import frMessages from "@/messages/fr.json";
import deMessages from "@/messages/de.json";
import ptMessages from "@/messages/pt.json";
import arMessages from "@/messages/ar.json";
import hiMessages from "@/messages/hi.json";
import ruMessages from "@/messages/ru.json";

const messagesByLocale: Record<AppLocale, typeof enMessages> = {
  en: enMessages,
  id: idMessages,
  ms: msMessages,
  th: thMessages,
  vi: viMessages,
  fil: filMessages,
  zh: zhMessages,
  ja: jaMessages,
  ko: koMessages,
  es: esMessages,
  fr: frMessages,
  de: deMessages,
  pt: ptMessages,
  ar: arMessages,
  hi: hiMessages,
  ru: ruMessages,
};

function getLocaleFromPathname(pathname: string): AppLocale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isValidLocale(segment) ? segment : routing.defaultLocale;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
  staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  useEffect(() => {
    // initialize client-only observability (Sentry) only when user opted into analytics
    (async () => {
      try {
        const settings = await HabitStorage.getSettings();
        await initSentryClient(!!settings?.analyticsConsent);
      } catch (err) {
        // initialization failures should not block app
        if (process.env.NODE_ENV !== "production") {
          console.debug('Sentry client init skipped', err);
        }
      }
    })();
  }, []);

  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const messages = messagesByLocale[locale] ?? enMessages;


  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={routing.timeZone}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ServiceWorkerRegistration />
            <LoadingProvider>
              <AuthProvider>
                {children}
                <PWAInstallPrompt />
                <Toaster />
              </AuthProvider>
            </LoadingProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
