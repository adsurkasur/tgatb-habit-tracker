"use client";

import { HapticProfile, UserSettings } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Volume2, Vibrate } from "lucide-react";
import { isHapticsSupported } from "@/lib/haptics";
import { feedbackButtonPress } from "@/lib/feedback";
import { useTranslations } from "next-intl";

interface FeedbackSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function FeedbackSettings({ settings, onUpdateSettings }: FeedbackSettingsProps) {
  const t = useTranslations("FeedbackSettings");
  const hapticsAvailable = isHapticsSupported();
  const hapticEnabled = hapticsAvailable && settings.hapticEnabled !== false;
  const activeProfile = settings.hapticProfile ?? "balanced";

  const profileOptions: Array<{ value: HapticProfile; label: string }> = [
    { value: "subtle", label: "Subtle" },
    { value: "balanced", label: "Balanced" },
    { value: "punchy", label: "Punchy" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <div className="space-y-2">
        {/* Sound toggle */}
        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-all duration-200 theme-transition"
          onClick={() => { feedbackButtonPress(); onUpdateSettings({ soundEnabled: !(settings.soundEnabled !== false) }); }}
        >
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <div>
              <span className="font-medium">{t("sound.title")}</span>
              <p className="text-sm text-muted-foreground">{t("sound.description")}</p>
            </div>
          </div>
          <Switch
            checked={settings.soundEnabled !== false}
            onCheckedChange={(checked) => onUpdateSettings({ soundEnabled: checked })}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Haptic card: toggle + collapsible profile picker */}
        <div className={`bg-muted material-radius transition-all duration-200 theme-transition ${
          !hapticsAvailable ? "opacity-50" : ""
        }`}>
          <div
            className={`flex items-center justify-between p-4 ${
              !hapticsAvailable
                ? "cursor-not-allowed"
                : "cursor-pointer state-layer-hover"
            } material-radius`}
            onClick={hapticsAvailable ? () => {
              feedbackButtonPress();
              onUpdateSettings({ hapticEnabled: !hapticEnabled });
            } : undefined}
          >
            <div className="flex items-center space-x-3">
              <Vibrate className="w-5 h-5 text-muted-foreground" />
              <div>
                <span className="font-medium">{t("haptic.title")}</span>
                <p className="text-sm text-muted-foreground">
                  {!hapticsAvailable
                    ? t("haptic.notSupported")
                    : hapticEnabled
                      ? `Profile: ${profileOptions.find((p) => p.value === activeProfile)?.label ?? "Balanced"}`
                      : "Off"}
                </p>
              </div>
            </div>
            <Switch
              checked={hapticEnabled}
              onCheckedChange={(checked) => onUpdateSettings({ hapticEnabled: checked })}
              disabled={!hapticsAvailable}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            hapticsAvailable && hapticEnabled
              ? "max-h-40 opacity-100 border-t border-border/60"
              : "max-h-0 opacity-0"
          }`}>
            <div className="p-4">
              <label className="text-sm font-medium mb-2 block">Haptic Profile</label>
              <Select
                value={activeProfile}
                onValueChange={(value) => onUpdateSettings({ hapticProfile: value as HapticProfile })}
                disabled={!hapticsAvailable || !hapticEnabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {profileOptions.map((profile) => (
                    <SelectItem key={profile.value} value={profile.value}>
                      {profile.label}
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
