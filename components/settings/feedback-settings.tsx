"use client";

import { UserSettings } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import { Volume2, Vibrate } from "lucide-react";

interface FeedbackSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function FeedbackSettings({ settings, onUpdateSettings }: FeedbackSettingsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Feedback</h2>

      <div className="space-y-2">
        {/* Sound toggle */}
        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-all duration-200 theme-transition"
          onClick={() => onUpdateSettings({ soundEnabled: !(settings.soundEnabled !== false) })}
        >
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <div>
              <span className="font-medium">Sound Effects</span>
              <p className="text-sm text-muted-foreground">Play sounds on habit actions</p>
            </div>
          </div>
          <Switch
            checked={settings.soundEnabled !== false}
            onCheckedChange={(checked) => onUpdateSettings({ soundEnabled: checked })}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Haptic toggle */}
        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-all duration-200 theme-transition"
          onClick={() => onUpdateSettings({ hapticEnabled: !(settings.hapticEnabled !== false) })}
        >
          <div className="flex items-center space-x-3">
            <Vibrate className="w-5 h-5 text-muted-foreground" />
            <div>
              <span className="font-medium">Haptic Feedback</span>
              <p className="text-sm text-muted-foreground">Vibration on habit actions (mobile)</p>
            </div>
          </div>
          <Switch
            checked={settings.hapticEnabled !== false}
            onCheckedChange={(checked) => onUpdateSettings({ hapticEnabled: checked })}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}
