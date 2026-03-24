import { Switch } from "@/components/ui/switch";
import { ChevronRight, Moon, Globe, Maximize } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { UserSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useStatusBar } from "@/hooks/use-status-bar";
import { useTranslations } from "next-intl";
// MAJOR FIX: Use unified system bars instead of conflicting implementations
import { systemBarsUtils } from "@/hooks/use-system-bars-unified";
import { feedbackButtonPress } from "@/lib/feedback";
import { withLocalePath } from "@/i18n/pathname";
import type { AppLocale } from "@/i18n/routing";

interface AppearanceSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function AppearanceSettings({ settings, onUpdateSettings }: AppearanceSettingsProps) {
  const t = useTranslations("AppearanceSettings");
  const { toast } = useToast();
  const { isNative } = useStatusBar();
  const router = useRouter();
  const pathname = usePathname();

  // Always force fullscreenMode to false if not native
  const effectiveFullscreenMode = isNative ? settings.fullscreenMode : false;

  const handleFullscreenToggle = async (enabled: boolean) => {
    if (!isNative) return;
    if (enabled) {
      toast({
        title: t("toasts.fullscreenEnabledTitle"),
        description: t("toasts.fullscreenEnabledDescription"),
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

  const handleLanguageToggle = () => {
    const nextLanguage: AppLocale = settings.language === "en" ? "id" : "en";
    onUpdateSettings({ language: nextLanguage });

    const nextPath = withLocalePath(pathname || "/", nextLanguage);
    router.push(nextPath);

    toast({
      title: t("toasts.languageUpdated"),
      description: nextLanguage === "en"
        ? t("toasts.switchedToEnglish")
        : t("toasts.switchedToIndonesian"),
      duration: 2500,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <div className="space-y-2">
        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-all duration-200 theme-transition"
          onClick={() => { feedbackButtonPress(); onUpdateSettings({ darkMode: !settings.darkMode }); }}
        >
          <div className="flex items-center space-x-3">
            <Moon className="w-5 h-5 text-muted-foreground" />
            <div>
              <span className="font-medium">{t("darkMode.label")}</span>
              <p className="text-sm text-muted-foreground">{t("darkMode.description")}</p>
            </div>
          </div>
          <Switch
            checked={settings.darkMode}
            onCheckedChange={(checked) => onUpdateSettings({ darkMode: checked })}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-all duration-200 theme-transition"
          onClick={() => { feedbackButtonPress(); handleLanguageToggle(); }}
        >
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <div>
              <span className="font-medium">{t("language.title")}</span>
              <p className="text-sm text-muted-foreground">
                {settings.language === "en" ? t("language.english") : t("language.indonesian")}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <div
          className={`flex items-center justify-between p-4 bg-muted material-radius transition-all duration-200 theme-transition ${
            !isNative ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer state-layer-hover'
          }`}
          {...(isNative ? { onClick: () => { feedbackButtonPress(); handleFullscreenToggle(!settings.fullscreenMode); } } : {})}
        >
          <div className="flex items-center space-x-3">
            <Maximize className="w-5 h-5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">{t("fullscreen.title")}</span>
              <span className="text-xs text-muted-foreground">
                {isNative ? t("fullscreen.nativeDescription") : t("fullscreen.nonNativeDescription")}
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