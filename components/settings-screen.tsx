import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { UserSettings } from '@shared/schema';
import { useMobileBackNavigation } from '@/hooks/use-mobile-back-navigation';
import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { AccountDataSettings } from '@/components/settings/account-data-settings';
import { MotivatorSettings } from '@/components/settings/motivator-settings';
import { HabitManagementSettings } from '@/components/settings/habit-management-settings';
import { HelpSupportSettings } from '@/components/settings/help-support-settings';

type SettingsScreenProps = {
  open: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onExportData: () => Promise<string>;
  onImportData: (jsonData: string) => void;
  onShowHelp?: () => void;
  onDeleteAllHabits?: () => Promise<void>;
};

export function SettingsScreen({
  open,
  onClose,
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onShowHelp,
  onDeleteAllHabits
}: SettingsScreenProps) {
  // Handle mobile back navigation
  useMobileBackNavigation({
    onBackPressed: () => {
      onClose();
    },
    isActive: open
  });

  return (
    <div
      className={`fixed inset-0 bg-background z-50 transform transition-transform duration-300 theme-transition flex flex-col ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <header className='bg-header border-b border-border px-4 py-3 flex items-center space-x-4 surface-elevation-2 flex-shrink-0'>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='state-layer-hover'
        >
          <ArrowLeft className='w-6 h-6' />
        </Button>
        <h1 className='text-xl font-semibold'>Settings</h1>
      </header>

      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
        <AppearanceSettings
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />

        <AccountDataSettings
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onExportData={onExportData}
          onImportData={onImportData}
        />

        <MotivatorSettings
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />

        <HabitManagementSettings
          onDeleteAllHabits={onDeleteAllHabits}
        />

        <HelpSupportSettings
          onShowHelp={onShowHelp}
        />
      </div>
    </div>
  );
}
