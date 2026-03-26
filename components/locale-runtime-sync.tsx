"use client";

import { useEffect } from "react";
import type { AppLocale } from "@/i18n/routing";
import { getSettings, saveSettings } from "@/lib/platform-storage";

type LocaleRuntimeSyncProps = {
  locale: AppLocale;
};

export function LocaleRuntimeSync({ locale }: LocaleRuntimeSyncProps) {
  useEffect(() => {
    document.documentElement.lang = locale;

    void (async () => {
      try {
        const settings = await getSettings();
        if (settings.language !== locale) {
          await saveSettings({ ...settings, language: locale });
        }
      } catch {
        // Ignore persistence sync failures; locale routing still controls rendered language.
      }
    })();
  }, [locale]);

  return null;
}