import { Switch } from "@/components/ui/switch";
import { ChevronRight, Moon, Globe } from "lucide-react";
import { UserSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AppearanceSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function AppearanceSettings({ settings, onUpdateSettings }: AppearanceSettingsProps) {
  const { toast } = useToast();

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
      </div>
    </div>
  );
}