import { useState, useEffect } from "react";
import { Habit, HabitType, UserSettings } from "@shared/schema";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { HabitStorage } from "@/lib/habit-storage";
import { Motivator } from "@/lib/motivator";
import { useToast } from "@/hooks/use-toast";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [navigationDirection, setNavigationDirection] = useState<'left' | 'right' | null>(null);
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

  const addHabit = (name: string, type: HabitType) => {
    const newHabit = HabitStorage.addHabit(name, type);
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (id: string, name: string, type: HabitType) => {
    HabitStorage.updateHabit(id, { name, type });
    setHabits(prev => prev.map(h => h.id === id ? { ...h, name, type } : h));
    
    toast({
      title: "Habit updated!",
      description: "Your habit has been successfully updated.",
      duration: 3000,
    });
  };

  const deleteHabit = (id: string) => {
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

  const moveToNextHabit = () => {
    if (habits.length > 1) {
      setCurrentHabitIndex(prev => {
        const nextIndex = (prev + 1) % habits.length;
        if (nextIndex !== prev) {
          setNavigationDirection('right');
          setTimeout(() => setNavigationDirection(null), 250);
        }
        return nextIndex;
      });
    }
  };

  const moveToPreviousHabit = () => {
    if (habits.length > 1) {
      setCurrentHabitIndex(prev => {
        const prevIndex = (prev - 1 + habits.length) % habits.length;
        if (prevIndex !== prev) {
          setNavigationDirection('left');
          setTimeout(() => setNavigationDirection(null), 250);
        }
        return prevIndex;
      });
    }
  };

  const navigateToHabitIndex = (index: number) => {
    if (index >= 0 && index < habits.length && index !== currentHabitIndex) {
      // Determine direction based on index difference
      const currentIndex = currentHabitIndex;
      if (index > currentIndex) {
        setNavigationDirection('right');
      } else if (index < currentIndex) {
        setNavigationDirection('left');
      }
      setCurrentHabitIndex(index);
      // Clear direction after animation
  setTimeout(() => setNavigationDirection(null), 250);
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

  const exportData = async () => {
    try {
      const data = await HabitStorage.exportData();
      const defaultFilename = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      
      // Native Android path: save to app cache and offer system Share sheet
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        try {
          const path = `${defaultFilename}`;
          await Filesystem.writeFile({
            path,
            data,
            directory: Directory.Cache,
            encoding: Encoding.UTF8,
            recursive: true,
          });
          // Get a sharable content:// URI
          const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
          // Try sharing the file via Android share sheet
          try {
            await Share.share({
              title: 'Habit Tracker Export',
              text: 'Your habit data export file',
              dialogTitle: 'Share export file',
              url: uri,
            });
          } catch {
            // If sharing fails, still succeed since file is saved
          }

          return;
        } catch (err) {
          console.warn('Native export failed, falling back to web method:', err);
          // fall through to web fallback
        }
      }
      
  // Web: Try modern File System Access API first (for file save dialog)
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: defaultFilename,
            types: [{
              description: 'JSON files',
              accept: { 'application/json': ['.json'] },
            }],
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(data);
          await writable.close();
          
          return; // Success - exit early
        } catch (error: any) {
          // If user cancels, don't show error
          if (error.name === 'AbortError') {
            return;
          }
          // If API fails, fall through to fallback
          console.warn('File System Access API failed, using fallback:', error);
        }
      }
      
      // Fallback: traditional blob download
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      throw error; // Re-throw so UI can handle the error
    }
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        (async () => {
          try {
            const content = e.target?.result as string;
            await HabitStorage.importData(content);

            // Reload data (HabitStorage.getHabits rehydrates Date fields)
            const loadedHabits = HabitStorage.getHabits();
            const loadedSettings = await HabitStorage.getSettings();
          
            setHabits(loadedHabits);
            setSettings(loadedSettings);
          
            toast({
              title: "Success",
              description: "Data imported successfully!",
              duration: 3000,
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to import data. Please check the file format.",
              variant: "destructive",
              duration: 3000,
            });
          }
        })();
    };
    reader.readAsText(file);
  };

  const goodHabits = habits.filter(h => h.type === "good");
  const badHabits = habits.filter(h => h.type === "bad");
  const currentHabit = habits[currentHabitIndex];

  return {
    habits,
    goodHabits,
    badHabits,
    currentHabit,
    currentHabitIndex,
    navigationDirection,
    settings,
    addHabit,
    updateHabit,
    deleteHabit,
    restoreHabit,
    trackHabit,
    undoHabitTracking,
    getHabitCompletionStatus,
    moveToNextHabit,
    moveToPreviousHabit,
    navigateToHabitIndex,
    updateSettings,
    exportData,
    importData,
  };
}
