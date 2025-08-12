import { Button } from "@/components/ui/button";
import Image from "next/image";
import { DeleteAllHabitsModal } from "@/components/delete-all-habits-modal";
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
  CloudDownload,
  Download, 
  Upload,
  HelpCircle,
  Mail,
  Smartphone,
  Maximize,
  Trash2
} from "lucide-react";
import { UserSettings, MotivatorPersonality } from "@shared/schema";
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
import { app } from "../web/firebase"; // Ensure Firebase is initialized for web
// Removed unused import: uploadHabitsToDrive


type SettingsScreenProps = {
  open: boolean;
  onClose: () => void;
  settings: UserSettings;
  // Removed unused prop: habits
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onExportData: () => void;
  onImportData: (jsonData: string) => void;
  onShowHelp?: () => void;
  onDeleteAllHabits?: () => Promise<void>;
};

export function SettingsScreen({ 
  open, 
  onClose, 
  settings, 
  // Removed unused prop: habits
  onUpdateSettings, 
  onExportData, 
  onImportData,
  onShowHelp,
  onDeleteAllHabits
}: SettingsScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setCanInstallPWA] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportInProgressRef = useRef(false);
  const { isNative } = useStatusBar();
  const isCapacitorApp = Capacitor.isNativePlatform();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<{ name?: string; photoUrl?: string } | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load profile info on mount (web)
  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined' && !isCapacitorApp) {
        const accessToken = localStorage.getItem('googleAccessToken');
        setIsLoggedIn(!!accessToken);
        const name = localStorage.getItem('googleProfileName') || undefined;
        const photoUrl = localStorage.getItem('googleProfilePhoto') || undefined;
        if (name || photoUrl) setProfile({ name, photoUrl });
      } else if (isCapacitorApp) {
        const { Preferences } = await import('@capacitor/preferences');
        const accessToken = (await Preferences.get({ key: 'googleAccessToken' })).value;
        setIsLoggedIn(!!accessToken);
        const name = (await Preferences.get({ key: 'googleProfileName' })).value || undefined;
        const photoUrl = (await Preferences.get({ key: 'googleProfilePhoto' })).value || undefined;
        if (name || photoUrl) setProfile({ name, photoUrl });
      }
      setClientReady(true);
    })();
  }, [isCapacitorApp]);
  
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
      if (!isLoggedIn) {
        // Login flow
        console.debug('[GoogleAuth] Attempting sign-in...');
        let accessToken: string | null = null;
        if (typeof window !== 'undefined' && !isCapacitorApp) {
          // Web platform
          const { signInWithGoogleWeb } = await import("../web/google-auth");
          const { getAuth } = await import("firebase/auth");
          accessToken = await signInWithGoogleWeb();
          if (accessToken) {
            localStorage.setItem('googleAccessToken', accessToken);
            // Get user profile info from Firebase Auth
            const auth = getAuth(app);
            const user = auth.currentUser;
            if (user) {
              localStorage.setItem('googleProfileName', user.displayName || '');
              localStorage.setItem('googleProfilePhoto', user.photoURL || '');
              setProfile({ name: user.displayName || '', photoUrl: user.photoURL || '' });
            }
            setIsLoggedIn(true);
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
            console.error('[GoogleAuth] No access token returned from sign-in');
          }
        } else {
          // Mobile (Capacitor)
          const result = await signInWithGoogle();
          // result can be string (legacy) or object (new)
          let accessToken: string | null = null;
          let name: string | undefined = undefined;
          let photoUrl: string | undefined = undefined;
          if (typeof result === 'string') {
            accessToken = result;
          } else if (result && typeof result === 'object') {
            accessToken = result.accessToken || null;
            name = result.name || undefined;
            photoUrl = result.photoUrl || undefined;
          }
          if (accessToken) {
            const { Preferences } = await import('@capacitor/preferences');
            await Preferences.set({ key: 'googleAccessToken', value: accessToken });
            if (name) await Preferences.set({ key: 'googleProfileName', value: name });
            if (photoUrl) await Preferences.set({ key: 'googleProfilePhoto', value: photoUrl });
            setProfile({ name, photoUrl });
            setIsLoggedIn(true);
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
            console.error('[GoogleAuth] No access token returned from sign-in');
          }
        }
      } else {
        // Logout flow
        if (typeof window !== 'undefined' && !isCapacitorApp) {
          localStorage.removeItem('googleAccessToken');
          localStorage.removeItem('googleProfileName');
          localStorage.removeItem('googleProfilePhoto');
          setIsLoggedIn(false);
          setProfile(null);
          toast({
            title: "Logged Out",
            description: "You have been logged out of Google.",
            duration: 3000,
          });
        } else {
          const { Preferences } = await import('@capacitor/preferences');
          await Preferences.remove({ key: 'googleAccessToken' });
          await Preferences.remove({ key: 'googleProfileName' });
          await Preferences.remove({ key: 'googleProfilePhoto' });
          setIsLoggedIn(false);
          setProfile(null);
          toast({
            title: "Logged Out",
            description: "You have been logged out of Google.",
            duration: 3000,
          });
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('No credentials available')) {
        toast({
          title: "Sign-in Error",
          description: "No Google account found on this device. Please add an account and try again.",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        toast({
          title: isLoggedIn ? "Logout Error" : "Sign-in Error",
          description: `An error occurred during ${isLoggedIn ? 'logout' : 'sign-in'}.`,
          variant: "destructive",
          duration: 3000,
        });
      }
      console.error(`[GoogleAuth] ${isLoggedIn ? 'logout' : 'sign-in'} threw error:`, err);
    }
  };

  const handleBackupClick = async () => {
    try {
      // Use full export bundle for Drive backup
      let accessToken: string | null = null;
      let result: unknown = null;
      // Get full export bundle
      const { HabitStorage } = await import("@/lib/habit-storage");
      const exportJson = await HabitStorage.exportData();
      console.debug('[SettingsScreen] Exporting full bundle:', exportJson);
      if (typeof window !== 'undefined' && !Capacitor.isNativePlatform()) {
        // Web platform
        accessToken = localStorage.getItem('googleAccessToken');
        if (!accessToken) {
          toast({
            title: "Not Signed In",
            description: "You must be signed in to export to Google Drive.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }
        const { uploadToDrive } = await import("../web/drive-sync");
        result = await uploadToDrive(exportJson, accessToken);
        console.debug('[SettingsScreen] Web Drive backup result:', result);
        toast({
          title: "Backup Successful",
          description: "Your data has been backed up to Google Drive (web).",
          duration: 3000,
        });
      } else {
        // Mobile (Capacitor)
        const { Preferences } = await import('@capacitor/preferences');
        accessToken = (await Preferences.get({ key: 'googleAccessToken' })).value;
        if (!accessToken) {
          toast({
            title: "Not Signed In",
            description: "You must be signed in to export to Google Drive.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }
        const { uploadDataToDrive } = await import("@/mobile/drive-sync");
        result = await uploadDataToDrive(exportJson, accessToken);
        console.debug('[SettingsScreen] Mobile Drive backup result:', result);
        if (result) {
          toast({
            title: "Backup Successful",
            description: "Your data has been backed up to Google Drive (mobile).",
            duration: 3000,
          });
        } else {
          toast({
            title: "Backup Failed",
            description: "Could not upload data to Drive.",
            variant: "destructive",
            duration: 3000,
          });
        }
      }
    } catch (err) {
      toast({
        title: "Backup Error",
        description: "An error occurred during backup.",
        variant: "destructive",
        duration: 3000,
      });
      console.error('[SettingsScreen] Drive backup error:', err instanceof Error ? err.stack : err);
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
            {!clientReady ? null : (
              <div 
                className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
                onClick={handleLoginClick}
              >
                <div className="flex items-center space-x-3">
                  {isLoggedIn && profile?.photoUrl ? (
                    <Image
                      src={profile.photoUrl}
                      alt={profile.name || "Profile"}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => {}}
                    />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">
                    {isLoggedIn
                      ? `Logout from${profile?.name ? ` ${profile.name}` : ''}`
                      : 'Login'}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            )}

            {/* Export to Cloud Button */}
            <div 
              className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
              onClick={handleBackupClick}
            >
              <div className="flex items-center space-x-3">
                <CloudUpload className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Export to Cloud</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Import from Cloud Button */}
            <div
              className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
              onClick={async () => {
                try {
                  let accessToken: string | null = null;
                  let cloudJson: string = "";
                  if (typeof window !== 'undefined' && !isCapacitorApp) {
                    // Web platform
                    accessToken = localStorage.getItem('googleAccessToken');
                    if (!accessToken) {
                      toast({
                        title: "Not Signed In",
                        description: "You must be signed in to import from Google Drive.",
                        variant: "destructive",
                        duration: 3000,
                      });
                      return;
                    }
                    // List files named 'habits-backup.json' in Drive
                    const listRes = await fetch('https://www.googleapis.com/drive/v3/files?q=name%3D%27habits-backup.json%27&spaces=drive&fields=files(id%2Cname%2CmodifiedTime)&orderBy=modifiedTime desc', {
                      headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    const listJson = await listRes.json();
                    const files = listJson.files || [];
                    console.debug('[SettingsScreen] Web Drive file list:', files);
                    if (!files.length) throw new Error("No backup file found in Drive");
                    const fileId = files[0].id;
                    // Download backup from Drive
                    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                      headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    cloudJson = await res.text();
                    console.debug('[SettingsScreen] Web Drive raw backup JSON:', cloudJson);
                  } else {
                    // Mobile (Capacitor)
                    const { Preferences } = await import('@capacitor/preferences');
                    accessToken = (await Preferences.get({ key: 'googleAccessToken' })).value;
                    if (!accessToken) {
                      toast({
                        title: "Not Signed In",
                        description: "You must be signed in to import from Google Drive.",
                        variant: "destructive",
                        duration: 3000,
                      });
                      return;
                    }
                    const { downloadLatestHabitsFromDrive } = await import("@/mobile/drive-sync");
                    // Download latest backup
                    const rawCloudJson = await downloadLatestHabitsFromDrive(accessToken);
                    // If mobile helper returns an array, convert to string
                    if (Array.isArray(rawCloudJson)) {
                      cloudJson = JSON.stringify(rawCloudJson);
                    } else {
                      cloudJson = typeof rawCloudJson === 'string' ? rawCloudJson : JSON.stringify(rawCloudJson);
                    }
                    console.debug('[SettingsScreen] Mobile Drive raw backup JSON:', cloudJson);
                  }
                  if (cloudJson && cloudJson.length > 0) {
                    onImportData(cloudJson);
                    toast({
                      title: "Import Successful",
                      description: "Your habits have been imported from Google Drive.",
                      duration: 3000,
                    });
                  } else {
                    toast({
                      title: "Import Failed",
                      description: "No habits found in cloud.",
                      variant: "destructive",
                      duration: 3000,
                    });
                  }
                } catch (err) {
                  let message = "An error occurred during cloud import.";
                  if (err instanceof Error) {
                    message = err.message;
                  }
                  toast({
                    title: "Import Error",
                    description: message,
                    variant: "destructive",
                    duration: 3000,
                  });
                  console.error('[SettingsScreen] Cloud import error:', err instanceof Error ? err.stack : err);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <CloudDownload className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Import from Cloud</span>
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

        {/* Habit Management Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Habit Management</h2>
          <div
            className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-colors theme-transition"
            onClick={() => setShowDeleteModal(true)}
          >
            <div className="flex items-center space-x-3">
              <Trash2 className="w-5 h-5 text-destructive" />
              <span className="font-medium text-destructive">Delete All Habits</span>
            </div>
            <ChevronRight className="w-5 h-5 text-destructive" />
          </div>
        </div>

        <DeleteAllHabitsModal
          open={showDeleteModal}
          loading={deleteLoading}
          onCancel={() => setShowDeleteModal(false)}
          onDelete={async () => {
            setDeleteLoading(true);
            try {
              if (onDeleteAllHabits) {
                await onDeleteAllHabits();
                toast({
                  title: 'All habits deleted',
                  description: 'Your habit list has been cleared.',
                  duration: 3000,
                });
              } else {
                toast({
                  title: 'Delete Failed',
                  description: 'No delete handler provided.',
                  variant: 'destructive',
                  duration: 3000,
                });
              }
            } catch {
              toast({
                title: 'Delete Failed',
                description: 'An error occurred while deleting habits.',
                variant: 'destructive',
                duration: 3000,
              });
            } finally {
              setDeleteLoading(false);
              setShowDeleteModal(false);
            }
          }}
        />

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
