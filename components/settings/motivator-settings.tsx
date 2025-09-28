import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserSettings, MotivatorPersonality } from "@shared/schema";

interface MotivatorSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function MotivatorSettings({ settings, onUpdateSettings }: MotivatorSettingsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Character Motivator</h2>

      <div className="p-4 bg-muted material-radius theme-transition">
        <Label className="font-medium block mb-3">Personality Type</Label>
        <RadioGroup
          value={settings.motivatorPersonality}
          onValueChange={(value) => onUpdateSettings({ motivatorPersonality: value as MotivatorPersonality })}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="positive" id="positive" />
            <Label htmlFor="positive" className="cursor-pointer flex-1">
              <div>
                <span className="font-medium">Positive</span>
                <p className="text-sm text-muted-foreground">Encouraging and supportive</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <RadioGroupItem value="adaptive" id="adaptive" />
            <Label htmlFor="adaptive" className="cursor-pointer flex-1">
              <div>
                <span className="font-medium">Adaptive</span>
                <p className="text-sm text-muted-foreground">Balanced and realistic</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <RadioGroupItem value="harsh" id="harsh" />
            <Label htmlFor="harsh" className="cursor-pointer flex-1">
              <div>
                <span className="font-medium">Harsh</span>
                <p className="text-sm text-muted-foreground">Direct and challenging</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}