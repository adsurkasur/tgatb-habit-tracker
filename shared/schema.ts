import { z } from "zod";

export type HabitType = "good" | "bad";

export type MotivatorPersonality = "positive" | "adaptive" | "harsh";

export type HabitScheduleType = "daily" | "interval" | "weekly";

export interface HabitSchedule {
  type: HabitScheduleType;
  /** Number of days between expected dates (only for type "interval"). */
  intervalDays?: number;
  /** Days of week when habit is expected (0=Sun … 6=Sat, only for type "weekly"). */
  daysOfWeek?: number[];
}

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  streak: number;
  createdAt: Date;
  lastCompletedDate?: Date;
  /** Schedule configuration. Defaults to { type: "daily" } at read-time. */
  schedule?: HabitSchedule;
  // optional metadata for sync/migrations
  updatedAt?: Date;
  deviceId?: string;
  version?: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  timestamp: Date;
  /** How this log was created: "manual" (user action) or "auto" (auto-finalization). */
  source?: "manual" | "auto";
  // optional metadata for sync/migrations
  updatedAt?: Date;
  deviceId?: string;
  version?: number;
}

export interface UserSettings {
  darkMode: boolean;
  language: "en" | "id";
  motivatorPersonality: MotivatorPersonality;
  fullscreenMode: boolean;
  autoSync?: boolean;
  analyticsConsent?: boolean;
  /** Whether daily reminder notifications are enabled. */
  reminderEnabled?: boolean;
  /** Reminder time in "HH:mm" format (local time), null when disabled. */
  reminderTime?: string | null;
  /** Whether sound feedback is enabled. Default ON. */
  soundEnabled?: boolean;
  /** Whether haptic feedback is enabled. Default ON. */
  hapticEnabled?: boolean;
}

export const habitScheduleSchema = z.object({
  type: z.enum(["daily", "interval", "weekly"]),
  intervalDays: z.number().int().min(2).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
});

export const habitSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["good", "bad"]),
  streak: z.number(),
  createdAt: z.date(),
  lastCompletedDate: z.date().optional(),
  schedule: habitScheduleSchema.optional(),
  updatedAt: z.date().optional(),
  deviceId: z.string().optional(),
  version: z.number().int().optional(),
});

export const habitLogSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  date: z.string(),
  completed: z.boolean(),
  timestamp: z.date(),
  source: z.enum(["manual", "auto"]).optional(),
  updatedAt: z.date().optional(),
  deviceId: z.string().optional(),
  version: z.number().int().optional(),
});

export const createHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  type: z.enum(["good", "bad"]),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;

// Settings schema for validation (used during import/export)
export const userSettingsSchema = z.object({
  darkMode: z.boolean(),
  language: z.enum(["en", "id"]),
  motivatorPersonality: z.enum(["positive", "adaptive", "harsh"]),
  fullscreenMode: z.boolean(),
  autoSync: z.boolean().optional(),
  analyticsConsent: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z.string().nullable().optional(),
  soundEnabled: z.boolean().optional(),
  hapticEnabled: z.boolean().optional(),
});

// Export bundle schema and types
export const exportBundleSchema = z.object({
  version: z.literal("1"),
  meta: z.object({
    exportedAt: z.string(),
    counts: z.object({
      habits: z.number().nonnegative(),
      logs: z.number().nonnegative(),
    }),
  }),
  habits: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["good", "bad"]),
      streak: z.number(),
      createdAt: z.string(),
      lastCompletedDate: z.string().optional(),
      schedule: habitScheduleSchema.optional(),
      updatedAt: z.string().optional(),
      deviceId: z.string().optional(),
      version: z.number().int().optional(),
    })
  ),
  logs: z.array(
    z.object({
      id: z.string(),
      habitId: z.string(),
      date: z.string(),
      completed: z.boolean(),
      timestamp: z.string(),
      source: z.enum(["manual", "auto"]).optional(),
      updatedAt: z.string().optional(),
      deviceId: z.string().optional(),
      version: z.number().int().optional(),
    })
  ),
  settings: userSettingsSchema,
});

export type ExportBundle = z.infer<typeof exportBundleSchema>;
