"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CloseButton } from "@/components/ui/close-button";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt({ hidden = false }: { hidden?: boolean } = {}) {
  // Detect platform once; never early-return before hooks
  const isCapacitorApp = Capacitor.isNativePlatform();

  // Suppress on standalone pages like /privacy-policy
  const isStandalonePage = typeof window !== 'undefined' && /^\/privacy-policy/.test(window.location.pathname);

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
        title: "App install not available",
        description: "App installation is not supported on this device or browser. Try Chrome or Edge on desktop/mobile.",
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
          title: "App install started",
          description: "Follow your browser's instructions to complete installation.",
          duration: 3000,
        });
      } else {
        // Use the same message as handleDismiss for consistency
        toast({
          title: "App install dismissed",
          description: "You can install the app anytime from Settings → Install App.",
          duration: 3000,
        });
      }
    } catch {
      toast({
        title: "App install failed",
        description: "Something went wrong while trying to install the app.",
        duration: 3000,
      });
    }
  };

  // Fix: When dismissing, also set showInstallPrompt to false and do not touch analyticsAcknowledged
  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    toast({
      title: "App install dismissed",
      description: "You can install the app anytime from Settings → Install App.",
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
            <h3 className="font-medium text-sm mb-1">Install TGATB App</h3>
            <p className="text-xs text-muted-foreground">
              Better experience with offline support and quick access
            </p>
            {/* Fallback instructions for browsers without beforeinstallprompt */}
            {fallbackInstall && (
              <>
                {isIOS || (isMac && isSafari) ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    On iOS/Safari, tap the Share button and select &quot;Add to Home Screen&quot; to install.
                  </p>
                ) : isAndroid ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    On Android, use Chrome, Edge, or Samsung Internet. If you see a <b>+</b> icon in your browser&apos;s address bar, tap it to install.<br />
                    If you don&apos;t see the icon, open browser menu and look for &quot;Add to Home screen&quot; or &quot;Install app&quot;.
                  </p>
                ) : (isWindows || isLinux) ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    On Windows/Linux, use Chrome or Edge. If you see an install icon in your browser&apos;s address bar, use it.<br />
                    If not, open browser menu and look for &quot;Install app&quot; or &quot;Add to desktop&quot;.
                  </p>
                ) : isMac ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    On macOS, use Chrome or Edge. If you see an install icon in your browser&apos;s address bar, use it.<br />
                    If not, open browser menu and look for &quot;Install app&quot; or &quot;Add to dock&quot;.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">
                    If you see an install icon in your browser&apos;s address bar, use it.<br />
                    Otherwise, open browser menu and look for &quot;Install app&quot; or &quot;Add to Home screen&quot;.
                  </p>
                )}
              </>
            )}
            {/* Default instructions for browsers with beforeinstallprompt */}
            {!fallbackInstall && (
              <>
                {(isIOS || (isMac && isSafari)) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    On iOS/Safari, tap the Share button and select &quot;Add to Home Screen&quot; to install.
                  </p>
                )}
                {isAndroid && (
                  <p className="text-xs text-muted-foreground mt-2">
                    On Android, use Chrome or Edge for best experience. If you see an install icon in your browser&apos;s address bar, use it.
                  </p>
                )}
                {(isWindows || isLinux) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    On Windows/Linux, use Chrome or Edge for best experience. If you see an install icon in your browser&apos;s address bar, use it.
                  </p>
                )}
                {isMac && !isSafari && (
                  <p className="text-xs text-muted-foreground mt-2">
                    On macOS, use Chrome or Edge for best experience. If you see an install icon in your browser&apos;s address bar, use it.
                  </p>
                )}
              </>
            )}
          </div>
          <CloseButton
            className="shrink-0 ml-2"
            onClick={handleDismiss}
            label="Dismiss"
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
              Install
            </Button>
          )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="h-8 px-2 text-xs"
            >
              {fallbackInstall ? "OK" : "Not now"}
            </Button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
