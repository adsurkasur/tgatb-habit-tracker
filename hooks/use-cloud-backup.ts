import { Capacitor } from '@capacitor/core';

import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useLoading } from "@/hooks/use-loading";

export function useCloudBackup() {
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const { show: showLoading, hide: hideLoading } = useLoading();
  const isCapacitorApp = Capacitor.isNativePlatform();

  const handleBackup = async () => {
    if (!isOnline) {
      return toast({
        title: "You're offline",
        description: "You can't export to the cloud while offline.",
        variant: "destructive"
      });
    }

    // Show 'Exporting to Cloud...' toast
    toast({
      title: "Exporting to Cloud...",
      description: "Your data is being exported to Google Drive. Please wait.",
      duration: 3000,
    });

    let accessToken: string | null = null;
    let result: unknown = null;

    try {
      // Get full export bundle
      const { HabitStorage } = await import("@/lib/habit-storage");
      const exportJson = await HabitStorage.exportData();
      console.debug('[useCloudBackup] Exporting full bundle:', exportJson);

      if (typeof window !== 'undefined' && !Capacitor.isNativePlatform()) {
        // Web platform
        accessToken = localStorage.getItem('googleAccessToken');
        if (!accessToken) {
          toast({
            title: "Not Signed In",
            description: "You must be signed in to export to Google Drive.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }

        const { uploadToDrive } = await import("../web/drive-sync");
        try {
          result = await uploadToDrive(exportJson, accessToken);
          console.debug('[useCloudBackup] Web Drive backup result:', result);
          toast({
            title: "Backup Successful",
            description: "Your data has been backed up to Google Drive (web).",
            duration: 3000,
          });
        } catch (err: unknown) {
          // If error is due to invalid/expired token, show error toast and instruct user to log in via login/logout button
          let message = "Drive upload failed.";
          if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
            message = (err as { message: string }).message;
          }
          toast({
            title: "Backup Error",
            description: message + " Please log in again using the Login button.",
            variant: "destructive",
            duration: 3000,
          });
        }
      } else {
        // Mobile (Capacitor)
        const { Preferences } = await import('@capacitor/preferences');
        accessToken = (await Preferences.get({ key: 'googleAccessToken' })).value;
        if (!accessToken) {
          toast({
            title: "Not Signed In",
            description: "You must be signed in to export to Google Drive.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }

        const { uploadDataToDrive } = await import("@/mobile/drive-sync");
        try {
          result = await uploadDataToDrive(exportJson, accessToken);
          console.debug('[useCloudBackup] Mobile Drive backup result:', result);
          if (result) {
            toast({
              title: "Backup Successful",
              description: "Your data has been backed up to Google Drive (mobile).",
              duration: 3000,
            });
          } else {
            toast({
              title: "Backup Failed",
              description: "Could not upload data to Drive.",
              variant: "destructive",
              duration: 3000,
            });
          }
        } catch (err: unknown) {
          let message = "Drive upload failed.";
          if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
            message = (err as { message: string }).message;
          }
          toast({
            title: "Backup Error",
            description: message + " Please log in again using the Login button.",
            variant: "destructive",
            duration: 3000,
          });
        }
      }
    } catch (err) {
      toast({
        title: "Backup Error",
        description: "An unexpected error occurred during backup.",
        variant: "destructive",
        duration: 3000,
      });
      console.error('[useCloudBackup] Drive backup error:', err instanceof Error ? err.stack : err);
    }
  };


  const handleRestore = async (onImportData: (jsonData: string) => void) => {
    if (!isOnline) {
      return toast({
        title: "You're offline",
        description: "You can't import from the cloud while offline.",
        variant: "destructive"
      });
    }

    let accessToken: string | null = null;
    let cloudJson: string = "";
    let cloudBundle: any = null;

    // Show loading overlay after precondition checks
    showLoading();
    try {
      // Show 'Importing from Cloud...' toast
      toast({
        title: "Importing from Cloud...",
        description: "Your data is being imported from the cloud. Please wait.",
        duration: 3000,
      });

      if (typeof window !== 'undefined' && !isCapacitorApp) {
        // Web platform
        accessToken = localStorage.getItem('googleAccessToken');
        if (!accessToken) {
          toast({
            title: "Not Signed In",
            description: "You must be signed in to import from Google Drive.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }

        try {
          // List files named 'habits-backup.json' in Drive
          const listRes = await fetch('https://www.googleapis.com/drive/v3/files?q=name%3D%27habits-backup.json%27&spaces=drive&fields=files(id%2Cname%2CmodifiedTime)&orderBy=modifiedTime desc', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          const listJson = await listRes.json();
          const files = listJson.files || [];
          console.debug('[useCloudBackup] Web Drive file list:', files);

          if (!files.length) throw new Error("No backup file found in Drive");

          const fileId = files[0].id;
          // Download backup from Drive
          const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          cloudJson = await res.text();
          cloudBundle = JSON.parse(cloudJson);
          console.debug('[useCloudBackup] Web Drive raw backup bundle:', cloudBundle);
        } catch (err: unknown) {
          // If error is due to invalid/expired token, show error toast and instruct user to log in via login/logout button
          let message = "Drive import failed.";
          if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
            message = (err as { message: string }).message;
          }
          toast({
            title: "Import Error",
            description: message + " Please log in again using the Login button.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }
      } else {
        // Mobile (Capacitor)
        const { Preferences } = await import('@capacitor/preferences');
        accessToken = (await Preferences.get({ key: 'googleAccessToken' })).value;
        if (!accessToken) {
          toast({
            title: "Not Signed In",
            description: "You must be signed in to import from Google Drive.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }

        try {
          const { downloadLatestHabitsFromDrive } = await import("@/mobile/drive-sync");
          // Download latest backup (returns full bundle)
          try {
            cloudBundle = await downloadLatestHabitsFromDrive(accessToken);
          } catch (err: unknown) {
            // If mobile drive-sync threw a 401 unauthorized, ensure we show a clear message
            if (err instanceof Error && err.message.includes('Drive Unauthorized')) {
              toast({
                title: "Import Error",
                description: "Drive authorization expired or invalid on this device. Please sign in again.",
                variant: "destructive",
                duration: 4000,
              });
              return;
            }
            throw err;
          }
          cloudJson = JSON.stringify(cloudBundle);
          console.debug('[useCloudBackup] Mobile Drive raw backup bundle:', cloudBundle);
        } catch (err: unknown) {
          let message = "Drive import failed.";
          if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
            message = (err as { message: string }).message;
          }
          toast({
            title: "Import Error",
            description: message + " Please log in again using the Login button.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }
      }

      if (cloudJson && cloudJson.length > 0) {
        // Validate bundle before import
        const { validateExportImportJson } = await import("@/lib/validate-export-import");
        const validation = validateExportImportJson(cloudBundle);
        if (!validation.success) {
          toast({
            title: "Import Failed",
            description: `Imported data is invalid: ${validation.errors?.join(", ")}`,
            variant: "destructive",
            duration: 4000,
          });
          return;
        }

        onImportData(JSON.stringify(cloudBundle));
        toast({
          title: "Import Successful",
          description: "Your habits have been imported from Google Drive.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Import Failed",
          description: "No habits found in cloud.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (err) {
      let message = "An unexpected error occurred during cloud import.";
      if (err instanceof Error) {
        message = err.message;
      }
      toast({
        title: "Import Error",
        description: message,
        variant: "destructive",
        duration: 3000,
      });
      console.error('[useCloudBackup] Cloud import error:', err instanceof Error ? err.stack : err);
    } finally {
      hideLoading();
    }
  };

  return {
    handleBackup,
    handleRestore,
  };
}