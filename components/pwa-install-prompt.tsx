"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Clear any previous dismissal for testing
    sessionStorage.removeItem('pwa-install-dismissed');

    // Listen for the beforeinstallprompt event
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    // Listen for app installed event
    const appInstalledHandler = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    };

    window.addEventListener('appinstalled', appInstalledHandler);

    // For testing - show install prompt after 2 seconds if not installed
    const timer = setTimeout(() => {
      if (!isStandalone && !isInWebAppiOS) {
        setShowInstallPrompt(true);
      }
    }, 2000);

    // Listen for manual trigger from settings
    const handleManualTrigger = () => {
      sessionStorage.removeItem('pwa-install-dismissed');
      setShowInstallPrompt(true);
    };

    window.addEventListener('trigger-pwa-install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
      window.removeEventListener('appinstalled', appInstalledHandler);
      window.removeEventListener('trigger-pwa-install', handleManualTrigger);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember user dismissed the prompt for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm w-full">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Install TGATB App</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Install our app for a better experience with offline support and quick access.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Install
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
            >
              Not now
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="p-1 h-6 w-6"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
