import { Button } from "@/components/ui/button";
import { SUPPORT_AUTHOR, SUPPORT_EMAIL } from "@/lib/support-email";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowLeft, 
  Moon, 
  Globe, 
  ChevronRight, 
  User, 
  CloudUpload, 
  Download, 
  Upload,
  HelpCircle,
  Mail,
  Smartphone,
  Maximize
} from "lucide-react";
import { UserSettings, MotivatorPersonality } from "@shared/schema";
import type { Habit } from "@shared/schema";
import { useRef, useState, useEffect } from "react";
import { debounce } from "@/lib/utils/debounce"; // Citation: https://lodash.com/docs/4.17.15#debounce
import { useMobileBackNavigation } from "@/hooks/use-mobile-back-navigation";
import { useToast } from "@/hooks/use-toast";
import { useStatusBar } from "@/hooks/use-status-bar";
// MAJOR FIX: Use unified system bars instead of conflicting implementations
import { systemBarsUtils } from "@/hooks/use-system-bars-unified";
import { Capacitor } from '@capacitor/core';
// Import mobile auth and drive helpers
import { signInWithGoogle } from "@/mobile/google-auth";
import { uploadHabitsToDrive } from "@/mobile/drive-sync";


type SettingsScreenProps = {
  open: boolean;
  onClose: () => void;
  settings: UserSettings;
  habits: Habit[];
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onExportData: () => void;
  onImportData: (jsonData: string) => void;
  onShowHelp?: () => void;
};

export function SettingsScreen({ 
  open, 
  onClose, 
  settings, 
  habits,
  onUpdateSettings, 
  onExportData, 
  onImportData,
  onShowHelp
}: SettingsScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setCanInstallPWA] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // Persistent guard to block duplicate export triggers (see: https://react.dev/reference/react/useRef)
  const exportInProgressRef = useRef(false);
  const { isNative } = useStatusBar();
  const isCapacitorApp = Capacitor.isNativePlatform();
  
  // Fullscreen managed centrally via Capacitor helpers

  // Check PWA install availability
  useEffect(() => {
    // Don't show PWA install option if running in Capacitor (native app)
    if (isCapacitorApp) {
      setCanInstallPWA(false);
      setIsAppInstalled(true); // Consider it "installed" since it's the native app
      return;
    }

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInWebAppiOS = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsAppInstalled(isStandalone || isInWebAppiOS);

    // Listen for install prompt availability
  const handler = (e: Event) => {
      e.preventDefault();
      setCanInstallPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isCapacitorApp]);

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

  // Citation: https://kentcdodds.com/blog/preventing-double-form-submission
  // Citation: https://www.joshwcomeau.com/react/throttle-debounce/
  const handleExportClick = debounce(async () => {
    // Persistent guard blocks duplicate triggers from React/browser quirks
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    setIsExporting(true);
    try {
      await onExportData();
      // Show success toast only on web non-FSA fallback; skip on native (share UI handles feedback)
      if (!('showSaveFilePicker' in window) && !isCapacitorApp) {
        toast({
          title: "Export Successful",
          description: "Data has been downloaded to your Downloads folder",
          duration: 3000,
        });
      }
  } catch (err: unknown) {
      // Citation: https://developer.mozilla.org/en-US/docs/Web/API/showSaveFilePicker
      // Citation: https://stackoverflow.com/questions/67716344/download-event-triggers-twice-in-chrome
      if (
        err &&
        typeof err === 'object' &&
        ((
          'name' in err && (err as { name?: string }).name === 'AbortError'
        ) || (
          'message' in err && typeof (err as { message?: string }).message === 'string' && (err as { message?: string }).message !== undefined && (err as { message?: string }).message!.includes('The user aborted a request')
        ))
      ) {
        // User canceled the file dialog, do nothing (no error toast)
      } else {
        toast({
          title: "Export Failed",
          description: "There was an error exporting your data. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsExporting(false);
      exportInProgressRef.current = false;
    }
  }, 500); // 500ms debounce for robustness

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const jsonData = event.target?.result as string;
        if (jsonData) {
          onImportData(jsonData);
        }
      };
      reader.readAsText(file);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleFullscreenToggle = async (enabled: boolean) => {
    const newSettings = { ...settings, fullscreenMode: enabled };
    onUpdateSettings({ fullscreenMode: enabled });
    try {
      const { HabitStorage } = await import("@/lib/habit-storage");
      await HabitStorage.saveSettings(newSettings);
  } catch {
      // fallback: do nothing
    }
    if (isNative) {
      // MAJOR FIX: Use unified system bars implementation
      await systemBarsUtils.setFullscreen(enabled);
      toast({
        title: enabled ? "Fullscreen Mode Enabled" : "Fullscreen Mode Disabled",
        description: enabled 
          ? "Status bar is now hidden for immersive experience"
          : "Status bar is now visible",
      });
    } else {
      toast({
        title: "Setting Saved",
        description: "Fullscreen preference saved (applies to mobile app)",
      });
    }
  };



  const handleLoginClick = async () => {
    try {
      const accessToken = await signInWithGoogle();
      if (accessToken) {
        toast({
          title: "Sign-in Successful",
          description: "You are now signed in with Google.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Sign-in Failed",
          description: "Could not sign in with Google.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch {
      toast({
        title: "Sign-in Error",
        description: "An error occurred during sign-in.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleBackupClick = async () => {
    try {
      // Example: backup current habits
      const habitsToExport = habits || [];
      const accessToken = await signInWithGoogle();
      if (!accessToken) throw new Error("Not signed in");
      const fileId = await uploadHabitsToDrive(habitsToExport, accessToken);
      if (fileId) {
        toast({
          title: "Backup Successful",
          description: "Your habits have been backed up to Google Drive.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Backup Failed",
          description: "Could not upload habits to Drive.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch {
      toast({
        title: "Backup Error",
        description: "An error occurred during backup.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleInstallPWA = () => {
    if (isAppInstalled) {
      toast({
        title: "App Already Installed",
        description: "TGATB is already installed on your device!",
        duration: 3000,
      });
      return;
    }

    // Clear any previous dismissal
    sessionStorage.removeItem('pwa-install-dismissed');
    
    // Try to trigger install prompt
    const event = new CustomEvent('trigger-pwa-install');
    window.dispatchEvent(event);

    toast({
  title: "Install Prompt",
  description: "If supported, an install prompt should appear. Look for the install button in your browser's address bar if no popup appears.",
  duration: 3000,
    });
  };

  return (
    <div 
      className={`fixed inset-0 bg-background z-50 transform transition-transform duration-300 theme-transition flex flex-col ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <header className="bg-header border-b border-border px-4 py-3 flex items-center space-x-4 surface-elevation-2 flex-shrink-0">
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

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
              className={`flex items-center justify-between p-4 bg-muted material-radius transition-colors theme-transition ${
                isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer state-layer-hover'
              }`}
              onClick={isExporting ? undefined : handleExportClick} // Debounced for robustness
            >
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">
                  {isExporting ? "Exporting..." : "Export Data"}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div 
              className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
              onClick={handleImportClick}
            >
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Import Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div 
              className={`flex items-center justify-between p-4 bg-muted material-radius transition-colors theme-transition ${
                isCapacitorApp 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer state-layer-hover'
              }`}
              onClick={isCapacitorApp ? undefined : handleInstallPWA}
            >
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {isCapacitorApp ? "Native App" : "Install App"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isCapacitorApp 
                      ? "You're using the native Android app" 
                      : isAppInstalled 
                        ? "Already installed" 
                        : "Add to home screen"
                    }
                  </span>
                </div>
              </div>
              {!isCapacitorApp && (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            {/* Fullscreen Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted material-radius theme-transition">
              <div className="flex items-center space-x-3">
                <Maximize className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">Fullscreen Mode</span>
                  <span className="text-xs text-muted-foreground">
                    {isNative ? "Hide status bar for immersive experience" : "Mobile app setting"}
                  </span>
                </div>
              </div>
              <Switch
                checked={settings.fullscreenMode}
                onCheckedChange={handleFullscreenToggle}
                disabled={!isNative}
              />
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

        {/* Help & Support Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Help & Support</h2>
          
          <div className="space-y-2">
            {onShowHelp && (
              <div 
                className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
                onClick={onShowHelp}
              >
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Show Welcome Guide</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            
            <div 
              className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
              onClick={() => window.open(`mailto:${SUPPORT_EMAIL}?subject=Habit%20Tracker%20Support&body=Hi%2C%20I%20need%20support.`, '_blank')}
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Contact {SUPPORT_AUTHOR} via email</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
