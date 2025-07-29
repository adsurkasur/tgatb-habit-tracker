import { useState, useEffect } from "react";
import { Habit, HabitType, UserSettings } from "@shared/schema";
import { HabitStorage } from "@/lib/habit-storage";
import { Motivator } from "@/lib/motivator";
import { useToast } from "@/hooks/use-toast";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    language: "en",
    motivatorPersonality: "positive",
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadedHabits = HabitStorage.getHabits();
    const loadedSettings = HabitStorage.getSettings();
    
    setHabits(loadedHabits);
    setSettings(loadedSettings);
    
    // Apply dark mode
    if (loadedSettings.darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const addHabit = (name: string, type: HabitType) => {
    const newHabit = HabitStorage.addHabit(name, type);
    setHabits(prev => [...prev, newHabit]);
  };

  const deleteHabit = (id: string) => {
    HabitStorage.deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const trackHabit = (habitId: string, completed: boolean) => {
    HabitStorage.addLog(habitId, completed);
    
    // Refresh habits to get updated streaks
    const updatedHabits = HabitStorage.getHabits();
    setHabits(updatedHabits);
    
    const habit = updatedHabits.find(h => h.id === habitId);
    if (habit) {
      const message = Motivator.getMessage(
        settings.motivatorPersonality,
        completed,
        habit.type,
        habit.streak
      );
      
      toast({
        description: message,
        duration: 3000,
      });
    }
    
    // Move to next habit
    moveToNextHabit();
  };

  const moveToNextHabit = () => {
    if (habits.length > 1) {
      setCurrentHabitIndex(prev => (prev + 1) % habits.length);
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    HabitStorage.saveSettings(updatedSettings);
    
    // Apply dark mode immediately
    if (newSettings.darkMode !== undefined) {
      if (newSettings.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const exportData = () => {
    const data = HabitStorage.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        HabitStorage.importData(content);
        
        // Reload data
        const loadedHabits = HabitStorage.getHabits();
        const loadedSettings = HabitStorage.getSettings();
        
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
    settings,
    addHabit,
    deleteHabit,
    trackHabit,
    moveToNextHabit,
    updateSettings,
    exportData,
    importData,
  };
}
