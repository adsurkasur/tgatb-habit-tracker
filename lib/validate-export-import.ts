import { exportBundleSchema, ExportBundle } from "@shared/schema";

export function validateExportImportJson(json: unknown): { success: boolean; errors?: string[]; data?: ExportBundle } {
  const result = exportBundleSchema.safeParse(json);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
    return { success: false, errors };
  }
}
