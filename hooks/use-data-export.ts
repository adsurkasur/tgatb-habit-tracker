import { useRef, useState } from "react";
import { debounce } from "@/lib/utils/debounce";
import { validateExportImportJson } from "@/lib/validate-export-import";
import { exportDataPlatform } from "@/lib/platform-export";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/hooks/use-loading";

export function useDataExport(onExportData: () => Promise<string>, onImportData: (jsonData: string) => void) {
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
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          if (jsonData) {
            let jsonObj: unknown;
            try {
              jsonObj = JSON.parse(jsonData);
            } catch {
              toast({
                title: "Import Failed",
                description: "Imported file is not valid JSON.",
                variant: "destructive",
                duration: 3000,
              });
              return;
            }

            const validation = validateExportImportJson(jsonObj);
            if (!validation.success) {
              toast({
                title: "Import Failed",
                description: `Imported data is invalid: ${validation.errors?.join(", ")}`,
                variant: "destructive",
                duration: 4000,
              });
              return;
            }

            onImportData(jsonData);
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