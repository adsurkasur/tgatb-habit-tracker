"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CloseButton } from "@/components/ui/close-button";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt({ hidden = false }: { hidden?: boolean } = {}) {
  const t = useTranslations("PWAInstallPrompt");
  // Detect platform once; never early-return before hooks
  const isCapacitorApp = Capacitor.isNativePlatform();

  // Suppress on standalone pages like /privacy-policy or /en/privacy-policy
  const isStandalonePage = typeof window !== 'undefined' && /^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?(?:privacy-policy|terms-of-service)(?:\/|$)/.test(window.location.pathname);

  // Only show if analytics notice is acknowledged
  const [analyticsAcknowledged, setAnalyticsAcknowledged] = useState(
    typeof window !== 'undefined' && localStorage.getItem('analytics-notice-acknowledged') === 'true'
  );
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
  });
  const [fallbackInstall, setFallbackInstall] = useState(false);
  const { toast } = useToast();

  // Note: do not early-return before hooks (rules-of-hooks)

  // Track analyticsAcknowledged changes during render (React-approved adjustment pattern)
  const [prevAnalyticsAcknowledged, setPrevAnalyticsAcknowledged] = useState(analyticsAcknowledged);
  if (analyticsAcknowledged !== prevAnalyticsAcknowledged) {
    setPrevAnalyticsAcknowledged(analyticsAcknowledged);
    if (analyticsAcknowledged) {
      setShowInstallPrompt(true);
    }
  }

  // Listen for custom event from analytics notice
  useEffect(() => {
    const handleCustomEvent = () => {
      setAnalyticsAcknowledged(true);
      setShowInstallPrompt(true);
    };
    window.addEventListener('analytics-notice-acknowledged-event', handleCustomEvent);
    return () => {
      window.removeEventListener('analytics-notice-acknowledged-event', handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    // Listen for changes to analytics notice acknowledgment
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'analytics-notice-acknowledged' && e.newValue === 'true') {
        setAnalyticsAcknowledged(true);
        setShowInstallPrompt(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    if (isInstalled) {
      return () => {
        window.removeEventListener('storage', handleStorage);
      };
    }

    // Check if user has dismissed the prompt before
    const hasDismissed = sessionStorage.getItem('pwa-install-dismissed') === 'true';

    // Listen for the beforeinstallprompt event
    let beforeInstallPromptFired = false;
    const handler = (e: BeforeInstallPromptEvent) => {
      beforeInstallPromptFired = true;
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not previously dismissed
      if (!hasDismissed) {
        setShowInstallPrompt(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler as unknown as EventListener);

    // Listen for app installed event
    const appInstalledHandler = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      sessionStorage.removeItem('pwa-install-dismissed');
    };
    window.addEventListener('appinstalled', appInstalledHandler);

    // Listen for manual trigger from settings
    const handleManualTrigger = () => {
      sessionStorage.removeItem('pwa-install-dismissed');
      setShowInstallPrompt(true);
      // Do NOT set analyticsAcknowledged here
    };
    window.addEventListener('trigger-pwa-install', handleManualTrigger);

    // Fallback: If beforeinstallprompt is not fired after a short delay, show fallback UI
    setTimeout(() => {
      if (!beforeInstallPromptFired && !isInstalled && !isCapacitorApp && !hasDismissed) {
        setFallbackInstall(true);
        setShowInstallPrompt(true);
      }
    }, 2000); // 2s delay to allow event to fire

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as unknown as EventListener);
      window.removeEventListener('appinstalled', appInstalledHandler);
      window.removeEventListener('trigger-pwa-install', handleManualTrigger);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isCapacitorApp, isInstalled]);


  // Platform detection
  const ua = typeof window !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isWindows = /Windows NT/.test(ua);
  const isLinux = /Linux/.test(ua) && !isAndroid;
  const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(ua);
  // Removed unused variables isEdge and isOpera
  const isSafari = typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(ua);
  // const isChrome = /Chrome/.test(ua) && !isEdge && !isOpera; // Removed unused variable

  const handleInstallClick = async () => {
  // ...existing code...
    if (!deferredPrompt) {
      toast({
        title: t("toasts.notAvailable.title"),
        description: t("toasts.notAvailable.description"),
        duration: 3000,
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        toast({
          title: t("toasts.started.title"),
          description: t("toasts.started.description"),
          duration: 3000,
        });
      } else {
        // Use the same message as handleDismiss for consistency
        toast({
          title: t("toasts.dismissed.title"),
          description: t("toasts.dismissed.description"),
          duration: 3000,
        });
      }
    } catch {
      toast({
        title: t("toasts.failed.title"),
        description: t("toasts.failed.description"),
        duration: 3000,
      });
    }
  };

  // Fix: When dismissing, also set showInstallPrompt to false and do not touch analyticsAcknowledged
  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    toast({
      title: t("toasts.dismissed.title"),
      description: t("toasts.dismissed.description"),
      duration: 3000,
    });
  };

  // Compute visibility guards during render instead of using effects
  const isDismissedInSession = typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed') === 'true';

  if (
    hidden ||
    typeof window === 'undefined' ||
    isCapacitorApp ||
    isInstalled ||
    isStandalonePage ||
    isDismissedInSession ||
    !showInstallPrompt
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      {/* Inner surface animates - fixed anchor does NOT animate */}
      <div className="pwa-prompt-surface bg-background border border-border rounded-lg shadow-xl max-w-sm animate-slide-up">
        <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-1">{t("title")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("subtitle")}
            </p>
            {/* Fallback instructions for browsers without beforeinstallprompt */}
            {fallbackInstall && (
              <>
                {isIOS || (isMac && isSafari) ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("instructions.fallback.iosSafari")}
                  </p>
                ) : isAndroid ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("instructions.fallback.android.line1")}<br />
                    {t("instructions.fallback.android.line2")}
                  </p>
                ) : (isWindows || isLinux) ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("instructions.fallback.windowsLinux.line1")}<br />
                    {t("instructions.fallback.windowsLinux.line2")}
                  </p>
                ) : isMac ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("instructions.fallback.mac.line1")}<br />
                    {t("instructions.fallback.mac.line2")}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("instructions.fallback.generic.line1")}<br />
                    {t("instructions.fallback.generic.line2")}
                  </p>
                )}
              </>
            )}
            {/* Default instructions for browsers with beforeinstallprompt */}
            {!fallbackInstall && (
              <>
                {(isIOS || (isMac && isSafari)) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("instructions.default.iosSafari")}
                  </p>
                )}
                {isAndroid && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("instructions.default.android")}
                  </p>
                )}
                {(isWindows || isLinux) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("instructions.default.windowsLinux")}
                  </p>
                )}
                {isMac && !isSafari && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("instructions.default.mac")}
                  </p>
                )}
              </>
            )}
          </div>
          <CloseButton
            className="shrink-0 ml-2"
            onClick={handleDismiss}
            label={t("actions.dismiss")}
          />
        </div>
        <div className="flex gap-1.5">
          {/* Only show install button if beforeinstallprompt is available */}
          {!fallbackInstall && (
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="flex items-center gap-1 h-8 px-2 text-xs"
            >
              <Download className="h-3 w-3" />
              {t("actions.install")}
            </Button>
          )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="h-8 px-2 text-xs"
            >
              {fallbackInstall ? t("actions.ok") : t("actions.notNow")}
            </Button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
