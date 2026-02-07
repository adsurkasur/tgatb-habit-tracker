import { useState, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { useToast } from "@/hooks/use-toast";

export function usePWAInstall() {
  const { toast } = useToast();
  const isCapacitorApp = Capacitor.isNativePlatform();
  const [canInstallPWA, setCanInstallPWA] = useState(() => isCapacitorApp ? false : false);
  const [isAppInstalled, setIsAppInstalled] = useState(() => {
    if (isCapacitorApp) return true;
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
  });

  useEffect(() => {
    // Don't show PWA install option if running in Capacitor (native app)
    if (isCapacitorApp) {
      return;
    }

    // Listen for install prompt availability
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      setCanInstallPWA(true);
    };

    // Listen for successful installation
    const appInstalledHandler = () => {
      setIsAppInstalled(true);
      toast({
        title: "Installation Complete",
        description: "The app has been successfully installed!",
      });
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, [isCapacitorApp, toast]);

  const handleInstallPWA = () => {
    if (isAppInstalled) {
      toast({
        title: "Already Installed",
        description: "You have already installed the app.",
        duration: 3000,
      });
      return;
    }

    // Clear any previous dismissal
    sessionStorage.removeItem('pwa-install-dismissed');

    // Try to trigger install prompt
    const event = new CustomEvent('trigger-pwa-install');
    window.dispatchEvent(event);

    toast({
      title: "Install Prompt",
      description: "If supported, an install prompt should appear. Look for the install button in your browser's address bar if no popup appears.",
      duration: 3000,
    });
  };

  return {
    canInstallPWA,
    isAppInstalled,
    isCapacitorApp,
    handleInstallPWA,
  };
}