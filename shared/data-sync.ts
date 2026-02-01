import type { ExportBundle } from './schema';
import { exportBundleSchema } from './schema';

// Serialize a validated export bundle to JSON
export function exportBundleToJson(bundle: ExportBundle): string {
  return JSON.stringify(bundle);
}

// Deserialize and validate a JSON string as an ExportBundle
export function importBundleFromJson(json: string): ExportBundle | null {
  try {
    const parsed = JSON.parse(json);
    const validated = exportBundleSchema.safeParse(parsed);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

// Convenience helpers for working with just habits arrays (legacy compatibility)
export function exportHabitsToJson(habits: ExportBundle['habits']): string {
  const bundle: ExportBundle = {
    version: '1',
    meta: {
      exportedAt: new Date().toISOString(),
      counts: { habits: habits.length, logs: 0 },
    },
    habits,
    logs: [],
    settings: { darkMode: false, language: 'en', motivatorPersonality: 'positive', fullscreenMode: false },
  };
  return exportBundleToJson(bundle);
}

export function importHabitsFromJson(json: string): ExportBundle['habits'] | null {
  const bundle = importBundleFromJson(json);
  return bundle ? bundle.habits : null;
}

// Usage:
// - Use exportBundleToJson() before uploading to Drive
// - Use importBundleFromJson() after downloading from Drive
// - For legacy helpers use exportHabitsToJson/importHabitsFromJson
