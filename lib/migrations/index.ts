import type { ExportBundle } from "../../shared/schema";

const migrationFiles = [
  './0001-add-meta'
];

export async function runMigrations(bundle: ExportBundle): Promise<ExportBundle> {
  let result = { ...bundle } as ExportBundle;
  for (const mf of migrationFiles) {
    try {
      // Try dynamic imports in a robust order to support different runtimes
      // 1. ESM-like resolver: import('./module')
      // 2. Fallback with .ts extension for ts-node/esm if needed
      // 3. Fallback with .js extension where compiled output exists
      // eslint-disable-next-line no-await-in-loop
      const mod = await import(mf).catch(async () => await import(`${mf}.ts`).catch(async () => await import(`${mf}.js`).catch(() => null)));
      if (mod && typeof mod.up === 'function') {
        // eslint-disable-next-line no-await-in-loop
        result = await mod.up(result as ExportBundle);
      }
    } catch (e) {
      // If migration import or execution fails, continue to next migration (migrations should be idempotent and safe)
      // Log for visibility during dev/test runs
      // eslint-disable-next-line no-console
      console.warn('Migration failed to apply:', mf, e);
    }
  }
  return result;
}

const migrationsModule = { runMigrations };
export default migrationsModule;
