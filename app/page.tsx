"use client";

import { useState, useEffect } from "react";
import { HabitCard } from "@/components/habit-card";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { AddHabitCTA } from "@/components/add-habit-cta";
import { SettingsScreen } from "@/components/settings-screen";
import { useHabits } from "@/hooks/use-habits";
import { useMobileModalManager } from "@/hooks/use-mobile-back-navigation";
import { HabitType } from "@shared/schema";

export default function Home() {
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  
  const { registerModal } = useMobileModalManager();
  
  const {
    currentHabit,
    currentHabitIndex,
    navigationDirection,
    goodHabits,
    badHabits,
    settings,
    addHabit,
    trackHabit,
    undoHabitTracking,
    getHabitCompletionStatus,
    moveToNextHabit,
    moveToPreviousHabit,
    navigateToHabitIndex,
    updateSettings,
    exportData,
    importData,
  } = useHabits();

  // Register modals with the mobile modal manager
  useEffect(() => {
    registerModal('addHabit', {
      isOpen: showAddHabit,
      onClose: () => setShowAddHabit(false),
      priority: 2
    });
  }, [showAddHabit, registerModal]);

  useEffect(() => {
    registerModal('settings', {
      isOpen: showSettings,
      onClose: () => setShowSettings(false),
      priority: 1
    });
  }, [showSettings, registerModal]);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((goodHabits.length + badHabits.length) > 1) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          moveToPreviousHabit();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          moveToNextHabit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goodHabits.length, badHabits.length, moveToPreviousHabit, moveToNextHabit]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      touchEndX = event.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      if ((goodHabits.length + badHabits.length) > 1) {
        const swipeThreshold = 50; // minimum distance for swipe
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0) {
            // Swipe left - next habit
            moveToNextHabit();
          } else {
            // Swipe right - previous habit
            moveToPreviousHabit();
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goodHabits.length, badHabits.length, moveToPreviousHabit, moveToNextHabit]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top App Bar */}
      <header className="bg-header border-b border-border px-4 py-3 flex items-center justify-between surface-elevation-2 sticky top-0 z-40">
        <NavigationDrawer
          goodHabits={goodHabits}
          badHabits={badHabits}
          onSettingsClick={() => setShowSettings(true)}
          onAddHabitClick={() => setShowAddHabit(true)}
          onHistoryClick={() => setShowHistory(true)}
          onDonateClick={() => setShowDonate(true)}
        />
        <h1 className="text-xl font-semibold">The Good and The Bad</h1>
        <div className="w-10" /> {/* Spacer for balance */}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex items-center justify-center min-h-[calc(100vh-80px)] main-content-container">
        {currentHabit ? (
          <div className="relative w-full max-w-md mx-auto">
            {/* Navigation container for mobile */}
            <div className="hidden max-sm:flex nav-container-mobile mb-4">
              {(goodHabits.length + badHabits.length) > 1 && (
                <>
                  <button
                    onClick={moveToPreviousHabit}
                    className="nav-button w-10 h-10 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                    aria-label="Previous habit"
                  >
                    <svg className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={moveToNextHabit}
                    className="nav-button w-10 h-10 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                    aria-label="Next habit"
                  >
                    <svg className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Previous button - Desktop */}
            {(goodHabits.length + badHabits.length) > 1 && (
              <button
                onClick={moveToPreviousHabit}
                className="max-sm:hidden absolute left-[-60px] top-1/2 transform -translate-y-1/2 z-10 nav-button w-12 h-12 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Previous habit"
              >
                <svg className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <HabitCard 
              habit={currentHabit} 
              onTrack={handleTrackHabit}
              onUndo={handleUndoHabit}
              isCompletedToday={currentHabitStatus?.isCompletedToday}
              completedAt={currentHabitStatus?.todayLog?.timestamp}
              navigationDirection={navigationDirection}
            />

            {/* Next button - Desktop */}
            {(goodHabits.length + badHabits.length) > 1 && (
              <button
                onClick={moveToNextHabit}
                className="max-sm:hidden absolute right-[-60px] top-1/2 transform -translate-y-1/2 z-10 nav-button w-12 h-12 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Next habit"
              >
                <svg className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Habit counter indicator - text only, no dots */}
            {(goodHabits.length + badHabits.length) > 1 && (
              <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2">
                <div className="text-xs text-muted-foreground text-center">
                  {currentHabitIndex + 1} of {goodHabits.length + badHabits.length} habits
                  <div className="text-[10px] opacity-60 mt-1">
                    Use ← → keys or swipe to navigate
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <AddHabitCTA 
            onAddHabit={() => setShowAddHabit(true)}
            hasHabits={false}
          />
        )}
      </main>

      {/* Floating Action Button for when habits exist */}
      {currentHabit && (
        <AddHabitCTA 
          onAddHabit={() => setShowAddHabit(true)}
          hasHabits={true}
        />
      )}

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
