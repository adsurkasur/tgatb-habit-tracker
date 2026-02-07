import type { ExportBundle } from "../../shared/schema";

const migrations: Array<{ up?: (b: ExportBundle) => Promise<ExportBundle> | ExportBundle }> = [];
let migrationsLoaded = false;

async function loadMigrations(): Promise<void> {
  if (migrationsLoaded) return;
  // Avoid dynamic imports from client-side bundles; migrations are server-only
  if (typeof window !== 'undefined') {
    migrationsLoaded = true;
    return;
  }

  const baseNoExt = new URL('./0001-add-meta', import.meta.url).href;
  const baseTs = new URL('./0001-add-meta.ts', import.meta.url).href;
  try {
    const m = await import(baseNoExt);
    migrations.push(m.default || m);
  } catch {
    // Try explicit .ts path if file exists (useful for ts-node test runs)
    try {
      const { fileURLToPath } = await import('url');
      const tsPath = fileURLToPath(new URL('./0001-add-meta.ts', import.meta.url));
      const { existsSync } = await import('fs');
      if (existsSync(tsPath)) {
        const m = await import(baseTs);
        migrations.push(m.default || m);
      }
    } catch {
      // No migration loaded; this is non-fatal
    }
  }
  migrationsLoaded = true;
}

export async function runMigrations(bundle: ExportBundle): Promise<ExportBundle> {
  let result = { ...bundle } as ExportBundle;
  await loadMigrations();
  for (const m of migrations) {
    if (typeof m.up === "function") {
      // migration receives and returns bundle (idempotent)
      result = await m.up(result);
    }
  }
  return result;
}

const migrationsModule = { runMigrations };
export default migrationsModule;
