"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isValidLocale, routing } from "@/i18n/routing";
import { getSettings } from "@/lib/platform-storage";

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const settings = await getSettings();
        const locale = isValidLocale(settings.language)
          ? settings.language
          : routing.defaultLocale;

        if (isMounted) {
          router.replace(`/${locale}`);
        }
      } catch {
        if (isMounted) {
          router.replace(`/${routing.defaultLocale}`);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return <div className="sr-only" aria-hidden="true" />;
}
