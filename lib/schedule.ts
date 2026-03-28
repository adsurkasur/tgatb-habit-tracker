/**
 * @module schedule
 *
 * Pure helper functions for habit schedule logic.
 *
 * Determines which calendar dates are "expected" for a habit based on
 * its schedule configuration. Used by auto-finalize and streak calculation.
 *
 * Invariants:
 *   - All functions are **pure**  no side effects, no storage access,
 *     no Date.now() usage.
 *   - A habit with no schedule or `{ type: "daily" }` expects every day.
 *   - Interval schedules count from the habit's `intervalStartDate` (first log) or `createdAt`.
 *   - Weekly schedules match on `Date.getDay()` (0=Sun  6=Sat).
 *
 * Allowed callers:
 *   - `auto-finalize.ts`
 *   - `habit-storage.ts` (streak calculation)
 *   - Unit tests
 */

import type { Habit, HabitSchedule } from "@shared/schema";
import { formatLocalDate } from "./utils";

/** Default schedule applied to habits that lack one. */
const DEFAULT_SCHEDULE: HabitSchedule = { type: "daily" };

/** Resolve undefined schedule to the default. */
function resolve(schedule: HabitSchedule | undefined): HabitSchedule {
  return schedule ?? DEFAULT_SCHEDULE;
}

/**
 * Check whether a given date is an "expected" date for the habit.
 *
 * @param habit - The habit (uses `schedule` and `createdAt`).
 * @param date  - The date to check (time portion is ignored).
 * @returns `true` if the habit is expected on `date`.
 */
export function isExpectedDate(habit: Habit, date: Date): boolean {
  const schedule = resolve(habit.schedule);

  switch (schedule.type) {
    case "daily":
      return true;

    case "interval": {
      const intervalDays = schedule.intervalDays ?? 2;
      // Use intervalStartDate if available (first logged date), otherwise fall back to createdAt
      // Use formatLocalDate to ensure consistent timezone-aware date handling
      const startDate = habit.intervalStartDate ?? habit.createdAt;
      const startStr = formatLocalDate(startDate);
      const targetStr = formatLocalDate(date);

      // Parse date strings to calculate day difference
      const [startY, startM, startD] = startStr.split("-").map(Number);
      const [targetY, targetM, targetD] = targetStr.split("-").map(Number);

      const startDateObj = new Date(startY, startM - 1, startD);
      const targetDateObj = new Date(targetY, targetM - 1, targetD);

      const diffMs = targetDateObj.getTime() - startDateObj.getTime();
      const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

      const isExpected = diffDays >= 0 && diffDays % intervalDays === 0;
      
      // DEBUG
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[isExpectedDate] ${habit.name}:`, {
          startStr,
          targetStr,
          diffDays,
          intervalDays,
          isExpected,
        });
      }
      
      // Expected on day 0, intervalDays, 2*intervalDays, etc.
      return isExpected;
    }

    case "weekly": {
      const days = schedule.daysOfWeek ?? [];
      if (days.length === 0) return true; // no days selected = every day
      return days.includes(date.getDay());
    }

    default:
      return true;
  }
}

/**
 * Return all expected dates for a habit within a date range (inclusive).
 *
 * @param habit - The habit.
 * @param from  - Start of range (inclusive, time ignored).
 * @param to    - End of range (inclusive, time ignored).
 * @returns Array of Date objects (midnight local time) that are expected.
 */
export function getExpectedDates(habit: Habit, from: Date, to: Date): Date[] {
  const results: Date[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);

  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    if (isExpectedDate(habit, cursor)) {
      results.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return results;
}
