import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, User, CloudUpload, CloudDownload, Download, Upload, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { UserSettings } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useCloudBackup } from "@/hooks/use-cloud-backup";
import { useDataExport } from "@/hooks/use-data-export";

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
  const { toast } = useToast();
  
  const toggleAutoSync = () => {
    onUpdateSettings({ autoSync: !settings.autoSync });
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

        {/* Auto Sync Toggle (Switch) */}
        <div
          className={`flex items-center justify-between p-4 bg-muted material-radius transition-colors theme-transition ${
            !clientReady || !isLoggedIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer state-layer-hover'
          }`}
          onClick={clientReady && isLoggedIn ? toggleAutoSync : undefined}
        >
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Auto sync</div>
              <div className="text-sm text-muted-foreground">Automatically sync changes to Google Drive when signed in.</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Switch
              checked={!!settings.autoSync}
              onCheckedChange={(checked) => onUpdateSettings({ autoSync: checked })}
              disabled={!clientReady || !isLoggedIn}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
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