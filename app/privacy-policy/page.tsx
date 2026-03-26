"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "@/lib/platform-storage";
import { isValidLocale, routing } from "@/i18n/routing";

export default function RootPrivacyPolicyRedirectPage() {
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
          router.replace(`/${locale}/privacy-policy`);
        }
      } catch {
        if (isMounted) {
          router.replace(`/${routing.defaultLocale}/privacy-policy`);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return <div className="sr-only" aria-hidden="true" />;
}
