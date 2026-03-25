import { useRef, useState } from "react";
import { debounce } from "@/lib/utils/debounce";
import { validateExportImportJson } from "@/lib/validate-export-import";
import { exportDataPlatform } from "@/lib/platform-export";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/hooks/use-loading";

export function useDataExport(
  onExportData: () => Promise<string>,
  onImportData: (jsonData: string) => Promise<void> | void
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { show: showLoading, hide: hideLoading } = useLoading();
  const [isExporting, setIsExporting] = useState(false);
  const exportInProgressRef = useRef(false);

  const handleExportClick = debounce(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    setIsExporting(true);

    showLoading();
    toast({
      title: "Exporting...",
      description: "Your data is being exported. Please wait.",
      duration: 3000,
    });

    try {
      // Get export data as JSON string
      const result = await onExportData();
      const defaultFilename = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`;

      // Use platform export utility for file saving and feedback
      await exportDataPlatform({
        data: result,
        defaultFilename,
        toast,
      });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        (('name' in err && (err as { name?: string }).name === 'AbortError') ||
        ('message' in err && typeof (err as { message?: string }).message === 'string' &&
         (err as { message?: string }).message !== undefined &&
         (err as { message?: string }).message!.includes('The user aborted a request')))
      ) {
        // User canceled the file dialog, do nothing
      } else {
        toast({
          title: "Export Failed",
          description: "There was an error exporting your data. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsExporting(false);
      exportInProgressRef.current = false;
      hideLoading();
    }
  }, 500);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showLoading();
      toast({
        title: "Importing...",
        description: "Your data is being imported. Please wait.",
        duration: 3000,
      });

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonData = event.target?.result as string;
          if (jsonData) {
            let jsonObj: unknown;
            try {
              jsonObj = JSON.parse(jsonData);
            } catch {
              toast({
                title: "Import Failed",
                description: "The file is not valid JSON format.",
                variant: "destructive",
                duration: 3000,
              });
              return;
            }

            // Pre-validation: check basic structure
            if (typeof jsonObj !== "object" || !jsonObj) {
              toast({
                title: "Import Failed",
                description: "File appears to be empty or invalid",
                variant: "destructive",
                duration: 3000,
              });
              return;
            }

            const obj = jsonObj as Record<string, unknown>;
            if (!obj.version) {
              toast({
                title: "Import Failed",
                description: "This doesn't look like an exported habit tracker file.",
                variant: "destructive",
                duration: 3000,
              });
              return;
            }

            // Full validation
            const validation = validateExportImportJson(jsonObj);
            if (!validation.success) {
              // Create user-friendly error message from Zod errors
              let errorMsg = "The data file is corrupted or incompatible.";
              if (validation.errors && validation.errors.length > 0) {
                // Show first error field name only
                const firstError = validation.errors[0];
                const fieldMatch = firstError.match(/^([^\.\[]+)/);
                const field = fieldMatch ? fieldMatch[1] : "data";
                errorMsg = `Validation failed in ${field}. Please check the file and try again.`;
              }
              
              toast({
                title: "Import Failed",
                description: errorMsg,
                variant: "destructive",
                duration: 4000,
              });
              return;
            }

            await onImportData(jsonData);
          }
        } finally {
          hideLoading();
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  return {
    fileInputRef,
    isExporting,
    handleExportClick,
    handleImportClick,
    handleFileChange,
  };
}