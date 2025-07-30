"use client";

import { useState } from "react";
import { HabitCard } from "@/components/habit-card";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { SettingsScreen } from "@/components/settings-screen";
import { useHabits } from "@/hooks/use-habits";
import { HabitType } from "@shared/schema";

export default function Home() {
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    currentHabit,
    goodHabits,
    badHabits,
    settings,
    addHabit,
    trackHabit,
    undoHabitTracking,
    getHabitCompletionStatus,
    updateSettings,
    exportData,
    importData,
  } = useHabits();

  const handleTrackHabit = (completed: boolean) => {
    if (currentHabit) {
      trackHabit(currentHabit.id, completed);
    }
  };

  const handleUndoHabit = () => {
    if (currentHabit) {
      undoHabitTracking(currentHabit.id);
    }
  };

  const handleAddHabit = (name: string, type: HabitType) => {
    addHabit(name, type);
  };

  // Get current habit completion status
  const currentHabitStatus = currentHabit 
    ? getHabitCompletionStatus(currentHabit.id) 
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top App Bar */}
      <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between surface-elevation-2 sticky top-0 z-40">
        <NavigationDrawer
          goodHabits={goodHabits}
          badHabits={badHabits}
          onSettingsClick={() => setShowSettings(true)}
          onAddHabitClick={() => setShowAddHabit(true)}
        />
        <h1 className="text-xl font-semibold">The Good and The Bad</h1>
        <div className="w-10" /> {/* Spacer for balance */}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <HabitCard 
          habit={currentHabit} 
          onTrack={handleTrackHabit}
          onUndo={handleUndoHabit}
          isCompletedToday={currentHabitStatus?.isCompletedToday}
          completedAt={currentHabitStatus?.todayLog?.timestamp}
        />
      </main>

      {/* Dialogs */}
      <AddHabitDialog
        open={showAddHabit}
        onOpenChange={setShowAddHabit}
        onAddHabit={handleAddHabit}
      />

      <SettingsScreen
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onExportData={exportData}
        onImportData={importData}
      />
    </div>
  );
}
