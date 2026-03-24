import React from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function LoadingOverlay({ show = false }: { show?: boolean }) {
  const t = useTranslations("LoadingOverlay");
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-9998 flex items-center justify-center bg-background/80 backdrop-blur-md"
      aria-live="polite"
      aria-busy="true"
      role="alert"
    >
      <div className="flex min-w-55 flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card/95 px-6 py-5 shadow-2xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium text-foreground">{t("loading")}</span>
      </div>
    </div>
  );
}