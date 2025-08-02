"use client";

import { usePWA } from "@/hooks/use-pwa";
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <Alert className="fixed top-4 left-4 right-4 md:left-auto md:max-w-sm z-50 bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        <span>You're offline. Some features may be limited.</span>
      </AlertDescription>
    </Alert>
  );
}

export default OfflineIndicator;
