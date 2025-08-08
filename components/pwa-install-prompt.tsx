"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
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

export function PWAInstallPrompt() {
  // Detect platform once; never early-return before hooks
  const isCapacitorApp = Capacitor.isNativePlatform();
  
  // Only show if analytics notice is acknowledged
  const [analyticsAcknowledged, setAnalyticsAcknowledged] = useState(
    typeof window !== 'undefined' && localStorage.getItem('analytics-notice-acknowledged') === 'true'
  );
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  // Note: do not early-return before hooks (rules-of-hooks)

  // Hide install prompt immediately if user has already dismissed it
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed') === 'true' && showInstallPrompt) {
      setShowInstallPrompt(false);
    }
  }, [showInstallPrompt]);

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

  // Watch for analyticsAcknowledged changes in the same tab
  useEffect(() => {
    if (analyticsAcknowledged) {
      setShowInstallPrompt(true);
    }
  }, [analyticsAcknowledged]);

  useEffect(() => {
    // Listen for changes to analytics notice acknowledgment
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'analytics-notice-acknowledged' && e.newValue === 'true') {
        setAnalyticsAcknowledged(true);
        setShowInstallPrompt(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return () => {
        window.removeEventListener('storage', handleStorage);
      };
    }

    // Check if user has dismissed the prompt before
    const hasDismissed = sessionStorage.getItem('pwa-install-dismissed') === 'true';

    // Listen for the beforeinstallprompt event
    const handler = (e: BeforeInstallPromptEvent) => {
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

    // For testing - show install prompt after 2 seconds if not installed and not dismissed
    const timer = setTimeout(() => {
      if (!isStandalone && !isInWebAppiOS && !hasDismissed) {
        setShowInstallPrompt(true);
      }
    }, 2000);

    // Listen for manual trigger from settings
    const handleManualTrigger = () => {
      sessionStorage.removeItem('pwa-install-dismissed');
      setShowInstallPrompt(true);
      // Do NOT set analyticsAcknowledged here
    };
    window.addEventListener('trigger-pwa-install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as unknown as EventListener);
      window.removeEventListener('appinstalled', appInstalledHandler);
      window.removeEventListener('trigger-pwa-install', handleManualTrigger);
      window.removeEventListener('storage', handleStorage);
      clearTimeout(timer);
    };
  }, []);

  // Ensure prompt hides if dismissed in this session
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed') === 'true' && showInstallPrompt) {
      setShowInstallPrompt(false);
    }
  }, [showInstallPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // Fix: When dismissing, also set showInstallPrompt to false and do not touch analyticsAcknowledged
  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    toast({
      title: "App installation available",
      description: "You can install the app anytime from Settings → Install App",
      duration: 4000,
    });
  };

  // Don't show if already installed or (analytics notice is not acknowledged and not manually triggered)
  // If manually triggered (via settings), showInstallPrompt will be true even if analyticsAcknowledged is false
  // Fix: Only check sessionStorage on client
  // Fix: Only render the prompt on the client, never on the server
  if (
    typeof window === 'undefined' ||
    isCapacitorApp ||
    isInstalled ||
    (typeof window !== 'undefined' && window.sessionStorage.getItem('pwa-install-dismissed') === 'true' && !analyticsAcknowledged) ||
    !showInstallPrompt
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-background border border-border rounded-lg shadow-xl max-w-sm animate-slide-up">
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-1">Install TGATB App</h3>
            <p className="text-xs text-muted-foreground">
              Better experience with offline support and quick access
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="p-1 h-6 w-6 flex-shrink-0 ml-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="flex items-center gap-1 h-8 px-2 text-xs"
          >
            <Download className="h-3 w-3" />
            Install
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            className="h-8 px-2 text-xs"
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
