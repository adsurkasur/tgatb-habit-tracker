"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isValidLocale } from "@/i18n/routing";

type AppReadyStrategy = "immediate" | "data-ready";

interface AppReadyMarkerProps {
  strategy?: AppReadyStrategy;
  eventName?: string;
  timeoutMs?: number;
}

function isHomePath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return true;
  return segments.length === 1 && isValidLocale(segments[0]);
}

export function AppReadyMarker({
  strategy = "immediate",
  eventName = "tgatb:data-ready",
  timeoutMs = 3000,
}: AppReadyMarkerProps) {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (typeof document === "undefined") return;

    const markLoaded = () => {
      document.body.classList.add("app-loaded");
    };

    const shouldWaitForDataReady = strategy === "data-ready" && isHomePath(pathname);
    if (!shouldWaitForDataReady) {
      markLoaded();
      return;
    }

    const onDataReady = () => {
      markLoaded();
    };

    window.addEventListener(eventName, onDataReady as EventListener, { once: true });
    const fallbackTimer = window.setTimeout(() => {
      markLoaded();
    }, timeoutMs);

    return () => {
      window.removeEventListener(eventName, onDataReady as EventListener);
      window.clearTimeout(fallbackTimer);
    };
  }, [eventName, pathname, strategy, timeoutMs]);

  return null;
}
