import { useState, useEffect, useRef, useCallback } from "react";
import { Habit, HabitType, HabitSchedule, UserSettings } from "@shared/schema";
import { Capacitor } from "@capacitor/core";
import { HabitStorage } from "@/lib/habit-storage";
import { computeAutoLogs } from "@/lib/auto-finalize";
import { migrateLegacyPlatformStorage, scopedKey } from "@/lib/account-scope";
import { useAuth } from "@/hooks/use-auth";
import { useCloudSync } from "@/hooks/use-cloud-sync";
import { Motivator } from "@/lib/motivator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { formatLocalDate } from "@/lib/utils";
import { feedbackTrackSuccess, feedbackTrackFailure, feedbackError, feedbackUndo } from "@/lib/feedback";

export function useHabits() {
  // Clear all habits and logs from storage and state
  const clearAllHabits = async () => {
    if (Capacitor.isNativePlatform()) {
      // Mobile: clear Capacitor Preferences (scoped keys)
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: scopedKey('habits') });
      await Preferences.remove({ key: scopedKey('habit_logs') });
    }
    // Always clear localStorage (HabitStorage uses scoped keys)
    HabitStorage.clearAllHabits();
    setHabits([]);
  };
  // ...existing code...
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  /**
  * navigationEvent emits a new object with an ever-increasing sequence number for each logical navigation.
  * Consumers trigger animations exactly once per event (seq) instead of relying on transient
  * direction state and timeouts, avoiding duplicate animations.
   */
  const [navigationEvent, setNavigationEvent] = useState<{ dir: 'left' | 'right'; seq: number } | null>(null);
  const navSeqRef = useRef(0);
  const { isLoggedIn, accountId } = useAuth();
  const { schedulePush, pushNow, pullOnce } = useCloudSync();

  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    language: "en",
    motivatorPersonality: "positive",
    fullscreenMode: false,
    autoSync: false,
    soundEnabled: true,
    hapticEnabled: true,
  });
  const { toast } = useToast();
  const { setIsDark } = useTheme();

    useEffect(() => {
      (async () => {
        // Run legacy data migration (once per account, idempotent)
        await migrateLegacyPlatformStorage();

        const loadedHabits = HabitStorage.getHabits();
        const loadedSettings = await HabitStorage.getSettings();

        // --- Auto-finalization: fill in missed days ---
        const allLogs = HabitStorage.getLogs();
        const newAutoLogs = computeAutoLogs(loadedHabits, allLogs);
        if (newAutoLogs.length > 0) {
          const merged = [...allLogs, ...newAutoLogs];
          HabitStorage.saveLogs(merged);
          // Recalculate streaks after auto-finalization
          for (const habit of loadedHabits) {
            HabitStorage.recalculateStreak(habit.id);
          }
        }

        // Re-read habits (streaks may have been updated)
        const freshHabits = HabitStorage.getHabits();
        setHabits(freshHabits);
        setCurrentHabitIndex(0);
        setSettings(loadedSettings);
        // Apply dark mode
        if (loadedSettings.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      })();
    // Re-run whenever the active account changes (login/logout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId]);

    // --- Day-boundary & visibility change listener ---
    // Re-runs auto-finalization when the user returns to the app or a new day begins.
    const lastFinalizedDateRef = useRef<string>(formatLocalDate(new Date()));

    const runAutoFinalize = useCallback(() => {
      const todayStr = formatLocalDate(new Date());
      if (todayStr === lastFinalizedDateRef.current) return; // already up-to-date
      lastFinalizedDateRef.current = todayStr;

      const currentHabits = HabitStorage.getHabits();
      const allLogs = HabitStorage.getLogs();
      const newAutoLogs = computeAutoLogs(currentHabits, allLogs);
      if (newAutoLogs.length > 0) {
        const merged = [...allLogs, ...newAutoLogs];
        HabitStorage.saveLogs(merged);
        for (const habit of currentHabits) {
          HabitStorage.recalculateStreak(habit.id);
        }
      }
      const freshHabits = HabitStorage.getHabits();
      setHabits(freshHabits);
    }, []);

    useEffect(() => {
      const onVisibility = () => {
        if (document.visibilityState === "visible") {
          runAutoFinalize();
        }
      };
      document.addEventListener("visibilitychange", onVisibility);

      // Also check every 60 s for day rollover while app is open
      const interval = setInterval(() => runAutoFinalize(), 60_000);

      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        clearInterval(interval);
      };
    }, [runAutoFinalize]);

  const addHabit = ({ name, type, schedule }: { name: string; type: HabitType; schedule?: HabitSchedule }) => {
    const newHabit = HabitStorage.addHabit(name, type, schedule);
    setHabits(prev => [...prev, newHabit]);
    // schedule cloud push if enabled
    try { if (settings.autoSync && isLoggedIn) schedulePush(); } catch {}
    return newHabit;
  };

  const updateHabit = ({ id, name, type, schedule }: { id: string; name: string; type: HabitType; schedule?: HabitSchedule }) => {
    HabitStorage.updateHabit(id, { name, type, schedule });
    setHabits(prev => prev.map(h => h.id === id ? { ...h, name, type, schedule: schedule ?? h.schedule } : h));
    toast({
      title: "Habit updated!",
      description: "Your habit has been successfully updated.",
      duration: 3000,
    });
    try { if (settings.autoSync && isLoggedIn) schedulePush(); } catch {}
  };

  const deleteHabit = ({ id }: { id: string }) => {
    const habitToDelete = habits.find(h => h.id === id);
    if (!habitToDelete) return null;
    HabitStorage.deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
    try { if (settings.autoSync && isLoggedIn) schedulePush(); } catch {}
    return habitToDelete;
  };

  const restoreHabit = (deletedHabit: Habit) => {
    // Restore the habit
    const restoredHabit = HabitStorage.addHabit(deletedHabit.name, deletedHabit.type, deletedHabit.schedule);
    // Update the restored habit with original data (preserve streak, creation date, etc.)
    HabitStorage.updateHabit(restoredHabit.id, {
      streak: deletedHabit.streak,
      createdAt: deletedHabit.createdAt,
      lastCompletedDate: deletedHabit.lastCompletedDate,
    });
    // Update state with fresh data from storage
    const updatedHabits = HabitStorage.getHabits();
    setHabits(updatedHabits);
    toast({
      title: "Habit restored!",
      description: "Your habit has been successfully restored.",
      duration: 3000,
    });
  };

  const trackHabit = (habitId: string, completed: boolean) => {
    // Check if habit is already completed today
    const isAlreadyCompleted = HabitStorage.isHabitCompletedToday(habitId);
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    if (isAlreadyCompleted) {
      feedbackError({ soundEnabled: settings.soundEnabled !== false, hapticEnabled: settings.hapticEnabled !== false });
      toast({
        title: "Already completed!",
        description: "You've already tracked this habit today.",
        duration: 3000,
      });
      return;
    }
    const oldStreak = habit.streak;
    HabitStorage.addLog(habitId, completed);
    // Refresh habits to get updated streaks
    const updatedHabits = HabitStorage.getHabits();
    setHabits(updatedHabits);
    const updatedHabit = updatedHabits.find(h => h.id === habitId);
    if (updatedHabit) {
      // Determine if this was a "successful" track
      const isSuccess = updatedHabit.type === "bad" ? !completed : completed;
      const streakIncremented = updatedHabit.streak > oldStreak;
      const feedbackOpts = { soundEnabled: settings.soundEnabled !== false, hapticEnabled: settings.hapticEnabled !== false };
      if (isSuccess) {
        feedbackTrackSuccess(feedbackOpts, streakIncremented);
      } else {
        feedbackTrackFailure(feedbackOpts);
      }
      const message = Motivator.getMessage(
        settings.motivatorPersonality,
        completed,
        updatedHabit.type,
        updatedHabit.streak
      );
      toast({
        description: message,
        duration: 3000,
      });
    }
    try { if (settings.autoSync && isLoggedIn) schedulePush(); } catch {}
  };

  const undoHabitTracking = (habitId: string) => {
    const success = HabitStorage.undoTodayLog(habitId);
    if (success) {
      feedbackUndo({ soundEnabled: settings.soundEnabled !== false, hapticEnabled: settings.hapticEnabled !== false });
      const updatedHabits = HabitStorage.getHabits();
      setHabits(updatedHabits);
      toast({
        title: "Undone!",
        description: "Today's tracking has been removed.",
        duration: 3000,
      });
      try { if (settings.autoSync && isLoggedIn) schedulePush(); } catch {}
    } else {
      feedbackError({ soundEnabled: settings.soundEnabled !== false, hapticEnabled: settings.hapticEnabled !== false });
      toast({
        title: "Nothing to undo",
        description: "No tracking recorded for today.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getHabitCompletionStatus = (habitId: string) => {
    return {
      isCompletedToday: HabitStorage.isHabitCompletedToday(habitId),
      todayLog: HabitStorage.getTodayLog(habitId),
      stats: HabitStorage.getHabitStats(habitId),
    };
  };

  // Shared navigation logic for habits (event-based)
  function navigateHabit(direction: 'next' | 'prev') {
    if (habits.length > 1) {
      setCurrentHabitIndex(prev => {
        let newIndex = prev;
        if (direction === 'next') {
          newIndex = (prev + 1) % habits.length;
        } else if (direction === 'prev') {
          newIndex = (prev - 1 + habits.length) % habits.length;
        }
        if (newIndex !== prev) {
          const dir = direction === 'next' ? 'right' : 'left';
          navSeqRef.current += 1;
            setNavigationEvent({ dir, seq: navSeqRef.current });
        }
        return newIndex;
      });
    }
  }

  const moveToNextHabit = () => navigateHabit('next');
  const moveToPreviousHabit = () => navigateHabit('prev');

  const navigateToHabitIndex = (index: number) => {
    const isValidIndex = index >= 0 && index < habits.length;
    const isDifferentIndex = index !== currentHabitIndex;
    if (isValidIndex && isDifferentIndex) {
      const currentIndex = currentHabitIndex;
      const dir: 'left' | 'right' = index > currentIndex ? 'right' : 'left';
      setCurrentHabitIndex(index);
      navSeqRef.current += 1;
        setNavigationEvent({ dir, seq: navSeqRef.current });
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
      (async () => {
        await HabitStorage.saveSettings(updatedSettings);
      })();
    
    // Apply dark mode immediately
    if (newSettings.darkMode !== undefined) {
      if (newSettings.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // Unified exportData: returns validated export JSON string only
  const exportData = async (): Promise<string> => {
    const data = await HabitStorage.exportData();
    // Validate the generated export JSON using the shared schema
    const parsed = JSON.parse(data);
    const { exportBundleSchema } = await import("@/shared/schema");
    const result = exportBundleSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error("Exported data does not match schema");
    }
    return data;
  };

  const currentHabit = habits[currentHabitIndex];

  // Import data function: imports JSON, refreshes habits, and shows feedback
  // Unified importData: validates and imports JSON
  const importData = async (jsonData: string): Promise<void> => {
    try {
      // Validate before importing
      const parsed = JSON.parse(jsonData);
      const { exportBundleSchema } = await import("@/shared/schema");
      const result = exportBundleSchema.safeParse(parsed);
      if (!result.success) {
        throw new Error("Import data does not match schema");
      }
      await HabitStorage.importData(jsonData);
      // Refresh habits and settings after import
      const loadedHabits = HabitStorage.getHabits();
      const loadedSettings = await HabitStorage.getSettings();
      setHabits(loadedHabits);
      setSettings(loadedSettings);
      // Immediately update theme if darkMode changed
      setIsDark(loadedSettings.darkMode);
      toast({
        title: 'Import successful',
        description: 'Your habit data has been imported.',
        duration: 3000,
      });
  // After import, push to cloud immediately if autoSync enabled
  // Use pushNow with showToast=false to avoid duplicate import+autosync toasts
  try { if (settings.autoSync && isLoggedIn) await pushNow({ payload: jsonData, showToast: false }); } catch {}
    } catch (err) {
      toast({
        title: 'Import failed',
        description: (err as Error).message || 'Could not import your habit data.',
        variant: 'destructive',
        duration: 3000,
      });
      throw err;
    }
  };

  /**
   * Add or update a log for any habit and date (for missed entries)
   */
  const addOrUpdateLog = (habitId: string, date: string, completed: boolean) => {
    HabitStorage.addOrUpdateLog(habitId, date, completed);
    // Refresh habits to get updated streaks
    const updatedHabits = HabitStorage.getHabits();
    setHabits(updatedHabits);
    try { if (settings.autoSync && isLoggedIn) schedulePush(); } catch {}
  };

  /**
   * Remove a log for a habit on a given date (revert to untracked)
   */
  const removeLog = (habitId: string, date: string) => {
    HabitStorage.removeLog(habitId, date);
    const updatedHabits = HabitStorage.getHabits();
    setHabits(updatedHabits);
    try { if (settings.autoSync && isLoggedIn) schedulePush(); } catch {}
  };

  // After initial load, if autoSync enabled and user is logged in, pull remote data once
  const importDataRef = useRef(importData);
  importDataRef.current = importData;
  const pullOnceRef = useRef(pullOnce);
  pullOnceRef.current = pullOnce;

  useEffect(() => {
    (async () => {
      try {
        const loadedSettings = await HabitStorage.getSettings();
        if (loadedSettings.autoSync && isLoggedIn) {
          // Pull and import
          await pullOnceRef.current(async (json) => {
            try {
              await importDataRef.current(json);
            } catch {
              // importData already shows toasts
            }
          });
        }
      } catch {
        // ignore
      }
    })();
  }, [isLoggedIn]);

  return {
    habits,
    goodHabits: habits.filter(h => h.type === 'good'),
    badHabits: habits.filter(h => h.type === 'bad'),
    currentHabit,
    currentHabitIndex,
    navigationEvent,
    settings,
    addHabit,
    updateHabit,
    deleteHabit,
    restoreHabit,
    trackHabit,
    undoHabitTracking,
    getHabitCompletionStatus,
    moveToNextHabit,
    clearAllHabits,
    moveToPreviousHabit,
    navigateToHabitIndex,
    updateSettings,
    exportData,
    importData,
    addOrUpdateLog,
    removeLog,
  };
}
