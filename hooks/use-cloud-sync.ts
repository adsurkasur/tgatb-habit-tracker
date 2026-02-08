import { useRef, useCallback, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { TokenStorage } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useLoading } from "@/hooks/use-loading";
import type { Habit, HabitLog, ExportBundle } from '@shared/schema';

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
  const SYNC_LAST_SNAPSHOT_KEY = 'sync:lastSnapshot';

  // Backoff config
  const MAX_ATTEMPTS = 5;
  const BASE_DELAY_MS = 1000; // 1s

  // storage helper: Preferences on mobile, localStorage on web
  const storageGet = useCallback(async (key: string) => {
    if (isCapacitorApp) {
      const { Preferences } = await import('@capacitor/preferences');
      const res = await Preferences.get({ key });
      return res.value;
    } else {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    }
  }, [isCapacitorApp]);
  const storageSet = useCallback(async (key: string, value: string) => {
    if (isCapacitorApp) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value });
    } else {
      if (typeof window !== 'undefined') localStorage.setItem(key, value);
    }
  }, [isCapacitorApp]);
  const storageRemove = useCallback(async (key: string) => {
    if (isCapacitorApp) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
    } else {
      if (typeof window !== 'undefined') localStorage.removeItem(key);
    }
  }, [isCapacitorApp]);

  function getErrorStatus(err: unknown): number | undefined {
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      if ('status' in e && typeof e.status === 'number') return e.status as number;
      if ('statusCode' in e && typeof e.statusCode === 'number') return e.statusCode as number;
      if ('message' in e && typeof e.message === 'string' && (e.message as string).includes('401')) return 401;
    }
    return undefined;
  }

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
          const accessToken = await TokenStorage.getAccessToken();
          if (!accessToken) {
            if (showToast) toast({ title: "Not Signed In", description: "Sign in to enable cloud sync.", variant: "destructive" });
            failed = true;
            break;
          }
          if (typeof window !== 'undefined' && !isCapacitorApp) {
            const { uploadToDrive } = await import("../web/drive-sync");
            await uploadToDrive(data, accessToken);
          } else {
            const { uploadDataToDrive } = await import("@/mobile/drive-sync");
            await uploadDataToDrive(data, accessToken);
          }

          // success
          lastSuccessAtRef.current = Date.now();
          // persist last snapshot for three-way merges
          try { await storageSet(SYNC_LAST_SNAPSHOT_KEY, data); } catch {}
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
        } catch (err: unknown) {
          // If 401, do not retry; we expect mobile drive-sync to clear token already
          const status = getErrorStatus(err);
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
      if (err && typeof err === 'object' && 'message' in err) message = String((err as Record<string, unknown>).message);
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
  }, [isOnline, isCapacitorApp, toast, showLoading, hideLoading, storageSet, storageRemove]);

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
  }, [pushNow, storageSet]);

  const pullOnce = useCallback(async (onImport?: (jsonData: string) => void) => {
    if (!isOnline) {
      toast({ title: "Offline", description: "Cannot pull while offline.", variant: "destructive" });
      return false;
    }
    try {
      if (typeof window !== 'undefined' && !isCapacitorApp) {
        const accessToken = await TokenStorage.getAccessToken();
        if (!accessToken) {
          toast({ title: "Not Signed In", description: "Sign in to enable cloud sync.", variant: "destructive" });
          return false;
        }
        // List and download the most recent file named habits-backup.json
        const { listAppFiles } = await import('@/lib/drive-folder');
        const files = await listAppFiles('habits-backup.json', accessToken, { withRootFallback: true });
        if (!files.length) {
          toast({ title: 'No backup', description: 'No cloud backup found.', duration: 2500 });
          return false;
        }
        const fileId = files[0].id;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const cloudJson = await res.text();
        // Run migrations and attempt per-item merge with local data
        try {
          const parsed = (() => { try { return JSON.parse(cloudJson); } catch { return null; } })();
          const { runMigrations } = await import('@/lib/migrations');
          let migrated = await runMigrations(parsed).catch(() => parsed);

          // Validate migrated bundle before attempting merges
          const { validateExportImportJson } = await import('@/lib/validate-export-import');
          const validation = validateExportImportJson(migrated);
          if (!validation.success) {
            console.error('[useCloudSync] remote bundle validation failed', validation.errors);
            toast({ title: 'Sync Error', description: 'Downloaded data is invalid. Import aborted.', variant: 'destructive' });
            syncRunningRef.current = false;
            hideLoading();
            return false;
          }
          migrated = validation.data as typeof migrated;

          const { mergeHabit, mergeLog } = await import('@/lib/sync/merge');
          const { HabitStorage } = await import('@/lib/habit-storage');

          const localHabits = HabitStorage.getHabits();
          const localLogs = HabitStorage.getLogs();

          // load last snapshot for base if available
          let baseSnapshot: ExportBundle | null = null;
          try { const last = await storageGet(SYNC_LAST_SNAPSHOT_KEY); baseSnapshot = last ? JSON.parse(last) as ExportBundle : null; } catch {}

          const remoteHabits: Habit[] = (migrated?.habits || []).map((h: unknown) => { const hh = h as Record<string, unknown>; return { ...hh, createdAt: new Date(String(hh.createdAt)), lastCompletedDate: hh.lastCompletedDate ? new Date(String(hh.lastCompletedDate)) : undefined } as Habit; });
          const remoteLogs: HabitLog[] = (migrated?.logs || []).map((l: unknown) => { const ll = l as Record<string, unknown>; return { ...ll, timestamp: new Date(String(ll.timestamp)) } as HabitLog; });

          const localMap = new Map<string, Habit>(localHabits.map((h: Habit) => [h.id, h]));
          const baseMap = new Map<string, Habit>((baseSnapshot?.habits || []).map((h: unknown) => { const hh = h as Record<string, unknown>; return [hh.id as string, { ...hh, createdAt: new Date(String(hh.createdAt)), lastCompletedDate: hh.lastCompletedDate ? new Date(String(hh.lastCompletedDate)) : undefined } as Habit]; }));

          const mergedHabits: Habit[] = [];
          const conflictsCollected: Array<{ id: string; conflicts?: Record<string, unknown>; local?: Habit | HabitLog | null; remote?: Habit | HabitLog | null; migrated?: ExportBundle | null }> = [];
          for (const r of remoteHabits) {
            const l: Habit | null = localMap.get(r.id) || null;
            const b: Habit | null = baseMap.get(r.id) || null;
            const res = mergeHabit(l, r, b);
            mergedHabits.push(res.merged);
            if (res.conflict) conflictsCollected.push({ id: r.id, conflicts: res.conflicts, local: l, remote: r, migrated });
          }
          // include local-only habits
          for (const l of localHabits) if (!mergedHabits.find((m) => m.id === l.id)) mergedHabits.push(l);

          // logs
          const localLogMap = new Map<string, HabitLog>(localLogs.map((l: HabitLog) => [l.id, l]));
          const baseLogMap = new Map<string, HabitLog>((baseSnapshot?.logs || []).map((l: unknown) => { const ll = l as Record<string, unknown>; return [ll.id as string, { ...ll, timestamp: new Date(String(ll.timestamp)) } as HabitLog]; }));
          const mergedLogs: HabitLog[] = [];
          for (const r of remoteLogs) {
            const l: HabitLog | null = localLogMap.get(r.id) || null;
            const b: HabitLog | null = baseLogMap.get(r.id) || null;
            const res = mergeLog(l, r, b);
            mergedLogs.push(res.merged);
            if (res.conflict) conflictsCollected.push({ id: r.id, conflicts: res.conflicts, local: l, remote: r, migrated });
          }
          for (const l of localLogs) if (!mergedLogs.find((m) => m.id === l.id)) mergedLogs.push(l);

          // If conflicts detected, persist conflict payload and notify user
          if (conflictsCollected.length > 0) {
            try {
              await storageSet('sync:conflict', JSON.stringify({ conflicts: conflictsCollected, migrated }));
            } catch {}
            toast({ title: 'Sync Conflicts', description: 'Conflicts detected during merge. Resolve them in Settings → Account & Data.', variant: 'destructive' });
            // do not overwrite local state automatically when conflicts exist
            syncRunningRef.current = false;
            hideLoading();
            return false;
          }

          // Persist merged results
          HabitStorage.saveHabits(mergedHabits);
          HabitStorage.saveLogs(mergedLogs);

          // persist new last snapshot as the migrated remote bundle
          try { await storageSet(SYNC_LAST_SNAPSHOT_KEY, JSON.stringify(migrated)); } catch {}

          if (onImport) onImport(JSON.stringify(migrated));
          toast({ title: 'Auto-sync', description: 'Pulled latest data from cloud and merged.', duration: 2500 });
          return true;
        } catch (mergeErr) {
          console.error('pullOnce merge error', mergeErr);
          toast({ title: 'Sync Error', description: 'Failed to merge cloud data. Import aborted.', variant: 'destructive' });
          return false;
        }
      }
      else {
        const accessToken = await TokenStorage.getAccessToken();
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
      if (err && typeof err === 'object' && 'message' in err) message = String((err as Record<string, unknown>).message);
      toast({ title: 'Sync Error', description: message + ' Please try again or sign in.', variant: 'destructive' });
      console.error('[useCloudSync] pullOnce error:', err);
      return false;
    }
  }, [isOnline, isCapacitorApp, toast, hideLoading, storageGet, storageSet]);

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
      } catch {
        // ignore
      }
    })();
  }, [isOnline, pushNow, storageGet]);

  return {
    schedulePush,
    pushNow,
    pullOnce,
  };
}
