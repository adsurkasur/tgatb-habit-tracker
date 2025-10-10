import { ChevronRight, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function AppDeviceSettings() {
  const { isAppInstalled, isCapacitorApp, handleInstallPWA } = usePWAInstall();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">App & Device</h2>

      <div className="space-y-2">
        <div
          className={`flex items-center justify-between p-4 bg-muted material-radius transition-colors theme-transition ${
            isCapacitorApp || isAppInstalled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer state-layer-hover'
          }`}
          onClick={isCapacitorApp ? undefined : handleInstallPWA}
        >
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">
                {isCapacitorApp
                  ? "Native App"
                  : isAppInstalled
                    ? "App Installed"
                    : "Install App"}
              </span>
              <span className="text-xs text-muted-foreground">
                {isCapacitorApp
                  ? "You're using the native Android app"
                  : isAppInstalled
                    ? "TGATB is already on your device"
                    : "Add to home screen"}
              </span>
            </div>
          </div>
          {!isCapacitorApp && !isAppInstalled && (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}
