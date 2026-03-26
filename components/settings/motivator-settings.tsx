import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserSettings, MotivatorPersonality } from "@shared/schema";
import { feedbackButtonPress } from "@/lib/feedback";
import { useTranslations } from "next-intl";

interface MotivatorSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function MotivatorSettings({ settings, onUpdateSettings }: MotivatorSettingsProps) {
  const t = useTranslations("MotivatorSettings");
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <div className="p-4 bg-muted material-radius theme-transition">
        <Label className="font-medium block mb-3">{t("personalityType")}</Label>
        <RadioGroup
          value={settings.motivatorPersonality}
          onValueChange={(value) => { feedbackButtonPress(); onUpdateSettings({ motivatorPersonality: value as MotivatorPersonality }); }}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="positive" id="positive" />
            <Label htmlFor="positive" className="cursor-pointer flex-1">
              <div>
                <span className="font-medium">{t("personality.positive.title")}</span>
                <p className="text-sm text-muted-foreground">{t("personality.positive.description")}</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <RadioGroupItem value="adaptive" id="adaptive" />
            <Label htmlFor="adaptive" className="cursor-pointer flex-1">
              <div>
                <span className="font-medium">{t("personality.adaptive.title")}</span>
                <p className="text-sm text-muted-foreground">{t("personality.adaptive.description")}</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <RadioGroupItem value="harsh" id="harsh" />
            <Label htmlFor="harsh" className="cursor-pointer flex-1">
              <div>
                <span className="font-medium">{t("personality.harsh.title")}</span>
                <p className="text-sm text-muted-foreground">{t("personality.harsh.description")}</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}