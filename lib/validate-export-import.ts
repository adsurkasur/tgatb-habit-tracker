import { exportBundleSchema, ExportBundle } from "@shared/schema";

export function validateExportImportJson(json: unknown): { success: boolean; errors?: string[]; data?: ExportBundle } {
  const result = exportBundleSchema.safeParse(json);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // Zod v4 uses `issues` instead of `errors`
    const issues = (result.error as any).issues || [];
    const errors = issues.map((e: any) => `${(e.path || []).join(".")}: ${e.message}`);
    return { success: false, errors };
  }
}
