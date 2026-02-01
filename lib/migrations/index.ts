import type { ExportBundle } from "../../shared/schema";
import migration0001 from "./0001-add-meta";

const migrations = [migration0001];

export async function runMigrations(bundle: ExportBundle): Promise<ExportBundle> {
  let result = { ...bundle } as ExportBundle;
  for (const m of migrations) {
    if (typeof m.up === "function") {
      // migration receives and returns bundle (idempotent)
      // eslint-disable-next-line no-await-in-loop
      result = await m.up(result);
    }
  }
  return result;
}

const migrationsModule = { runMigrations };
export default migrationsModule;
