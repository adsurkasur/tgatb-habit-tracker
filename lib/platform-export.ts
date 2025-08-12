import { Capacitor } from "@capacitor/core";
import { exportDataAndroid, exportDataWeb } from "@/lib/platform-export-utils";
type ToastVariant = "default" | "destructive" | null | undefined;
type ToastHandler = (opts: { title: string; description?: string; variant?: ToastVariant; duration?: number }) => void;

// Platform-specific export utility
export async function exportDataPlatform({
  data,
  defaultFilename,
  toast,
}: {
  data: string;
  defaultFilename: string;
  toast: ToastHandler;
}): Promise<boolean> {
  let success = false;
  try {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
      success = await exportDataAndroid({ data, defaultFilename });
    }
    if (!success) {
      success = await exportDataWeb({ data, defaultFilename });
    }
    if (success) {
      toast({
        title: "Export successful",
        description: "Your habit data has been exported.",
        duration: 3000,
      });
    } else {
      toast({
        title: "Export failed",
        description: "Could not export your habit data.",
        variant: "destructive",
        duration: 3000,
      });
    }
    return success;
  } catch (err) {
    toast({
      title: "Export failed",
      description: (err as Error).message || "Could not export your habit data.",
      variant: "destructive",
      duration: 3000,
    });
    return false;
  }
}
