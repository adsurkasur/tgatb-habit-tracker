import type { ExportBundle } from "@shared/schema";

type RawHabit = Partial<{
  id: string;
  name: string;
  type: string;
  streak: number;
  createdAt: string;
  updatedAt: string;
  lastCompletedDate: string;
  deviceId: string | null;
  version: number;
}>;

type RawLog = Partial<{
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  timestamp: string;
  updatedAt: string;
  deviceId: string | null;
  version: number;
}>;

export async function up(bundle: ExportBundle): Promise<ExportBundle> {
  const now = new Date().toISOString();
  const migrated: ExportBundle = { ...bundle } as ExportBundle;

  migrated.habits = (migrated.habits || []).map((h: RawHabit) => ({
    id: String(h.id ?? ""),
    name: String(h.name ?? ""),
    type: (String(h.type ?? "good") as ExportBundle["habits"][number]["type"]),
    streak: Number(h.streak ?? 0),
    createdAt: String(h.createdAt ?? now),
    lastCompletedDate: h.lastCompletedDate ?? undefined,
    updatedAt: h.updatedAt ?? h.createdAt ?? now,
    deviceId: h.deviceId ?? null,
    version: h.version ?? 1,
  } as unknown as ExportBundle["habits"][number]));

  migrated.logs = (migrated.logs || []).map((l: RawLog) => ({
    id: String(l.id ?? ""),
    habitId: String(l.habitId ?? ""),
    date: String(l.date ?? now),
    completed: Boolean(l.completed ?? false),
    timestamp: String(l.timestamp ?? now),
    updatedAt: l.updatedAt ?? l.timestamp ?? now,
    deviceId: l.deviceId ?? null,
    version: l.version ?? 1,
  } as unknown as ExportBundle["logs"][number]));

  migrated.version = migrated.version || "1";

  return migrated;
}

const migration = { up };
export default migration;
