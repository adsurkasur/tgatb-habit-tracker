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
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    
    const streak = this.calculateStreak(habitId);
    
    habits[habitIndex].streak = streak;
    if (streak > 0) {
      habits[habitIndex].lastCompletedDate = new Date();
    }
    
    this.saveHabits(habits);
  }

  private static calculateStreak(habitId: string): number {
    const logs = this.getLogs()
      .filter(log => log.habitId === habitId && log.completed)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    if (logs.length === 0) return 0;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Find starting point for streak calculation
    const hasLogToday = logs.some(log => log.date === todayStr);
    const startDaysBack = hasLogToday ? 0 : 1;
    
    return this.countConsecutiveDays(logs, today, startDaysBack);
  }

  private static countConsecutiveDays(logs: HabitLog[], fromDate: Date, startDaysBack: number): number {
    let streak = 0;
    
    for (let i = startDaysBack; i <= 365; i++) {
      const checkDate = new Date(fromDate);
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateStr = checkDate.toISOString().split('T')[0];
      
      const hasLogForDay = logs.some(log => log.date === checkDateStr);
      if (hasLogForDay) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
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

  // New utility methods for enhanced functionality
  static isHabitCompletedToday(habitId: string): boolean {
    const logs = this.getLogs();
    const today = new Date().toISOString().split('T')[0];
    
    const todayLog = logs.find(log => 
      log.habitId === habitId && 
      log.date === today && 
      log.completed
    );
    
    return !!todayLog;
  }

  static getTodayLog(habitId: string): HabitLog | undefined {
    const logs = this.getLogs();
    const today = new Date().toISOString().split('T')[0];
    
    return logs.find(log => 
      log.habitId === habitId && 
      log.date === today
    );
  }

  static getHabitStats(habitId: string): {
    totalDays: number;
    completedDays: number;
    totalCompletions: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
  } {
    const logs = this.getLogs().filter(log => log.habitId === habitId);
    const completedLogs = logs.filter(log => log.completed);
    
    const habit = this.getHabits().find(h => h.id === habitId);
    const currentStreak = habit?.streak || 0;
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    
    const sortedLogs = logs.sort((a, b) => a.date.localeCompare(b.date));
    
    for (let i = 0; i < sortedLogs.length; i++) {
      if (sortedLogs[i].completed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    return {
      totalDays: logs.length,
      completedDays: completedLogs.length,
      totalCompletions: completedLogs.length,
      completionRate: logs.length > 0 ? (completedLogs.length / logs.length) * 100 : 0,
      currentStreak,
      longestStreak,
    };
  }

  static undoTodayLog(habitId: string): boolean {
    const logs = this.getLogs();
    const today = new Date().toISOString().split('T')[0];
    
    const todayLogIndex = logs.findIndex(log => 
      log.habitId === habitId && 
      log.date === today
    );
    
    if (todayLogIndex !== -1) {
      logs.splice(todayLogIndex, 1);
      this.saveLogs(logs);
      this.updateStreak(habitId);
      return true;
    }
    
    return false;
  }

  static getAllHabitLogs(habitId: string): HabitLog[] {
    const logs = this.getLogs();
    return logs.filter(log => log.habitId === habitId);
  }
}

// Export utility functions for easy access
export const getHabitStats = HabitStorage.getHabitStats.bind(HabitStorage);
export const getAllHabitLogs = HabitStorage.getAllHabitLogs.bind(HabitStorage);
