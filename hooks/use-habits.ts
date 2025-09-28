import { useState, useEffect, useRef } from "react";
import { Habit, HabitType, UserSettings } from "@shared/schema";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { SaveAs } from "capacitor-save-as";
import { HabitStorage } from "@/lib/habit-storage";
import { Motivator } from "@/lib/motivator";
import { useToast } from "@/hooks/use-toast";

export function useHabits() {
  // Clear all habits and logs from storage and state
  const clearAllHabits = async () => {
    if (Capacitor.isNativePlatform()) {
      // Mobile: clear Capacitor Preferences
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: 'habits' });
      await Preferences.remove({ key: 'habit_logs' });
    } else {
      // Web: clear localStorage
      HabitStorage.clearAllHabits();
    }
    setHabits([]);
  };
  // ...existing code...
  // Animation timing constant (must match CSS animation duration in globals.css)
  const HABIT_ANIMATION_DURATION = 250; // ms
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  /**
  * navigationEvent emits a new object with an ever-increasing sequence number for each logical navigation.
  * Consumers trigger animations exactly once per event (seq) instead of relying on transient
  * direction state and timeouts, avoiding duplicate animations.
   */
  const [navigationEvent, setNavigationEvent] = useState<{ dir: 'left' | 'right'; seq: number } | null>(null);
  const navSeqRef = useRef(0);
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    language: "en",
    motivatorPersonality: "positive",
    fullscreenMode: false,
  });
  const { toast } = useToast();

    useEffect(() => {
      (async () => {
        const loadedHabits = HabitStorage.getHabits();
        const loadedSettings = await HabitStorage.getSettings();
        setHabits(loadedHabits);
        setSettings(loadedSettings);
        // Apply dark mode
        if (loadedSettings.darkMode) {
          document.documentElement.classList.add("dark");
        }
      })();
    }, []);

  const addHabit = ({ name, type }: { name: string; type: HabitType }) => {
    const newHabit = HabitStorage.addHabit(name, type);
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  };

  const updateHabit = ({ id, name, type }: { id: string; name: string; type: HabitType }) => {
    HabitStorage.updateHabit(id, { name, type });
    setHabits(prev => prev.map(h => h.id === id ? { ...h, name, type } : h));
    toast({
      title: "Habit updated!",
      description: "Your habit has been successfully updated.",
      duration: 3000,
    });
  };

  const deleteHabit = ({ id }: { id: string }) => {
    const habitToDelete = habits.find(h => h.id === id);
    if (!habitToDelete) return null;
    HabitStorage.deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
    return habitToDelete;
  };

  const restoreHabit = (deletedHabit: Habit) => {
    // Restore the habit
    const restoredHabit = HabitStorage.addHabit(deletedHabit.name, deletedHabit.type);
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
      toast({
        title: "Already completed!",
        description: "You've already tracked this habit today.",
        duration: 3000,
      });
      return;
    }
    HabitStorage.addLog(habitId, completed);
    // Refresh habits to get updated streaks
    const updatedHabits = HabitStorage.getHabits();
    setHabits(updatedHabits);
    const updatedHabit = updatedHabits.find(h => h.id === habitId);
    if (updatedHabit) {
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
  };

  const undoHabitTracking = (habitId: string) => {
    const success = HabitStorage.undoTodayLog(habitId);
    if (success) {
      const updatedHabits = HabitStorage.getHabits();
      setHabits(updatedHabits);
      toast({
        title: "Undone!",
        description: "Today's tracking has been removed.",
        duration: 3000,
      });
    } else {
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
      try {
        const { useTheme } = await import("@/components/theme-provider");
        const theme = useTheme();
        theme.setIsDark(loadedSettings.darkMode);
      } catch (e) {
        // If theme context not available, ignore
      }
      toast({
        title: 'Import successful',
        description: 'Your habit data has been imported.',
        duration: 3000,
      });
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
  };

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
  };
}
