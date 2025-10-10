import { exportBundleSchema, ExportBundle } from "@shared/schema";
import { ZodError } from "zod";

export function validateExportImportJson(json: unknown): { success: boolean; errors?: string[]; data?: ExportBundle } {
  const result = exportBundleSchema.safeParse(json);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const err = result.error;
    let issues: Array<{ path?: Array<string | number>; message: string }> = [];
    if (err instanceof ZodError) {
  issues = err.issues.map(i => ({ path: i.path.map(p => (typeof p === 'symbol' ? String(p) : p as string | number)), message: i.message }));
    }
    const errors = issues.map((e) => `${(e.path || []).join(".")}: ${e.message}`);
    return { success: false, errors };
  }
}
