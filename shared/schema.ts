import { z } from "zod";

export type HabitType = "good" | "bad";

export type MotivatorPersonality = "positive" | "adaptive" | "harsh";

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  streak: number;
  createdAt: Date;
  lastCompletedDate?: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  timestamp: Date;
}

export interface UserSettings {
  darkMode: boolean;
  language: "en" | "id";
  motivatorPersonality: MotivatorPersonality;
  fullscreenMode: boolean;
  autoSync?: boolean;
}

export const habitSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["good", "bad"]),
  streak: z.number(),
  createdAt: z.date(),
  lastCompletedDate: z.date().optional(),
});

export const habitLogSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  date: z.string(),
  completed: z.boolean(),
  timestamp: z.date(),
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
    })
  ),
  logs: z.array(
    z.object({
      id: z.string(),
      habitId: z.string(),
      date: z.string(),
      completed: z.boolean(),
      timestamp: z.string(),
    })
  ),
  settings: userSettingsSchema,
});

export type ExportBundle = z.infer<typeof exportBundleSchema>;
