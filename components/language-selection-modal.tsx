"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";
import { routing, type AppLocale } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type LanguageSelectionModalProps = {
  open: boolean;
  currentLanguage: AppLocale;
  isNative: boolean;
  onOpenChange(open: boolean): void;
  onApply(nextLanguage: AppLocale): Promise<void>;
};

function getLocaleDisplayName(localeCode: string, displayLocale: string): string {
  try {
    const displayNames = new Intl.DisplayNames([displayLocale], { type: "language" });
    return displayNames.of(localeCode) ?? localeCode.toUpperCase();
  } catch {
    return localeCode.toUpperCase();
  }
}

export function LanguageSelectionModal({
  open,
  currentLanguage,
  isNative,
  onOpenChange,
  onApply,
}: LanguageSelectionModalProps) {
  const t = useTranslations("AppearanceSettings.language");
  const [selectedLanguage, setSelectedLanguage] = useState<AppLocale>(currentLanguage);
  const [applying, setApplying] = useState(false);

  const localeOptions = useMemo(
    () => {
      const collator = new Intl.Collator(currentLanguage, {
        usage: "sort",
        sensitivity: "base",
      });

      return routing.locales
        .map((locale) => ({
          locale,
          label: getLocaleDisplayName(locale, currentLanguage),
        }))
        .sort((a, b) => {
          const labelCompare = collator.compare(a.label, b.label);
          if (labelCompare !== 0) {
            return labelCompare;
          }
          return a.locale.localeCompare(b.locale);
        });
    },
    [currentLanguage],
  );

  const hasChanges = selectedLanguage !== currentLanguage;

  const handleApply = async () => {
    if (!hasChanges || applying) {
      onOpenChange(false);
      return;
    }

    setApplying(true);
    try {
      await onApply(selectedLanguage);
    } finally {
      setApplying(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedLanguage(currentLanguage);
        }
        onOpenChange(nextOpen);
      }}
      drawerSize="compact"
    >
      <ResponsiveDialogContent dialogClassName="w-[min(36rem,92vw)] max-h-[85vh] overflow-hidden">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("modalTitle")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{t("modalDescription")}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="max-h-[65vh] overflow-y-auto">
          <p className="text-xs text-muted-foreground">
            {isNative ? t("restartWarningApp") : t("restartWarningWeb")}
          </p>

          <div className="space-y-2 pr-1">
            {localeOptions.map((option) => {
              const isSelected = option.locale === selectedLanguage;
              return (
                <Button
                  key={option.locale}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="w-full grid grid-cols-[1fr_auto] items-center gap-2 text-left"
                  onClick={() => setSelectedLanguage(option.locale)}
                >
                  <span className="min-w-0 wrap-anywhere">{option.label}</span>
                  <span className="text-xs uppercase opacity-80 shrink-0">{option.locale}</span>
                </Button>
              );
            })}
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={applying}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                void handleApply();
              }}
              disabled={!hasChanges || applying}
            >
              {applying ? t("applying") : t("apply")}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}