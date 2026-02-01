import type { Habit, HabitLog } from "@shared/schema";

export type MergeConflictEntry = { base: unknown; local: unknown; remote: unknown };

export type MergeResult<T> = {
  merged: T;
  conflict: boolean;
  conflicts?: Record<string, MergeConflictEntry>;
};

function parseTime(v?: string | Date | number): number {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  const n = Date.parse(String(v));
  return isNaN(n) ? 0 : n;
}

// Three-way merge with basic conflict detection.
export function mergeByTimestamp<T extends { id: string; updatedAt?: string | number | Date }>(
  local: T | null,
  remote: T | null,
  base?: T | null
): MergeResult<T> {
  if (!local && !remote) throw new Error("Both local and remote are null");
  if (!local && remote) return { merged: remote, conflict: false } as MergeResult<T>;
  if (!remote && local) return { merged: local, conflict: false } as MergeResult<T>;

  const merged: Record<string, unknown> = { ...(base || {}), ...(local || {}), ...(remote || {}) };
  const conflicts: Record<string, MergeConflictEntry> = {};

  const keys = new Set<string>([
    ...Object.keys((base as Record<string, unknown>) || {}),
    ...Object.keys((local as Record<string, unknown>) || {}),
    ...Object.keys((remote as Record<string, unknown>) || {}),
  ]);

  for (const k of keys) {
    const b = base ? (base as Record<string, unknown>)[k] : undefined;
    const l = local ? (local as Record<string, unknown>)[k] : undefined;
    const r = remote ? (remote as Record<string, unknown>)[k] : undefined;

    if (JSON.stringify(l) === JSON.stringify(r)) {
      merged[k] = l !== undefined ? l : r;
      continue;
    }

    if (JSON.stringify(b) === JSON.stringify(l) && JSON.stringify(b) !== JSON.stringify(r)) {
      merged[k] = r;
      continue;
    }
    if (JSON.stringify(b) === JSON.stringify(r) && JSON.stringify(b) !== JSON.stringify(l)) {
      merged[k] = l;
      continue;
    }

    const lTs = parseTime((local as unknown as { updatedAt?: string | number | Date })?.updatedAt);
    const rTs = parseTime((remote as unknown as { updatedAt?: string | number | Date })?.updatedAt);
    if (lTs > rTs) {
      merged[k] = l;
      continue;
    }
    if (rTs > lTs) {
      merged[k] = r;
      continue;
    }

    conflicts[k] = { base: b, local: l, remote: r };
    merged[k] = l;
  }

  return { merged: merged as T, conflict: Object.keys(conflicts).length > 0, conflicts };
}

export function mergeHabit(local: Habit | null, remote: Habit | null, base?: Habit | null) {
  return mergeByTimestamp<Habit>(local, remote, base);
}

export function mergeLog(local: HabitLog | null, remote: HabitLog | null, base?: HabitLog | null) {
  return mergeByTimestamp<HabitLog>(local, remote, base);
}

const MergeUtils = { mergeByTimestamp, mergeHabit, mergeLog };
export default MergeUtils;
