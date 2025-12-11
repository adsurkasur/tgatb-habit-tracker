import type { Habit, HabitLog } from "../../shared/schema.ts";

export type MergeResult<T> = {
  merged: T;
  conflict: boolean;
  conflicts?: Record<string, { base: any; local: any; remote: any }>;
};

function parseTime(v?: string | Date | number): number {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  const n = Date.parse(String(v));
  return isNaN(n) ? 0 : n;
}

function isPrimitive(val: any) {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
}

// Three-way merge with basic conflict detection.
export function mergeByTimestamp<T extends { id: string; updatedAt?: any }>(
  local: T | null,
  remote: T | null,
  base?: T | null
): MergeResult<T> {
  // If only one side exists, return it
  if (!local && !remote) throw new Error('Both local and remote are null');
  if (!local && remote) return { merged: remote, conflict: false } as MergeResult<T>;
  if (!remote && local) return { merged: local, conflict: false } as MergeResult<T>;

  // Both exist
  const merged: any = { ...(base || {}), ...(local || {}), ...(remote || {}) };
  const conflicts: Record<string, any> = {};

  // For each key in union of fields, decide outcome
  const keys = new Set<string>([...Object.keys(base || {}), ...Object.keys(local || {}), ...Object.keys(remote || {})]);
  for (const k of keys) {
    const b = base ? (base as any)[k] : undefined;
    const l = local ? (local as any)[k] : undefined;
    const r = remote ? (remote as any)[k] : undefined;

    // If identical between local and remote, take either
    if (JSON.stringify(l) === JSON.stringify(r)) {
      merged[k] = l !== undefined ? l : r;
      continue;
    }

    // If base equals one side, take the other (simple change)
    if (JSON.stringify(b) === JSON.stringify(l) && JSON.stringify(b) !== JSON.stringify(r)) {
      merged[k] = r;
      continue;
    }
    if (JSON.stringify(b) === JSON.stringify(r) && JSON.stringify(b) !== JSON.stringify(l)) {
      merged[k] = l;
      continue;
    }

    // Neither equal to base -> concurrent changes; resolve by timestamp
    const lTs = parseTime((local as any)?.updatedAt);
    const rTs = parseTime((remote as any)?.updatedAt);
    if (lTs > rTs) {
      merged[k] = l;
      continue;
    }
    if (rTs > lTs) {
      merged[k] = r;
      continue;
    }

    // Timestamps tie or unavailable — mark conflict
    conflicts[k] = { base: b, local: l, remote: r };
    merged[k] = l; // default to local for determinism
  }

  return { merged: merged as T, conflict: Object.keys(conflicts).length > 0, conflicts };
}

export function mergeHabit(local: Habit | null, remote: Habit | null, base?: Habit | null) {
  return mergeByTimestamp<Habit>(local, remote, base);
}

export function mergeLog(local: HabitLog | null, remote: HabitLog | null, base?: HabitLog | null) {
  return mergeByTimestamp<HabitLog>(local, remote, base);
}

export default {
  mergeByTimestamp,
  mergeHabit,
  mergeLog,
};
