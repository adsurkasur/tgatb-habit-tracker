"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider } from "@/hooks/use-loading";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { useState, useEffect } from "react";
import { HabitStorage } from "@/lib/habit-storage";
import { initSentryClient } from "@/lib/sentry";

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


  return (
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
  );
}
