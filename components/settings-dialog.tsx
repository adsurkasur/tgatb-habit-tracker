import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CloseButton } from '@/components/ui/close-button';
import { UserSettings } from '@shared/schema';
import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { MotivatorSettings } from '@/components/settings/motivator-settings';
import { HabitManagementSettings } from '@/components/settings/habit-management-settings';
import { AccountDataSettings } from '@/components/settings/account-data-settings';
import { AppDeviceSettings } from '@/components/settings/app-device-settings';
import { HelpSupportSettings } from '@/components/settings/help-support-settings';

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onExportData: () => Promise<string>;
  onImportData: (jsonData: string) => void;
  onShowHelp?: () => void;
  onDeleteAllHabits?: () => Promise<void>;
};

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onShowHelp,
  onDeleteAllHabits
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col [&>button]:hidden">
        <DialogHeader className="shrink-0 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
            <CloseButton onClick={() => onOpenChange(false)} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AppearanceSettings
              settings={settings}
              onUpdateSettings={onUpdateSettings}
            />

            <MotivatorSettings
              settings={settings}
              onUpdateSettings={onUpdateSettings}
            />

            <HabitManagementSettings
              onDeleteAllHabits={onDeleteAllHabits}
            />

            <AccountDataSettings
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              onExportData={onExportData}
              onImportData={onImportData}
            />

            <AppDeviceSettings
              settings={settings}
              onUpdateSettings={onUpdateSettings}
            />

            <HelpSupportSettings
              onShowHelp={onShowHelp}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}