/**
 * @module auto-finalize
 *
 * Backfill engine for unlogged calendar days.
 *
 * On every app open / day boundary, this scans all habits and creates
 * auto-generated failure logs for any calendar day between a habit's
 * createdAt and **yesterday** (inclusive) that has no log entry.
 *
 * - Good habits → completed: false (missed)
 * - Bad habits  → completed: true  (assumed indulged — counts as failure for streak)
 *
 * Today is NEVER finalized (grace period — user still has time).
 *
 * All auto-generated logs carry `source: "auto"` so they can be
 * distinguished from manual entries.
 *
 * Invariants:
 *   - `computeAutoLogs()` is a **pure function** — no side effects,
 *     no storage access, no network calls.
 *   - The caller (`use-habits.ts`) is responsible for persisting the
 *     returned logs and triggering streak recalculation.
 *   - Today's date MUST NEVER appear in the output (grace period).
 *   - Duplicate logs MUST NOT be generated for dates that already
 *     have an entry — the `existingLogs` set is authoritative.
 *
 * Allowed callers:
 *   - `use-habits.ts` (the only orchestrator of auto-finalization).
 *   - Unit tests.
 */

import type { Habit, HabitLog } from "@shared/schema";
import { generateId, formatLocalDate } from "./utils";
import { isExpectedDate } from "./schedule";

/**
 * Given all habits and all existing logs, return an array of new auto-generated
 * logs that should be persisted. The caller is responsible for actually saving.
 *
 * This function is pure — no side effects, no storage access.
 *
 * Runtime guards:
 *   - Never emits a log for today (grace period).
 *   - Never emits a log for a date that already has an entry.
 *   - Deduplicates output by (habitId, date) pair.
 */
export function computeAutoLogs(
  habits: Habit[],
  existingLogs: HabitLog[],
): HabitLog[] {
  const now = new Date();
  const todayStr = formatLocalDate(now);

  // Build a lookup: habitId → Set<dateStr>
  const loggedDates = new Map<string, Set<string>>();
  for (const log of existingLogs) {
    let set = loggedDates.get(log.habitId);
    if (!set) {
      set = new Set<string>();
      loggedDates.set(log.habitId, set);
    }
    set.add(log.date);
  }

  const newLogs: HabitLog[] = [];
  // Guard against duplicate (habitId, date) pairs in output
  const emitted = new Set<string>();

  for (const habit of habits) {
    const existing = loggedDates.get(habit.id) ?? new Set<string>();
    const startDate = new Date(habit.createdAt);
    // Normalize to start of day in local timezone
    startDate.setHours(0, 0, 0, 0);

    // Walk from createdAt to yesterday
    const cursor = new Date(startDate);
    while (true) {
      const dateStr = formatLocalDate(cursor);

      // Stop when we reach today (grace period)
      if (dateStr >= todayStr) break;

      const emitKey = `${habit.id}::${dateStr}`;
      if (!existing.has(dateStr) && !emitted.has(emitKey) && isExpectedDate(habit, cursor)) {
        // Good habit missed → completed: false
        // Bad habit missed  → completed: true (indulged / not resisted)
        const completed = habit.type === "bad";

        newLogs.push({
          id: generateId(),
          habitId: habit.id,
          date: dateStr,
          completed,
          timestamp: new Date(`${dateStr}T23:59:59`),
          source: "auto",
        });
        emitted.add(emitKey);
      }

      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Final safety: strip any log that somehow targets today
  return newLogs.filter((log) => log.date !== todayStr);
}
