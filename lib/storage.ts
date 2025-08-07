import { Habit, HabitLog, UserSettings, HabitType } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for habit tracker
export interface IStorage {
  // Habit operations
  getHabits(): Promise<Habit[]>;
  getHabit(id: string): Promise<Habit | undefined>;
  createHabit(name: string, type: HabitType): Promise<Habit>;
  updateHabit(id: string, updates: Partial<Habit>): Promise<void>;
  deleteHabit(id: string): Promise<void>;
  
  // Habit log operations
  getLogs(): Promise<HabitLog[]>;
  getLogsByHabit(habitId: string): Promise<HabitLog[]>;
  createLog(habitId: string, completed: boolean): Promise<HabitLog>;
  
  // Settings operations
  getSettings(): Promise<UserSettings>;
  updateSettings(settings: UserSettings): Promise<void>;
}

export class MemStorage implements IStorage {
  private habits: Map<string, Habit>;
  private logs: Map<string, HabitLog>;
  private settings: UserSettings;

  constructor() {
    this.habits = new Map();
    this.logs = new Map();
    this.settings = {
      darkMode: false,
      language: "en",
      motivatorPersonality: "positive",
      fullscreenMode: false
    };
  }

  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(name: string, type: HabitType): Promise<Habit> {
    const habit: Habit = {
      id: randomUUID(),
      name,
      type,
      streak: 0,
      createdAt: new Date(),
    };
    this.habits.set(habit.id, habit);
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
    const habit = this.habits.get(id);
    if (habit) {
      const updated = { ...habit, ...updates };
      this.habits.set(id, updated);
    }
  }

  async deleteHabit(id: string): Promise<void> {
    this.habits.delete(id);
    // Also delete associated logs
    const logs = Array.from(this.logs.values()).filter(log => log.habitId !== id);
    this.logs.clear();
    logs.forEach(log => this.logs.set(log.id, log));
  }

  async getLogs(): Promise<HabitLog[]> {
    return Array.from(this.logs.values());
  }

  async getLogsByHabit(habitId: string): Promise<HabitLog[]> {
    return Array.from(this.logs.values()).filter(log => log.habitId === habitId);
  }

  async createLog(habitId: string, completed: boolean): Promise<HabitLog> {
    const today = new Date().toISOString().split('T')[0];
    
    // Remove existing log for today if it exists
    const existingLog = Array.from(this.logs.values()).find(
      log => log.habitId === habitId && log.date === today
    );
    if (existingLog) {
      this.logs.delete(existingLog.id);
    }
    
    const log: HabitLog = {
      id: randomUUID(),
      habitId,
      date: today,
      completed,
      timestamp: new Date(),
    };
    
    this.logs.set(log.id, log);
    return log;
  }

  async getSettings(): Promise<UserSettings> {
    return this.settings;
  }

  async updateSettings(settings: UserSettings): Promise<void> {
    this.settings = settings;
  }
}

export const storage = new MemStorage();
