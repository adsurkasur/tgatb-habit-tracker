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
