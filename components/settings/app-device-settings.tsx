"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, BellOff, ChevronRight, Clock, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import type { UserSettings } from "@shared/schema";
import {
  requestReminderPermission,
  checkReminderPermission,
  scheduleReminder,
  cancelReminder,
} from "@/lib/notifications";

interface AppDeviceSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function AppDeviceSettings({
  settings,
  onUpdateSettings,
}: AppDeviceSettingsProps) {
  const { isAppInstalled, isCapacitorApp, handleInstallPWA } = usePWAInstall();

  const reminderEnabled = settings.reminderEnabled ?? false;
  const reminderTime = settings.reminderTime ?? "20:00";

  // Track whether the platform actually supports notifications
  const [notificationsSupported, setNotificationsSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Check notification support and permission on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = async () => {
      // Web: check if Notification API exists
      if (!isCapacitorApp && !("Notification" in window)) {
        setNotificationsSupported(false);
        return;
      }
      const granted = await checkReminderPermission();
      setPermissionGranted(granted);

      // If settings say enabled but permission was revoked, auto-disable
      if (reminderEnabled && !granted) {
        onUpdateSettings({ reminderEnabled: false });
      }
    };
    check();
    // Re-check on visibility change (user may toggle OS permission)
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCapacitorApp]);

  const personality = settings.motivatorPersonality ?? "positive";

  // Re-schedule whenever time or personality changes and reminder is enabled
  useEffect(() => {
    if (reminderEnabled && permissionGranted && reminderTime) {
      scheduleReminder(reminderTime, personality);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderTime, reminderEnabled, permissionGranted, personality]);

  const handleToggle = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const granted = await requestReminderPermission();
        setPermissionGranted(granted);
        if (!granted) {
          // Permission denied — show guidance dialog, don't enable
          setShowPermissionDialog(true);
          return;
        }
        onUpdateSettings({
          reminderEnabled: true,
          reminderTime: reminderTime,
        });
        await scheduleReminder(reminderTime, personality);
      } else {
        onUpdateSettings({ reminderEnabled: false });
        await cancelReminder();
      }
    },
    [onUpdateSettings, reminderTime]
  );

  const handleTimeChange = useCallback(
    (newTime: string) => {
      onUpdateSettings({ reminderTime: newTime });
      // Scheduling is handled by the effect above
    },
    [onUpdateSettings]
  );

  // Status text
  const getStatusText = (): string => {
    if (!notificationsSupported) return "Notifications not supported in this browser";
    if (!reminderEnabled) return "Off";
    if (!permissionGranted) return "Permission denied — check browser/device settings";
    if (isCapacitorApp) return `Reminder set for ${reminderTime}`;
    return `Reminder set for ${reminderTime} — works best when app is open or installed as PWA`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">App & Device</h2>

      <div className="space-y-2">
        {/* Install App row */}
        <div
          className={`flex items-center justify-between p-4 bg-muted material-radius transition-all duration-200 theme-transition ${
            isCapacitorApp || isAppInstalled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer state-layer-hover"
          }`}
          onClick={isCapacitorApp ? undefined : handleInstallPWA}
        >
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">
                {isCapacitorApp
                  ? "Native App"
                  : isAppInstalled
                    ? "App Installed"
                    : "Install App"}
              </span>
              <span className="text-xs text-muted-foreground">
                {isCapacitorApp
                  ? "You're using the native Android app"
                  : isAppInstalled
                    ? "TGATB is already on your device"
                    : "Add to home screen"}
              </span>
            </div>
          </div>
          {!isCapacitorApp && !isAppInstalled && (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Daily Reminder — toggle + collapsible time picker in one card */}
        <div className={`bg-muted material-radius transition-all duration-200 theme-transition ${
          !notificationsSupported ? "opacity-50" : ""
        }`}>
          {/* Toggle row */}
          <div
            className={`flex items-center justify-between p-4 ${
              !notificationsSupported
                ? "cursor-not-allowed"
                : "cursor-pointer state-layer-hover"
            } material-radius`}
            onClick={notificationsSupported ? () => handleToggle(!reminderEnabled) : undefined}
          >
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 shrink-0 text-muted-foreground" />
              <div>
                <span className="font-medium">Daily Reminder</span>
                <p className="text-sm text-muted-foreground">
                  {getStatusText()}
                </p>
              </div>
            </div>
            <Switch
              id="reminder-toggle"
              checked={reminderEnabled}
              onCheckedChange={handleToggle}
              disabled={!notificationsSupported}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Time picker — animated expand/collapse within same card */}
          <div
            className={`grid transition-all duration-200 ease-in-out ${
              reminderEnabled && permissionGranted
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex items-center justify-between px-4 pb-4 pt-0">
                <div className="flex items-center space-x-3">
                  <div className="w-5" />
                  <span className="text-sm text-muted-foreground">Reminder time</span>
                </div>
                <div className="relative">
                  <input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="bg-background border border-border rounded-md pl-3 pr-9 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Clock className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permission-denied guidance dialog */}
      <ResponsiveDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog} drawerSize="compact">
        <ResponsiveDialogContent dialogClassName="w-full max-w-sm">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-2">
              <BellOff className="w-5 h-5 text-muted-foreground" />
              Notifications Needed
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              To send you daily reminders, the app needs permission to show
              notifications. You can enable this in your browser or device settings.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <div className="flex justify-end w-full">
              <Button onClick={() => setShowPermissionDialog(false)}>Got it</Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
