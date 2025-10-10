import { useRef, useCallback } from "react";
import { Capacitor } from '@capacitor/core';
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/use-network-status";

type PushOptions = {
  debounceMs?: number;
};

export function useCloudSync() {
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const isCapacitorApp = Capacitor.isNativePlatform();

  const debounceRef = useRef<number | null>(null);
  const pendingRef = useRef(false);

  const pushNow = useCallback(async (exportJson?: string) => {
    if (!isOnline) {
      toast({ title: "Offline", description: "Cannot sync while offline.", variant: "destructive" });
      return false;
    }

    try {
      const { HabitStorage } = await import("@/lib/habit-storage");
      const payload = exportJson ?? await HabitStorage.exportData();

      if (typeof window !== 'undefined' && !isCapacitorApp) {
        const accessToken = localStorage.getItem('googleAccessToken');
        if (!accessToken) {
          toast({ title: "Not Signed In", description: "Sign in to enable cloud sync.", variant: "destructive" });
          return false;
        }
        const { uploadToDrive } = await import("../web/drive-sync");
        await uploadToDrive(payload, accessToken);
        toast({ title: "Auto-sync", description: "Synced to Google Drive.", duration: 2500 });
        return true;
      } else {
        const { Preferences } = await import('@capacitor/preferences');
        const accessToken = (await Preferences.get({ key: 'googleAccessToken' })).value;
        if (!accessToken) {
          toast({ title: "Not Signed In", description: "Sign in to enable cloud sync.", variant: "destructive" });
          return false;
        }
        const { uploadDataToDrive } = await import("@/mobile/drive-sync");
        await uploadDataToDrive(payload, accessToken);
        toast({ title: "Auto-sync", description: "Synced to Google Drive.", duration: 2500 });
        return true;
      }
    } catch (err: unknown) {
      let message = 'Sync failed.';
      if (err && typeof err === 'object' && 'message' in err) message = (err as any).message;
      toast({ title: 'Sync Error', description: message + ' Please try again or sign in.', variant: 'destructive' });
      console.error('[useCloudSync] pushNow error:', err);
      return false;
    }
  }, [isOnline, isCapacitorApp, toast]);

  const schedulePush = useCallback((options?: PushOptions) => {
    const debounceMs = options?.debounceMs ?? 2500;
    pendingRef.current = true;
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(async () => {
      pendingRef.current = false;
      await pushNow();
      debounceRef.current = null;
    }, debounceMs) as unknown as number;
  }, [pushNow]);

  const pullOnce = useCallback(async (onImport?: (jsonData: string) => void) => {
    if (!isOnline) {
      toast({ title: "Offline", description: "Cannot pull while offline.", variant: "destructive" });
      return false;
    }
    try {
      if (typeof window !== 'undefined' && !isCapacitorApp) {
        const accessToken = localStorage.getItem('googleAccessToken');
        if (!accessToken) {
          toast({ title: "Not Signed In", description: "Sign in to enable cloud sync.", variant: "destructive" });
          return false;
        }
        // List and download the most recent file named habits-backup.json
        const listRes = await fetch('https://www.googleapis.com/drive/v3/files?q=name%3D%27habits-backup.json%27&spaces=drive&fields=files(id%2Cname%2CmodifiedTime)&orderBy=modifiedTime desc', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const listJson = await listRes.json();
        const files = listJson.files || [];
        if (!files.length) {
          toast({ title: 'No backup', description: 'No cloud backup found.', duration: 2500 });
          return false;
        }
        const fileId = files[0].id;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const cloudJson = await res.text();
        if (onImport) onImport(cloudJson);
        toast({ title: 'Auto-sync', description: 'Pulled latest data from cloud.', duration: 2500 });
        return true;
      } else {
        const { Preferences } = await import('@capacitor/preferences');
        const accessToken = (await Preferences.get({ key: 'googleAccessToken' })).value;
        if (!accessToken) {
          toast({ title: "Not Signed In", description: "Sign in to enable cloud sync.", variant: "destructive" });
          return false;
        }
        const { downloadLatestHabitsFromDrive } = await import("@/mobile/drive-sync");
        const cloudBundle = await downloadLatestHabitsFromDrive(accessToken);
        const cloudJson = JSON.stringify(cloudBundle);
        if (onImport) onImport(cloudJson);
        toast({ title: 'Auto-sync', description: 'Pulled latest data from cloud.', duration: 2500 });
        return true;
      }
    } catch (err: unknown) {
      let message = 'Pull failed.';
      if (err && typeof err === 'object' && 'message' in err) message = (err as any).message;
      toast({ title: 'Sync Error', description: message + ' Please try again or sign in.', variant: 'destructive' });
      console.error('[useCloudSync] pullOnce error:', err);
      return false;
    }
  }, [isOnline, isCapacitorApp, toast]);

  return {
    schedulePush,
    pushNow,
    pullOnce,
  };
}
