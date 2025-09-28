import { UserSettings } from '@shared/schema';
import { useIsMobile } from '@/hooks/use-mobile';
import { SettingsScreen } from '@/components/settings-screen';
import { SettingsDialog } from '@/components/settings-dialog';

type ResponsiveSettingsProps = {
  open: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onExportData: () => Promise<string>;
  onImportData: (jsonData: string) => void;
  onShowHelp?: () => void;
  onDeleteAllHabits?: () => Promise<void>;
};

export function ResponsiveSettings({
  open,
  onClose,
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onShowHelp,
  onDeleteAllHabits
}: ResponsiveSettingsProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile: Use full-screen slide-in SettingsScreen
    return (
      <SettingsScreen
        open={open}
        onClose={onClose}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onExportData={onExportData}
        onImportData={onImportData}
        onShowHelp={onShowHelp}
        onDeleteAllHabits={onDeleteAllHabits}
      />
    );
  }

  // Desktop: Use modal SettingsDialog
  return (
    <SettingsDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      settings={settings}
      onUpdateSettings={onUpdateSettings}
      onExportData={onExportData}
      onImportData={onImportData}
      onShowHelp={onShowHelp}
      onDeleteAllHabits={onDeleteAllHabits}
    />
  );
}