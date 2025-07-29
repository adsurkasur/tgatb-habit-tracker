import { Habit, HabitLog, UserSettings, HabitType } from "@shared/schema";

const HABITS_KEY = "habits";
const LOGS_KEY = "habit_logs";
const SETTINGS_KEY = "user_settings";

export class HabitStorage {
  static getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(HABITS_KEY);
      if (!data) return [];
      
      const habits = JSON.parse(data);
      return habits.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        lastCompletedDate: habit.lastCompletedDate ? new Date(habit.lastCompletedDate) : undefined,
      }));
    } catch {
      return [];
    }
  }

  static saveHabits(habits: Habit[]): void {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }

  static addHabit(name: string, type: HabitType): Habit {
    const habits = this.getHabits();
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      type,
      streak: 0,
      createdAt: new Date(),
    };
    
    habits.push(newHabit);
    this.saveHabits(habits);
    return newHabit;
  }

  static updateHabit(id: string, updates: Partial<Habit>): void {
    const habits = this.getHabits();
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      this.saveHabits(habits);
    }
  }

  static deleteHabit(id: string): void {
    const habits = this.getHabits().filter(h => h.id !== id);
    this.saveHabits(habits);
  }

  static getLogs(): HabitLog[] {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      if (!data) return [];
      
      const logs = JSON.parse(data);
      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    } catch {
      return [];
    }
  }

  static saveLogs(logs: HabitLog[]): void {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }

  static addLog(habitId: string, completed: boolean): HabitLog {
    const logs = this.getLogs();
    const today = new Date().toISOString().split('T')[0];
    
    // Remove existing log for today if it exists
    const filteredLogs = logs.filter(log => !(log.habitId === habitId && log.date === today));
    
    const newLog: HabitLog = {
      id: crypto.randomUUID(),
      habitId,
      date: today,
      completed,
      timestamp: new Date(),
    };
    
    filteredLogs.push(newLog);
    this.saveLogs(filteredLogs);
    
    // Update streak
    this.updateStreak(habitId);
    
    return newLog;
  }

  private static updateStreak(habitId: string): void {
    const habits = this.getHabits();
    const logs = this.getLogs().filter(log => log.habitId === habitId).sort((a, b) => b.date.localeCompare(a.date));
    
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date + 'T00:00:00');
      const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i && logs[i].completed) {
        streak++;
      } else {
        break;
      }
    }
    
    habits[habitIndex].streak = streak;
    if (streak > 0) {
      habits[habitIndex].lastCompletedDate = new Date();
    }
    
    this.saveHabits(habits);
  }

  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) {
        return {
          darkMode: false,
          language: "en",
          motivatorPersonality: "positive",
        };
      }
      return JSON.parse(data);
    } catch {
      return {
        darkMode: false,
        language: "en",
        motivatorPersonality: "positive",
      };
    }
  }

  static saveSettings(settings: UserSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  static exportData(): string {
    const data = {
      habits: this.getHabits(),
      logs: this.getLogs(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.habits) {
        localStorage.setItem(HABITS_KEY, JSON.stringify(data.habits));
      }
      
      if (data.logs) {
        localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs));
      }
      
      if (data.settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
      }
    } catch (error) {
      throw new Error("Invalid JSON data format");
    }
  }
}
