"use client";

import { useEffect, useMemo } from "react";
import { Sparkles, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getStreakQuoteById, getStreakQuoteTranslation } from "@/lib/streak-quotes";

interface StreakCelebrationOverlayProps {
  open: boolean;
  weeks: number;
  streak: number;
  habitName: string;
  quoteKey: string;
  reducedMotion: boolean;
  confettiCount: number;
  onClose: () => void;
}

function particlePalette(index: number): string {
  const colors = [
    "#22c55e",
    "#60a5fa",
    "#f59e0b",
    "#f43f5e",
    "#a855f7",
  ];
  return colors[index % colors.length];
}

export function StreakCelebrationOverlay({
  open,
  weeks,
  streak,
  habitName,
  quoteKey,
  reducedMotion,
  confettiCount,
  onClose,
}: StreakCelebrationOverlayProps) {
  const t = useTranslations("StreakCelebration");
  const locale = useLocale();
  const quote = getStreakQuoteById(quoteKey);
  const quoteCaption = getStreakQuoteTranslation(quote, locale);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => onClose(), reducedMotion ? 1800 : 2400);
    return () => window.clearTimeout(timer);
  }, [open, onClose, reducedMotion]);

  const particles = useMemo(() => {
    return Array.from({ length: confettiCount }, (_, i) => {
      const left = ((i * 9973) % 10000) / 100;
      const delay = ((i * 613) % 600) / 1000;
      const duration = 1.3 + (((i * 193) % 900) / 1000);
      const rotate = ((i * 37) % 360);
      return {
        id: i,
        left,
        delay,
        duration,
        rotate,
        color: particlePalette(i),
      };
    });
  }, [confettiCount]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-background/70 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      onClick={onClose}
    >
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute top-[-8%] h-3 w-2 rounded-xs streak-confetti-fall"
              style={{
                left: `${particle.left}%`,
                backgroundColor: particle.color,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                transform: `rotate(${particle.rotate}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="mx-6 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Trophy className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-wide">{t("badge")}</p>
        </div>

        <h2 className="text-2xl font-bold leading-tight text-foreground">{t("title", { weeks })}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("subtitle", { streak, habitName })}
        </p>

        <div className="mt-5 rounded-lg bg-muted/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t("quoteLabel")}</span>
          </div>
          <p className="text-base font-medium italic leading-relaxed text-foreground">
            {quote.originalText}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {quoteCaption}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground/90">
            {t("quoteAttribution", { author: quote.author, language: quote.originalLanguage })}
          </p>
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={onClose}
        >
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
