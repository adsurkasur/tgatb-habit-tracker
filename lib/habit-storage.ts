/**
 * @module habit-storage
 *
 * Canonical read/write layer for habits, logs, and settings in localStorage.
 *
 * Responsibilities:
 *   - CRUD operations on habits and logs.
 *   - Streak calculation (current & longest) based on log history.
 *   - Export/import of full data bundles (with migration support).
 *   - Delegating settings persistence to `platform-storage`.
 *
 * Invariants:
 *   - All storage keys are account-scoped via `scopedKey()` from
 *     `account-scope.ts`. This module MUST NOT hard-code key strings.
 *   - Streak recalculation MUST be triggered after any log mutation
 *     (including auto-finalization backfills).
 *   - This module MUST NOT access network, authentication state, or
 *     notification APIs.
 *
 * Allowed callers:
 *   - React hooks (`use-habits.ts`, `use-data-export.ts`).
 *   - `auto-finalize.ts` (via `recalculateStreak` only).
 *   - `use-cloud-sync.ts` / `use-cloud-backup.ts` for import/export.
 */

import { Habit, HabitLog, HabitSchedule, UserSettings, HabitType, ExportBundle, exportBundleSchema } from "@shared/schema";
import { generateId, formatLocalDate } from "./utils";
import { scopedKey } from "./account-scope";
import { isExpectedDate, getExpectedDates } from "./schedule";

// Storage keys are now dynamic — scoped to the active account.
function habitsKey(): string { return scopedKey("habits"); }
function logsKey(): string { return scopedKey("habit_logs"); }
function settingsKey(): string { return scopedKey("user_settings"); }

export class HabitStorage {
  static clearAllHabits(): void {
    localStorage.removeItem(habitsKey());
    localStorage.removeItem(logsKey());
  }
  static getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(habitsKey());
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
          // Apply default schedule at read-time (never rewrite storage)
          schedule: (habitObj.schedule as HabitSchedule | undefined) ?? { type: "daily" },
        };
        return result;
      });
    } catch {
      return [];
    }
  }

  static saveHabits(habits: Habit[]): void {
    localStorage.setItem(habitsKey(), JSON.stringify(habits));
  }

  static addHabit(name: string, type: HabitType, schedule?: HabitSchedule): Habit {
    const habits = this.getHabits();
    const newHabit: Habit = {
      id: generateId(),
      name,
      type,
      streak: 0,
      createdAt: new Date(),
      schedule: schedule ?? { type: "daily" },
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
      const data = localStorage.getItem(logsKey());
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
        // Preserve optional source field
        if (logObj.source === "manual" || logObj.source === "auto") {
          result.source = logObj.source;
        }
        return result;
      });
    } catch {
      return [];
    }
  }

  static saveLogs(logs: HabitLog[]): void {
    localStorage.setItem(logsKey(), JSON.stringify(logs));
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

    /**
     * Remove a log entry for a habit on a given date (revert to untracked).
     */
    static removeLog(habitId: string, date: string): void {
      const logs = this.getLogs();
      const filteredLogs = logs.filter(log => !(log.habitId === habitId && log.date === date));
      this.saveLogs(filteredLogs);
      this.updateStreak(habitId);
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

  /**
   * Public entry-point for recalculating and persisting a habit's streak.
   * Called after auto-finalization inserts backfill logs.
   *
   * @throws {Error} (dev-only) If habitId is empty.
   */
  static recalculateStreak(habitId: string): void {
    if (process.env.NODE_ENV !== "production" && (!habitId || habitId.trim().length === 0)) {
      throw new Error("[habit-storage] recalculateStreak called with empty habitId");
    }
    this.updateStreak(habitId);
  }

  private static calculateStreak(habitId: string, habitType: HabitType): number {
    const habit = this.getHabits().find(h => h.id === habitId);
    if (!habit) return 0;

    const allLogs = this.getLogs()
      .filter(log => log.habitId === habitId)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    if (allLogs.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.countExpectedStreak(habit, allLogs, today, habitType);
  }

  /**
   * Schedule-aware streak calculation.
   * Walks backward through expected dates only. Gaps between expected dates
   * do NOT break the streak — only missing an expected date does.
   */
  private static countExpectedStreak(habit: Habit, logs: HabitLog[], today: Date, habitType: HabitType): number {
    let streak = 0;
    const todayStr = formatLocalDate(today);
    const logMap = new Map<string, HabitLog>();
    for (const log of logs) {
      logMap.set(log.date, log);
    }

    // Walk backward up to 365 calendar days, but only count expected dates
    for (let i = 0; i <= 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      const checkDateStr = formatLocalDate(checkDate);

      // Skip non-expected dates (they don't affect streak)
      if (!isExpectedDate(habit, checkDate)) continue;

      // Today: if no log yet, skip (grace period) — don't break streak
      if (checkDateStr === todayStr) {
        const logForDay = logMap.get(checkDateStr);
        if (!logForDay) continue; // grace period
        const isSuccessfulDay = habitType === "bad" ? !logForDay.completed : logForDay.completed;
        if (isSuccessfulDay) {
          streak++;
        } else {
          break;
        }
        continue;
      }

      const logForDay = logMap.get(checkDateStr);
      if (logForDay) {
        const isSuccessfulDay = habitType === "bad" ? !logForDay.completed : logForDay.completed;
        if (isSuccessfulDay) {
          streak++;
        } else {
          break; // Streak broken
        }
      } else {
        break; // Missing expected date — streak broken
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
      schedule: h.schedule,
    }));
    const logs = this.getLogs().map(l => ({
      ...l,
      timestamp: l.timestamp.toISOString(),
      updatedAt: l.updatedAt ? l.updatedAt.toISOString() : undefined,
      source: l.source,
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
        localStorage.setItem(habitsKey(), JSON.stringify(data.habits));
        localStorage.setItem(logsKey(), JSON.stringify(data.logs));

        // Persist settings via platform storage when available
        try {
          const { saveSettings } = await import('./platform-storage');
          await saveSettings(data.settings as UserSettings);
        } catch {
          localStorage.setItem(settingsKey(), JSON.stringify(data.settings));
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
    
    // Calculate longest streak — schedule-aware
    // For interval/weekly habits, gaps between non-expected dates don't break streaks
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Filter to only expected-date logs for schedule-aware counting
    const sortedLogs = logs
      .filter(log => {
        const d = new Date(log.date + "T00:00:00");
        return isExpectedDate(habit, d);
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const isSuccessful = habit.type === "bad" ? !sortedLogs[i].completed : sortedLogs[i].completed;
      if (isSuccessful) {
        // For longest streak, check if no expected date was missed between this and previous
        if (tempStreak > 0 && i > 0) {
          const prevDate = new Date(sortedLogs[i - 1].date + "T00:00:00");
          const currDate = new Date(sortedLogs[i].date + "T00:00:00");
          // Count expected dates between prevDate and currDate (exclusive)
          const dayAfterPrev = new Date(prevDate);
          dayAfterPrev.setDate(dayAfterPrev.getDate() + 1);
          const dayBeforeCurr = new Date(currDate);
          dayBeforeCurr.setDate(dayBeforeCurr.getDate() - 1);
          const expectedBetween = dayAfterPrev <= dayBeforeCurr
            ? getExpectedDates(habit, dayAfterPrev, dayBeforeCurr)
            : [];
          if (expectedBetween.length > 0) {
            // Missed expected dates between — reset streak
            tempStreak = 1;
          } else {
            tempStreak++;
          }
        } else {
          tempStreak = tempStreak === 0 ? 1 : tempStreak + 1;
        }
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
