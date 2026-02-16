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
 *   - Interval schedules count from the habit's `createdAt` date.
 *   - Weekly schedules match on `Date.getDay()` (0=Sun  6=Sat).
 *
 * Allowed callers:
 *   - `auto-finalize.ts`
 *   - `habit-storage.ts` (streak calculation)
 *   - Unit tests
 */

import type { Habit, HabitSchedule } from "@shared/schema";

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
      const created = new Date(habit.createdAt);
      created.setHours(0, 0, 0, 0);

      const target = new Date(date);
      target.setHours(0, 0, 0, 0);

      const diffMs = target.getTime() - created.getTime();
      const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

      // Expected on day 0, intervalDays, 2*intervalDays, etc.
      return diffDays >= 0 && diffDays % intervalDays === 0;
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
