import { UserSettings, CelebrationConfettiIntensity, CelebrationMotion } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PartyPopper } from "lucide-react";
import { feedbackButtonPress } from "@/lib/feedback";
import { useTranslations } from "next-intl";
import { Capacitor } from "@capacitor/core";
import { isHapticsSupported } from "@/lib/haptics";

interface CelebrationSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function CelebrationSettings({ settings, onUpdateSettings }: CelebrationSettingsProps) {
  const t = useTranslations("CelebrationSettings");
  const effectsEnabled = settings.celebrationEffectsEnabled !== false;
  const isNativeApp = Capacitor.isNativePlatform();
  const supportsHaptics = isHapticsSupported();
  const hapticsAvailable = isNativeApp && supportsHaptics;
  const hapticsEnabled = hapticsAvailable && settings.celebrationHapticsEnabled !== false;

  const motionOptions: Array<{ value: CelebrationMotion }> = [
    { value: "system" },
    { value: "full" },
    { value: "reduced" },
  ];

  const confettiOptions: Array<{ value: CelebrationConfettiIntensity }> = [
    { value: "low" },
    { value: "medium" },
    { value: "high" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <div className="space-y-2">
        {/* Celebration overlay toggle + collapsible settings */}
        <div className="bg-muted material-radius transition-all duration-200 theme-transition">
          <div
            className="flex items-center justify-between p-4 cursor-pointer state-layer-hover material-radius"
            onClick={() => {
              feedbackButtonPress();
              onUpdateSettings({ celebrationEffectsEnabled: !effectsEnabled });
            }}
          >
            <div className="flex items-center space-x-3">
              <PartyPopper className="w-5 h-5 text-muted-foreground" />
              <div>
                <span className="font-medium">{t("effects.title")}</span>
                <p className="text-sm text-muted-foreground">{t("effects.description")}</p>
              </div>
            </div>
            <Switch
              checked={effectsEnabled}
              onCheckedChange={(checked) => onUpdateSettings({ celebrationEffectsEnabled: checked })}
              onClick={(event) => event.stopPropagation()}
            />
          </div>

          {/* Expandable settings section */}
          <div
            className={`grid transition-all duration-200 ease-in-out ${
              effectsEnabled
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="space-y-3 px-4 pb-4 pt-0">
                {/* Sound toggle */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{t("sound.title")}</p>
                    <p className="text-sm text-muted-foreground">{t("sound.description")}</p>
                  </div>
                  <Switch
                    checked={settings.celebrationSoundEnabled !== false}
                    onCheckedChange={(checked) => onUpdateSettings({ celebrationSoundEnabled: checked })}
                    disabled={!effectsEnabled}
                  />
                </div>

                {/* Haptics toggle */}
                <div className={`flex items-center justify-between gap-3 ${
                  !hapticsAvailable ? "opacity-50" : ""
                }`}>
                  <div>
                    <p className="font-medium">{t("haptics.title")}</p>
                    <p className="text-sm text-muted-foreground">
                      {!isNativeApp
                        ? t("haptics.appOnly")
                        : !supportsHaptics
                          ? t("haptics.notSupported")
                          : t("haptics.description")}
                    </p>
                  </div>
                  <Switch
                    checked={hapticsEnabled}
                    onCheckedChange={(checked) => onUpdateSettings({ celebrationHapticsEnabled: checked })}
                    disabled={!effectsEnabled || !hapticsAvailable}
                  />
                </div>

                {/* Motion selector */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{t("motion.title")}</p>
                    <p className="text-sm text-muted-foreground">{t("motion.description")}</p>
                  </div>
                  <Select
                    value={settings.celebrationMotion ?? "system"}
                    onValueChange={(value) => onUpdateSettings({ celebrationMotion: value as CelebrationMotion })}
                    disabled={!effectsEnabled}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder={t("motion.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {motionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(`motion.options.${option.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Confetti intensity selector */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{t("confetti.title")}</p>
                    <p className="text-sm text-muted-foreground">{t("confetti.description")}</p>
                  </div>
                  <Select
                    value={settings.celebrationConfettiIntensity ?? "medium"}
                    onValueChange={(value) => onUpdateSettings({ celebrationConfettiIntensity: value as CelebrationConfettiIntensity })}
                    disabled={!effectsEnabled}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder={t("confetti.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {confettiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(`confetti.options.${option.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
