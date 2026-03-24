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
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";

type ProviderLocale = "en" | "id";

function getLocaleFromPathname(pathname: string): ProviderLocale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment === "id" ? "id" : "en";
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
  const messages = locale === "id" ? idMessages : enMessages;


  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ServiceWorkerRegistration />
            <LoadingProvider>
              {children}
              <PWAInstallPrompt />
              <Toaster />
            </LoadingProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
