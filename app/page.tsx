"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isValidLocale, routing } from "@/i18n/routing";
import { getSettings } from "@/lib/platform-storage";
import { LoadingVisual } from "@/components/ui/loading-visual";

const SETTINGS_READ_TIMEOUT_MS = 1500;
const ROOT_REDIRECT_TIMEOUT_MS = 2500;
const HARD_NAV_FALLBACK_DELAY_MS = 180;

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let hasNavigated = false;

    const hardNavigate = (target: string) => {
      if (typeof window === "undefined") return;
      if (window.location.pathname !== target) {
        window.location.replace(target);
      }
    };

    const navigateToLocale = (locale: string) => {
      if (!isMounted || hasNavigated) return;
      hasNavigated = true;

      const target = `/${locale}`;
      router.replace(target);

      window.setTimeout(() => {
        if (!isMounted) return;
        hardNavigate(target);
      }, HARD_NAV_FALLBACK_DELAY_MS);
    };

    const rootTimeoutId = window.setTimeout(() => {
      navigateToLocale(routing.defaultLocale);
    }, ROOT_REDIRECT_TIMEOUT_MS);

    void (async () => {
      try {
        const settings = await Promise.race([
          getSettings(),
          new Promise<never>((_, reject) => {
            window.setTimeout(() => reject(new Error("settings-timeout")), SETTINGS_READ_TIMEOUT_MS);
          }),
        ]);

        const locale = isValidLocale(settings.language)
          ? settings.language
          : routing.defaultLocale;
        navigateToLocale(locale);
      } catch {
        navigateToLocale(routing.defaultLocale);
      } finally {
        window.clearTimeout(rootTimeoutId);
      }
    })();

    return () => {
      isMounted = false;
      window.clearTimeout(rootTimeoutId);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-3">
        <LoadingVisual />
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
