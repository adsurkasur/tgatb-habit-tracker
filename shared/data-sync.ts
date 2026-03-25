import type { ExportBundle } from './schema';

// Serialize a validated export bundle to JSON
export function exportBundleToJson(bundle: ExportBundle): string {
  return JSON.stringify(bundle);
}

// Deserialize and validate a JSON string as an ExportBundle
export async function importBundleFromJson(json: string): Promise<ExportBundle | null> {
  try {
    const parsed = JSON.parse(json);

    // Lightweight structural validation to avoid pulling heavy schema imports
    const isLikelyExportBundle = (v: unknown): v is ExportBundle => {
      if (!v || typeof v !== 'object') return false;
      const obj = v as Record<string, unknown>;
      if (!('version' in obj) || typeof obj.version !== 'string') return false;
      if (!('habits' in obj) || !Array.isArray(obj.habits)) return false;
      if (!('logs' in obj) || !Array.isArray(obj.logs)) return false;
      if (!('settings' in obj) || typeof obj.settings !== 'object') return false;
      return true;
    };

    if (!isLikelyExportBundle(parsed)) return null;
    return parsed as ExportBundle;
  } catch {
    return null;
  }
}

// Convenience helpers for working with habits arrays while preserving settings/logs.
export function exportHabitsToJson(
  habits: ExportBundle['habits'],
  settings: ExportBundle['settings'],
  logs: ExportBundle['logs'] = []
): string {
  const bundle: ExportBundle = {
    version: '1',
    meta: {
      exportedAt: new Date().toISOString(),
      counts: { habits: habits.length, logs: logs.length },
    },
    habits,
    logs,
    settings,
  };
  return exportBundleToJson(bundle);
}

export async function importHabitsFromJson(json: string): Promise<ExportBundle['habits'] | null> {
  const bundle = await importBundleFromJson(json);
  return bundle ? bundle.habits : null;
}

// Usage:
// - Use exportBundleToJson() before uploading to Drive
// - Use importBundleFromJson() after downloading from Drive
// - For legacy helpers use exportHabitsToJson/importHabitsFromJson
