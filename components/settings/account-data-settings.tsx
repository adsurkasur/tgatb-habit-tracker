import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, User, CloudUpload, CloudDownload, Download, Upload, Smartphone, Maximize } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { UserSettings } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useCloudBackup } from "@/hooks/use-cloud-backup";
import { useDataExport } from "@/hooks/use-data-export";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useStatusBar } from "@/hooks/use-status-bar";
// MAJOR FIX: Use unified system bars instead of conflicting implementations
import { systemBarsUtils } from "@/hooks/use-system-bars-unified";

interface AccountDataSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onExportData: () => Promise<string>;
  onImportData: (jsonData: string) => void;
}

export function AccountDataSettings({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData
}: AccountDataSettingsProps) {

  const { isLoggedIn, profile, clientReady, handleAuth } = useAuth();
  const { handleBackup, handleRestore } = useCloudBackup();
  const { fileInputRef, isExporting, handleExportClick, handleImportClick, handleFileChange } = useDataExport(onExportData, onImportData);
  const { isAppInstalled, isCapacitorApp, handleInstallPWA } = usePWAInstall();
  const { isNative } = useStatusBar();

  // Always force fullscreenMode to false if not native
  const effectiveFullscreenMode = isNative ? settings.fullscreenMode : false;

  const { toast } = useToast();
  const handleFullscreenToggle = async (enabled: boolean) => {
    if (!isNative) return;
    if (enabled) {
      toast({
        title: "Fullscreen mode enabled",
        description: "Fullscreen mode may not display perfectly on all devices. If you notice issues, you can turn it off in settings.",
        duration: 3000,
      });
    }
    const newSettings = { ...settings, fullscreenMode: enabled };
    onUpdateSettings({ fullscreenMode: enabled });
    try {
      const { HabitStorage } = await import("@/lib/habit-storage");
      await HabitStorage.saveSettings(newSettings);
    } catch {
      // fallback: do nothing
    }
    if (isNative) {
      // MAJOR FIX: Use unified system bars implementation
      await systemBarsUtils.setFullscreen(enabled);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Account & Data</h2>

      <div className="space-y-2">
        {!clientReady ? null : (
          <div
            className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
            onClick={handleAuth}
          >
            <div className="flex items-center space-x-3">
              {isLoggedIn && profile?.photoUrl ? (
                <Image
                  src={profile.photoUrl}
                  alt={profile.name || "Profile"}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => {}}
                />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="font-medium">
                {isLoggedIn
                  ? `Logout from${profile?.name ? ` ${profile.name}` : ''}`
                  : 'Login'}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        {/* Export to Cloud Button */}
        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
          onClick={handleBackup}
        >
          <div className="flex items-center space-x-3">
            <CloudUpload className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Export to Cloud</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Import from Cloud Button */}
        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
          onClick={() => handleRestore(onImportData)}
        >
          <div className="flex items-center space-x-3">
            <CloudDownload className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Import from Cloud</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <div
          className={`flex items-center justify-between p-4 bg-muted material-radius transition-colors theme-transition ${
            isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer state-layer-hover'
          }`}
          onClick={isExporting ? undefined : handleExportClick}
        >
          <div className="flex items-center space-x-3">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">
              {isExporting ? "Exporting..." : "Export Data"}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
          onClick={handleImportClick}
        >
          <div className="flex items-center space-x-3">
            <Download className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Import Data</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

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

        {/* Fullscreen Mode Toggle */}
        <div
          className={"flex items-center justify-between p-4 bg-muted material-radius transition-colors theme-transition"}
          style={!isNative ? { pointerEvents: 'none' } : undefined}
          {...(isNative ? { onClick: () => handleFullscreenToggle(!settings.fullscreenMode) } : {})}
        >
          <div className="flex items-center space-x-3">
            <Maximize className="w-5 h-5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">Fullscreen Mode</span>
              <span className="text-xs text-muted-foreground">
                {isNative ? "Hide status bar for immersive experience" : "Mobile app setting"}
              </span>
            </div>
          </div>
          <Switch
            checked={effectiveFullscreenMode}
            onCheckedChange={handleFullscreenToggle}
            disabled={!isNative}
            onClick={e => e.stopPropagation()}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}