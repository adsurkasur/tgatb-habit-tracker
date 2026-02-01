import { exportBundleSchema } from "../shared/schema";
import type { ExportBundle } from "../shared/schema";

export function validateExportImportJson(json: unknown): { success: boolean; errors?: string[]; data?: ExportBundle } {
  const result = exportBundleSchema.safeParse(json);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // Zod v4 exposes validation problems via `issues`
    const errors = result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`);
    return { success: false, errors };
  }
}
