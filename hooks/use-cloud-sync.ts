import { useRef, useCallback, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useLoading } from "@/hooks/use-loading";

type PushOptions = {
  debounceMs?: number;
};

type PushNowOptions = {
  payload?: string;
  showToast?: boolean; // whether to show success/failure toasts for this invocation
  force?: boolean; // bypass backoff
};

export function useCloudSync() {
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const isCapacitorApp = Capacitor.isNativePlatform();
  const { show: showLoading, hide: hideLoading } = useLoading();

  const debounceRef = useRef<number | null>(null);
  const pendingRef = useRef(false);
  const syncRunningRef = useRef(false);
  const lastSuccessAtRef = useRef<number | null>(null);
  const lastSuccessToastAtRef = useRef<number | null>(null);

  // Storage keys
  const SYNC_PENDING_KEY = 'syncPending';
  const SYNC_FAILED_COUNT_KEY = 'syncFailedCount';

  // Backoff config
  const MAX_ATTEMPTS = 5;
  const BASE_DELAY_MS = 1000; // 1s

  // storage helper: Preferences on mobile, localStorage on web
  const storageGet = async (key: string) => {
    if (isCapacitorApp) {
      const { Preferences } = await import('@capacitor/preferences');
      const res = await Preferences.get({ key });
      return res.value;
    } else {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    }
  };
  const storageSet = async (key: string, value: string) => {
    if (isCapacitorApp) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value });
    } else {
      if (typeof window !== 'undefined') localStorage.setItem(key, value);
    }
  };
  const storageRemove = async (key: string) => {
    if (isCapacitorApp) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
    } else {
      if (typeof window !== 'undefined') localStorage.removeItem(key);
    }
  };

  const pushNow = useCallback(async (options?: PushNowOptions) => {
    const { payload, showToast = true, force = false } = options ?? {};

    // Persist intent
    try { await storageSet(SYNC_PENDING_KEY, 'true'); } catch {}

    if (!isOnline) {
      if (showToast) toast({ title: "Offline", description: "Cannot sync while offline.", variant: "destructive" });
      return false;
    }

    // Prevent concurrent pushes
    if (syncRunningRef.current) {
      // mark pending and return (a running push will clear pending if successful)
      pendingRef.current = true;
      return false;
    }

    syncRunningRef.current = true;
    showLoading();

    try {
      const { HabitStorage } = await import("@/lib/habit-storage");
      const data = payload ?? await HabitStorage.exportData();

      // choose platform-specific upload helper
      let attempt = 0;
      let failed = false;
      while (attempt < MAX_ATTEMPTS) {
        attempt += 1;
        try {
          if (typeof window !== 'undefined' && !isCapacitorApp) {
            const accessToken = localStorage.getItem('googleAccessToken');
            if (!accessToken) {
              if (showToast) toast({ title: "Not Signed In", description: "Sign in to enable cloud sync.", variant: "destructive" });
              failed = true;
              break;
            }
            const { uploadToDrive } = await import("../web/drive-sync");
            await uploadToDrive(data, accessToken);
          } else {
            const { Preferences } = await import('@capacitor/preferences');
            const accessToken = (await Preferences.get({ key: 'googleAccessToken' })).value;
            if (!accessToken) {
              if (showToast) toast({ title: "Not Signed In", description: "Sign in to enable cloud sync.", variant: "destructive" });
              failed = true;
              break;
            }
            const { uploadDataToDrive } = await import("@/mobile/drive-sync");
            await uploadDataToDrive(data, accessToken);
          }

          // success
          lastSuccessAtRef.current = Date.now();
          pendingRef.current = false;
          try { await storageRemove(SYNC_PENDING_KEY); await storageRemove(SYNC_FAILED_COUNT_KEY); } catch {}
          // coalesce success toast: only show once every 10s
          const now = Date.now();
          const lastToast = lastSuccessToastAtRef.current ?? 0;
          if (showToast && now - lastToast > 10000) {
            toast({ title: "Auto-sync", description: "Synced to Google Drive.", duration: 2500 });
            lastSuccessToastAtRef.current = now;
          }
          syncRunningRef.current = false;
          hideLoading();
          return true;
        } catch (err: any) {
          // If 401, do not retry; we expect mobile drive-sync to clear token already
          const status = err?.status || err?.statusCode || (err && err.message && err.message.includes('401') ? 401 : undefined);
          console.error('[useCloudSync] push attempt failed:', { attempt, err });
          failed = true;
          // Persist failed count
          try { await storageSet(SYNC_FAILED_COUNT_KEY, String(attempt)); } catch {}

          if (status === 401) {
            // auth issue — stop retrying automatically
            if (showToast) toast({ title: 'Sync Error', description: 'Drive authorization expired or invalid. Please sign in again.', variant: 'destructive' });
            break;
          }

          if (force) break; // don't retry if forced not to

          if (attempt >= MAX_ATTEMPTS) break;
          // exponential backoff with jitter
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          const jitter = Math.round(Math.random() * 300);
          await new Promise(res => setTimeout(res, delay + jitter));
        }
      }

      // if we get here, it failed
      if (failed) {
        try { await storageSet(SYNC_PENDING_KEY, 'true'); } catch {}
        if (showToast) toast({ title: 'Sync Error', description: 'Sync failed. Will retry when network is available.', variant: 'destructive' });
        syncRunningRef.current = false;
        hideLoading();
        return false;
      }
    } catch (err: unknown) {
      let message = 'Sync failed.';
      if (err && typeof err === 'object' && 'message' in err) message = (err as any).message;
      if (showToast) toast({ title: 'Sync Error', description: message + ' Please try again or sign in.', variant: 'destructive' });
      console.error('[useCloudSync] pushNow error:', err);
      syncRunningRef.current = false;
      hideLoading();
      return false;
    }
    // fallback (shouldn't reach here)
    syncRunningRef.current = false;
    hideLoading();
    return false;
  }, [isOnline, isCapacitorApp, toast, showLoading, hideLoading]);

  const schedulePush = useCallback((options?: PushOptions) => {
    const debounceMs = options?.debounceMs ?? 2500;
    pendingRef.current = true;
    // persist pending intent
    (async () => { try { await storageSet(SYNC_PENDING_KEY, 'true'); } catch {} })();
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

  // When network becomes available, attempt a pending sync
  useEffect(() => {
    (async () => {
      try {
        const persisted = await storageGet(SYNC_PENDING_KEY);
        const shouldAttempt = persisted === 'true' || pendingRef.current === true;
        if (isOnline && shouldAttempt) {
          // try a background push without noisy toasts
          await pushNow({ showToast: false });
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [isOnline, pushNow]);

  return {
    schedulePush,
    pushNow,
    pullOnce,
  };
}
