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

interface CelebrationSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function CelebrationSettings({ settings, onUpdateSettings }: CelebrationSettingsProps) {
  const t = useTranslations("CelebrationSettings");
  const effectsEnabled = settings.celebrationEffectsEnabled !== false;

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
        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-all duration-200 theme-transition"
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

        <div className={`bg-muted material-radius transition-all duration-200 theme-transition ${
          effectsEnabled ? "opacity-100" : "opacity-50"
        }`}>
          <div className="grid gap-3 p-4">
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

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{t("haptics.title")}</p>
                <p className="text-sm text-muted-foreground">{t("haptics.description")}</p>
              </div>
              <Switch
                checked={settings.celebrationHapticsEnabled !== false}
                onCheckedChange={(checked) => onUpdateSettings({ celebrationHapticsEnabled: checked })}
                disabled={!effectsEnabled}
              />
            </div>

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
  );
}
