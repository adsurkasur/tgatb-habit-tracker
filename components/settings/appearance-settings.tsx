import { Switch } from "@/components/ui/switch";
import { ChevronRight, Moon, Globe, Maximize } from "lucide-react";
import { UserSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useStatusBar } from "@/hooks/use-status-bar";
// MAJOR FIX: Use unified system bars instead of conflicting implementations
import { systemBarsUtils } from "@/hooks/use-system-bars-unified";

interface AppearanceSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function AppearanceSettings({ settings, onUpdateSettings }: AppearanceSettingsProps) {
  const { toast } = useToast();
  const { isNative } = useStatusBar();

  // Always force fullscreenMode to false if not native
  const effectiveFullscreenMode = isNative ? settings.fullscreenMode : false;

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
      await systemBarsUtils.setFullscreen(enabled);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Appearance</h2>

      <div className="space-y-2">
        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
          onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
        >
          <div className="flex items-center space-x-3">
            <Moon className="w-5 h-5 text-muted-foreground" />
            <div>
              <span className="font-medium">Dark Mode</span>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
            </div>
          </div>
          <Switch
            checked={settings.darkMode}
            onCheckedChange={(checked) => onUpdateSettings({ darkMode: checked })}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
          onClick={() => {
            toast({
              title: "Upcoming Feature!",
              description: "Language selection coming soon. Stay tuned! 🌐",
              duration: 3000,
            });
          }}
        >
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <div>
              <span className="font-medium">Language</span>
              <p className="text-sm text-muted-foreground">
                {settings.language === "en" ? "English" : "Bahasa Indonesia"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

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
      </div>
    </div>
  );
}