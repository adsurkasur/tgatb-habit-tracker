import { Switch } from "@/components/ui/switch";
import { ChevronRight, Moon, Globe, Maximize } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { UserSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useStatusBar } from "@/hooks/use-status-bar";
import { useTranslations } from "next-intl";
import { useState } from "react";
// MAJOR FIX: Use unified system bars instead of conflicting implementations
import { systemBarsUtils } from "@/hooks/use-system-bars-unified";
import { feedbackButtonPress } from "@/lib/feedback";
import { withLocalePath } from "@/i18n/pathname";
import { type AppLocale } from "@/i18n/routing";
import { LanguageSelectionModal } from "@/components/language-selection-modal";

function getLocaleDisplayName(localeCode: string, displayLocale: string): string {
  try {
    const displayNames = new Intl.DisplayNames([displayLocale], { type: "language" });
    return displayNames.of(localeCode) ?? localeCode.toUpperCase();
  } catch {
    return localeCode.toUpperCase();
  }
}

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
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

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

  const handleLanguageApply = async (nextLanguage: AppLocale) => {
    const updatedSettings = { ...settings, language: nextLanguage };
    onUpdateSettings({ language: nextLanguage });

    try {
      const { HabitStorage } = await import("@/lib/habit-storage");
      await HabitStorage.saveSettings(updatedSettings);
    } catch {
      // If persistence fails, route locale still updates and settings save path remains in onUpdateSettings.
    }

    if (isNative) {
      window.dispatchEvent(new CustomEvent("tgatb:locale-change", { detail: { locale: nextLanguage } }));
      return;
    }

    const nextPath = withLocalePath(pathname || "/", nextLanguage);
    try {
      router.replace(nextPath);
    } catch {
      window.location.assign(nextPath);
    }
  };

  const handleOpenLanguageModal = () => {
    setLanguageModalOpen(true);
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
          onClick={() => {
            feedbackButtonPress();
            handleOpenLanguageModal();
          }}
        >
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <div>
              <span className="font-medium">{t("language.title")}</span>
              <p className="text-sm text-muted-foreground">
                {getLocaleDisplayName(settings.language, settings.language)}
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

      <LanguageSelectionModal
        open={languageModalOpen}
        onOpenChange={setLanguageModalOpen}
        currentLanguage={settings.language as AppLocale}
        isNative={isNative}
        onApply={handleLanguageApply}
      />
    </div>
  );
}