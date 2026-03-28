import type { UserSettings, Habit } from "@shared/schema";
import { STREAK_QUOTE_IDS } from "@/lib/streak-quotes";

export type CelebrationMilestoneId = string;
export type CelebrationUnit = "weeks" | "cycles" | "checkins";

export interface CelebrationMilestone {
  id: CelebrationMilestoneId;
  days: number;
  weeks: number;
  enabled: boolean;
  quoteKeys: string[];
}

export interface StreakCelebrationPayload {
  milestoneId: CelebrationMilestoneId;
  milestoneDays: number;
  milestoneWeeks: number;
  milestoneCount: number; // For cycle/interval: number of successful check-ins or weeks completed
  unit: CelebrationUnit; // "weeks" for daily, "cycles" for weekly/intervals, "checkins" for every-n-days
  habitId: string;
  habitName: string;
  streak: number;
  quoteKey: string;
  triggeredAt: string;
}

const WEEK_DAYS = 7;
const MAX_PROGRESSIVE_WEEKS = 52;

function buildWeeklyMilestones(maxWeeks: number): CelebrationMilestone[] {
  const milestones: CelebrationMilestone[] = [];

  for (let weeks = 1; weeks <= maxWeeks; weeks += 1) {
    milestones.push({
      id: `week${weeks}`,
      days: weeks * WEEK_DAYS,
      weeks,
      enabled: true,
      quoteKeys: STREAK_QUOTE_IDS,
    });
  }

  return milestones;
}

export const STREAK_MILESTONES: CelebrationMilestone[] = buildWeeklyMilestones(MAX_PROGRESSIVE_WEEKS);

function pickQuoteKey(keys: string[], seed: string): string {
  if (keys.length === 0) return STREAK_QUOTE_IDS[0] ?? "caesar-veni-vidi-vici";
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return keys[hash % keys.length];
}

export function evaluateStreakMilestoneCrossing(params: {
  previousStreak: number;
  nextStreak: number;
  isPositiveOutcome: boolean;
  habitId: string;
  habitName: string;
  habit?: Habit; // Optional habit object to determine schedule type
}): StreakCelebrationPayload | null {
  const { previousStreak, nextStreak, isPositiveOutcome, habitId, habitName, habit } = params;

  if (!isPositiveOutcome) return null;

  const crossedMilestones = STREAK_MILESTONES.filter(
    (m) => m.enabled && previousStreak < m.days && nextStreak >= m.days,
  );

  const milestone = crossedMilestones[crossedMilestones.length - 1];

  if (!milestone) return null;

  // Determine unit and count based on schedule type
  let unit: CelebrationUnit = "weeks";
  let milestoneCount = milestone.weeks;

  if (habit?.schedule) {
    if (habit.schedule.type === "weekly") {
      // For weekday schedules: celebrate week completion (1 complete week, 2 complete weeks, etc.)
      unit = "cycles";
      milestoneCount = milestone.weeks; // Still use weeks as the unit count
    } else if (habit.schedule.type === "interval") {
      // For interval schedules: celebrate every 7 check-ins
      unit = "checkins";
      milestoneCount = nextStreak; // Use streak count directly as check-in count
    }
  }

  const seed = `${habitId}:${nextStreak}:${milestone.id}`;
  return {
    milestoneId: milestone.id,
    milestoneDays: milestone.days,
    milestoneWeeks: milestone.weeks,
    milestoneCount,
    unit,
    habitId,
    habitName,
    streak: nextStreak,
    quoteKey: pickQuoteKey(milestone.quoteKeys, seed),
    triggeredAt: new Date().toISOString(),
  };
}

export function shouldShowCelebrationEffects(settings: UserSettings): boolean {
  return settings.celebrationEffectsEnabled !== false;
}

export function shouldPlayCelebrationSound(settings: UserSettings): boolean {
  return settings.soundEnabled !== false && settings.celebrationSoundEnabled !== false;
}

export function shouldPlayCelebrationHaptics(settings: UserSettings): boolean {
  return settings.hapticEnabled !== false && settings.celebrationHapticsEnabled !== false;
}

export function isReducedCelebrationMotion(settings: UserSettings): boolean {
  if (settings.celebrationMotion === "reduced") return true;
  if (settings.celebrationMotion === "full") return false;

  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getCelebrationConfettiCount(settings: UserSettings): number {
  if (settings.celebrationConfettiIntensity === "low") return 18;
  if (settings.celebrationConfettiIntensity === "high") return 52;
  return 32;
}
