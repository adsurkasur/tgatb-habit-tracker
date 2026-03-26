"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "@/lib/platform-storage";
import { isValidLocale, routing } from "@/i18n/routing";

export default function RootTermsOfServiceRedirectPage() {
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
          router.replace(`/${locale}/terms-of-service`);
        }
      } catch {
        if (isMounted) {
          router.replace(`/${routing.defaultLocale}/terms-of-service`);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return <div className="sr-only" aria-hidden="true" />;
}
