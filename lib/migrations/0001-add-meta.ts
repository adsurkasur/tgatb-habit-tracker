import type { ExportBundle } from "../../shared/schema.ts";

export async function up(bundle: ExportBundle): Promise<ExportBundle> {
  const now = new Date().toISOString();
  const migrated = { ...bundle } as any;

  migrated.habits = (migrated.habits || []).map((h: any) => ({
    ...h,
    updatedAt: h.updatedAt || h.createdAt || now,
    deviceId: h.deviceId || null,
    version: h.version || 1,
  }));

  migrated.logs = (migrated.logs || []).map((l: any) => ({
    ...l,
    updatedAt: l.updatedAt || l.timestamp || now,
    deviceId: l.deviceId || null,
    version: l.version || 1,
  }));

  // bump bundle version if needed (keep existing version string if present)
  migrated.version = migrated.version || "1";

  return migrated as ExportBundle;
}

export default { up };
