import React from "react";
import { useTranslations } from "next-intl";
import { LoadingVisual } from "@/components/ui/loading-visual";

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
      <LoadingVisual label={t("loading")} />
    </div>
  );
}