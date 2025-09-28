import { useState, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { useToast } from "@/hooks/use-toast";

export function usePWAInstall() {
  const { toast } = useToast();
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const isCapacitorApp = Capacitor.isNativePlatform();

  useEffect(() => {
    // Don't show PWA install option if running in Capacitor (native app)
    if (isCapacitorApp) {
      setCanInstallPWA(false);
      setIsAppInstalled(true); // Consider it "installed" since it's the native app
      return;
    }

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsAppInstalled(isStandalone || isInWebAppiOS);

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