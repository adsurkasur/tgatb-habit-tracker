import { Habit, HabitLog, UserSettings, HabitType, ExportBundle, exportBundleSchema } from "@shared/schema";
import { generateId, formatLocalDate } from "./utils";

const HABITS_KEY = "habits";
const LOGS_KEY = "habit_logs";
const SETTINGS_KEY = "user_settings";

export class HabitStorage {
  static clearAllHabits(): void {
    localStorage.removeItem(HABITS_KEY);
    localStorage.removeItem(LOGS_KEY);
  }
  static getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(HABITS_KEY);
      if (!data) return [];
      
      const raw = JSON.parse(data) as unknown[];
      return raw.map((h) => {
        const habitObj = h as Record<string, unknown>;
        const result: Habit = {
          id: String(habitObj.id),
          name: String(habitObj.name),
          type: habitObj.type as HabitType, // falls back to runtime data; schema enforces later
          streak: Number(habitObj.streak ?? 0),
          createdAt: new Date(String(habitObj.createdAt)),
          lastCompletedDate: habitObj.lastCompletedDate ? new Date(String(habitObj.lastCompletedDate)) : undefined,
        };
        return result;
      });
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
      id: generateId(),
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
      
      const raw = JSON.parse(data) as unknown[];
      return raw.map((l) => {
        const logObj = l as Record<string, unknown>;
        const result: HabitLog = {
          id: String(logObj.id),
          habitId: String(logObj.habitId),
          date: String(logObj.date),
          completed: Boolean(logObj.completed),
          timestamp: new Date(String(logObj.timestamp)),
        };
        return result;
      });
    } catch {
      return [];
    }
  }

  static saveLogs(logs: HabitLog[]): void {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }

  static addLog(habitId: string, completed: boolean): HabitLog {
    const logs = this.getLogs();
    const today = formatLocalDate(new Date()); // Use local timezone
    
    // Remove existing log for today if it exists
    const filteredLogs = logs.filter(log => !(log.habitId === habitId && log.date === today));
    
    const newLog: HabitLog = {
      id: generateId(),
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
    /**
     * Add or update a log for any habit and date. Overwrites existing log for habit/date.
     */
    static addOrUpdateLog(habitId: string, date: string, completed: boolean): HabitLog {
      const logs = this.getLogs();
      // Remove any existing log for this habit/date
      const filteredLogs = logs.filter(log => !(log.habitId === habitId && log.date === date));
      const newLog: HabitLog = {
        id: generateId(),
        habitId,
        date,
        completed,
        timestamp: new Date(),
      };
      filteredLogs.push(newLog);
      this.saveLogs(filteredLogs);
      // Update streak for this habit
      this.updateStreak(habitId);
      return newLog;
    }

  private static updateStreak(habitId: string): void {
    const habits = this.getHabits();
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    
    const habit = habits[habitIndex];
    const streak = this.calculateStreak(habitId, habit.type);
    
    habits[habitIndex].streak = streak;
    if (streak > 0) {
      habits[habitIndex].lastCompletedDate = new Date();
    }
    
    this.saveHabits(habits);
  }

  private static calculateStreak(habitId: string, habitType: HabitType): number {
    const allLogs = this.getLogs()
      .filter(log => log.habitId === habitId)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    if (allLogs.length === 0) return 0;
    
    const today = new Date();
    const todayStr = formatLocalDate(today); // Use local timezone
    
    // Find starting point for streak calculation
    const hasLogToday = allLogs.some(log => log.date === todayStr);
    const startDaysBack = hasLogToday ? 0 : 1;
    
    return this.countConsecutiveDays(allLogs, today, startDaysBack, habitType);
  }

  private static countConsecutiveDays(logs: HabitLog[], fromDate: Date, startDaysBack: number, habitType: HabitType): number {
    let streak = 0;
    
    for (let i = startDaysBack; i <= 365; i++) {
      const checkDate = new Date(fromDate);
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateStr = formatLocalDate(checkDate); // Use local timezone
      
      const logForDay = logs.find(log => log.date === checkDateStr);
      if (logForDay) {
        // For bad habits, streak continues when completed = false (didn't do bad thing)
        // For good habits, streak continues when completed = true (did good thing)
        const isSuccessfulDay = habitType === "bad" ? !logForDay.completed : logForDay.completed;
        if (isSuccessfulDay) {
          streak++;
        } else {
          break; // Streak broken
        }
      } else {
        break; // No log for this day, streak broken
      }
    }
    
    return streak;
  }

  static async getSettings(): Promise<UserSettings> {
    const { getSettings } = await import('./platform-storage');
    return getSettings();
  }

  static async saveSettings(settings: UserSettings): Promise<void> {
    const { saveSettings } = await import('./platform-storage');
    await saveSettings(settings);
  }

  static async exportData(): Promise<string> {
    const settings = await this.getSettings();
    const habits = this.getHabits().map(h => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
      lastCompletedDate: h.lastCompletedDate ? h.lastCompletedDate.toISOString() : undefined,
      updatedAt: h.updatedAt ? h.updatedAt.toISOString() : undefined,
    }));
    const logs = this.getLogs().map(l => ({
      ...l,
      timestamp: l.timestamp.toISOString(),
      updatedAt: l.updatedAt ? l.updatedAt.toISOString() : undefined,
    }));

    const bundle: ExportBundle = {
      version: "1",
      meta: {
        exportedAt: new Date().toISOString(),
        counts: { habits: habits.length, logs: logs.length },
      },
      habits,
      logs,
      settings,
    };

    return JSON.stringify(bundle, null, 2);
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      // Parse and run migrations before validation
      const parsedRaw = JSON.parse(jsonData);
      try {
        const migrationsModule = await import('./migrations');
        // runMigrations may or may not be exported; if present, call it with parsedRaw
        const runMigrations = (migrationsModule.runMigrations as ((b: unknown) => Promise<ExportBundle>) | undefined);
        const migrated = runMigrations ? await runMigrations(parsedRaw).catch(() => parsedRaw as ExportBundle) : (parsedRaw as ExportBundle);
        const validated = exportBundleSchema.safeParse(migrated);
        if (!validated.success) throw new Error('Invalid export file format');
        const data = validated.data;

        // Persist habits/logs (as-is JSON with strings for dates)
        localStorage.setItem(HABITS_KEY, JSON.stringify(data.habits));
        localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs));

        // Persist settings via platform storage when available
        try {
          const { saveSettings } = await import('./platform-storage');
          await saveSettings(data.settings as UserSettings);
        } catch {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
        }
      } catch (migErr) {
        throw migErr;
      }
  } catch (e) {
      throw new Error((e as Error).message || "Invalid JSON data format");
    }
  }

  // New utility methods for enhanced functionality
  static isHabitCompletedToday(habitId: string): boolean {
    const logs = this.getLogs();
    const today = formatLocalDate(new Date()); // Use local timezone
    
    const todayLog = logs.find(log => 
      log.habitId === habitId && 
      log.date === today
    );
    
    // Return true if there's any log for today (positive or negative action)
    return !!todayLog;
  }

  static getTodayLog(habitId: string): HabitLog | undefined {
    const logs = this.getLogs();
    const today = formatLocalDate(new Date()); // Use local timezone
    
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
    const habit = this.getHabits().find(h => h.id === habitId);
    
    if (!habit) {
      return {
        totalDays: 0,
        completedDays: 0,
        totalCompletions: 0,
        completionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }
    
    // For bad habits, "success" means NOT doing the habit (completed = false)
    // For good habits, "success" means doing the habit (completed = true)
    const successfulLogs = logs.filter(log => 
      habit.type === "bad" ? !log.completed : log.completed
    );
    
    const currentStreak = habit.streak || 0;
    
    // Calculate longest streak with correct logic for habit type
    let longestStreak = 0;
    let tempStreak = 0;
    
    const sortedLogs = logs.sort((a, b) => a.date.localeCompare(b.date));
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const isSuccessful = habit.type === "bad" ? !sortedLogs[i].completed : sortedLogs[i].completed;
      if (isSuccessful) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    return {
      totalDays: logs.length,
      completedDays: successfulLogs.length,
      totalCompletions: successfulLogs.length,
      completionRate: logs.length > 0 ? (successfulLogs.length / logs.length) * 100 : 0,
      currentStreak,
      longestStreak,
    };
  }

  static undoTodayLog(habitId: string): boolean {
    const logs = this.getLogs();
    const today = formatLocalDate(new Date()); // Use local timezone
    
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
