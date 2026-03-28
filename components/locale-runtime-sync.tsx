"use client";

import { useEffect } from "react";
import type { AppLocale } from "@/i18n/routing";

type LocaleRuntimeSyncProps = {
  locale: AppLocale;
};

export function LocaleRuntimeSync({ locale }: LocaleRuntimeSyncProps) {
  useEffect(() => {
    // Sync DOM language attribute to current route locale for accessibility.
    // Note: Route-to-settings overwrite is REMOVED. User's persisted language preference
    // controls navigation; this component only syncs the DOM attribute.
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}