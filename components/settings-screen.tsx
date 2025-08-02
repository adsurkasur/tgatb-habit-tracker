import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Moon, 
  Globe, 
  ChevronRight, 
  User, 
  CloudUpload, 
  Download, 
  Upload 
} from "lucide-react";
import { UserSettings, MotivatorPersonality } from "@shared/schema";
import { useRef } from "react";
import { useMobileBackNavigation } from "@/hooks/use-mobile-back-navigation";
import { useToast } from "@/hooks/use-toast";

interface SettingsScreenProps {
  open: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export function SettingsScreen({ 
  open, 
  onClose, 
  settings, 
  onUpdateSettings, 
  onExportData, 
  onImportData 
}: SettingsScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle mobile back navigation
  useMobileBackNavigation({
    onBackPressed: () => {
      onClose();
    },
    isActive: open
  });

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleLoginClick = () => {
    toast({
      title: "Upcoming Feature!",
      description: "User authentication and cloud sync coming soon. Stay tuned! 🚀",
      duration: 3000,
    });
  };

  const handleBackupClick = () => {
    toast({
      title: "Upcoming Feature!",
      description: "Cloud backup functionality will be available soon. Stay tuned! ☁️",
      duration: 3000,
    });
  };

  return (
    <div 
      className={`fixed inset-0 bg-background z-50 transform transition-transform duration-300 theme-transition ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <header className="bg-header border-b border-border px-4 py-3 flex items-center space-x-4 surface-elevation-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="state-layer-hover"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>

      <div className="p-6 space-y-6 overflow-y-auto h-full pb-20">
        {/* Appearance Section */}
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

        {/* Account & Data Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Account & Data</h2>
          
          <div className="space-y-2">
            <div 
              className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
              onClick={handleLoginClick}
            >
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Login / Logout</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div 
              className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
              onClick={handleBackupClick}
            >
              <div className="flex items-center space-x-3">
                <CloudUpload className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Backup to Cloud</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div 
              className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
              onClick={onExportData}
            >
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Export Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div 
              className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
              onClick={handleImportClick}
            >
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Import Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Character Motivator Section */}
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
      </div>
    </div>
  );
}
