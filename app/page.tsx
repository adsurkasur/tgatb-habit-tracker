"use client";

import { useState, useEffect } from "react";
import { HabitCard } from "@/components/habit-card";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { EditHabitDialog } from "@/components/edit-habit-dialog";
import { AddHabitCTA } from "@/components/add-habit-cta";
import { SettingsScreen } from "@/components/settings-screen";
import { ContentWrapper } from "@/components/content-wrapper";
import { WelcomeOverlay } from "@/components/welcome-overlay";
import { OfflineHeaderIndicator } from "@/components/offline-header-indicator";
import { useHabits } from "@/hooks/use-habits";
import { useMobileModalManager } from "@/hooks/use-mobile-back-navigation";
import { useWelcomeOverlay } from "@/hooks/use-welcome-overlay";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { HabitType, Habit } from "@shared/schema";

export default function Home() {
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showEditHabit, setShowEditHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);
  
  const { registerModal } = useMobileModalManager();
  const { toast } = useToast();
  const { isWelcomeVisible, closeWelcome, completeWelcome, resetWelcome } = useWelcomeOverlay();
  
  const {
    currentHabit,
    currentHabitIndex,
    navigationDirection,
    goodHabits,
    badHabits,
    settings,
    addHabit,
    updateHabit,
    deleteHabit,
    restoreHabit,
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
    registerModal('editHabit', {
      isOpen: showEditHabit,
      onClose: () => setShowEditHabit(false),
      priority: 2
    });
  }, [showEditHabit, registerModal]);

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

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowEditHabit(true);
  };

  const handleUpdateHabit = (id: string, name: string, type: HabitType) => {
    updateHabit(id, name, type);
    setShowEditHabit(false);
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habitId: string) => {
    // If we're deleting the current habit, navigate away first
    if (currentHabit && currentHabit.id === habitId) {
      if ((goodHabits.length + badHabits.length) > 1) {
        moveToNextHabit();
      }
    }
    
    const deletedHabit = deleteHabit(habitId);
    
    if (deletedHabit) {
      // Show toast with undo option
      toast({
        title: "Habit deleted!",
        description: "Your habit has been removed.",
        action: (
          <ToastAction
            altText="Undo delete"
            onClick={() => restoreHabit(deletedHabit)}
          >
            Undo
          </ToastAction>
        ),
        duration: 3000, // Standard duration for consistency
      });
    }
  };

  // Get current habit completion status
  const currentHabitStatus = currentHabit 
    ? getHabitCompletionStatus(currentHabit.id) 
    : null;

  // Demo habit for welcome tour step 4
  const demoHabit: Habit = {
    id: 'demo-habit',
    name: 'Drink 8 glasses of water',
    type: 'good',
    streak: 5,
    createdAt: new Date(),
    lastCompletedDate: undefined
  };

  // Show demo habit during welcome tour step 4 (habit-card step)
  const shouldShowDemoHabit = isWelcomeVisible && welcomeStep === 3 && (goodHabits.length + badHabits.length) === 0;
  const displayedHabit = shouldShowDemoHabit ? demoHabit : currentHabit;

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
    <ContentWrapper>
      <div className="min-h-screen bg-background text-foreground">
        {/* Top App Bar */}
        <header className="bg-header border-b border-border px-4 py-3 flex items-center justify-between surface-elevation-2 sticky top-0 z-40">
          <div data-tour="navigation">
            <NavigationDrawer
              goodHabits={goodHabits}
              badHabits={badHabits}
              onSettingsClick={() => setShowSettings(true)}
              onAddHabitClick={() => setShowAddHabit(true)}
              onHistoryClick={() => setShowHistory(true)}
              onDonateClick={() => setShowDonate(true)}
              onEditHabit={handleEditHabit}
              onDeleteHabit={handleDeleteHabit}
              onHelpClick={resetWelcome}
            />
          </div>
          <h1 className="text-xl font-semibold">The Good and The Bad</h1>
          <OfflineHeaderIndicator />
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 flex items-center justify-center min-h-[calc(100vh-80px)] main-content-container">
          <div data-tour="habit-area" className="w-full max-w-md mx-auto">
            {displayedHabit ? (
              <div className="relative w-full max-w-md mx-auto">
                {/* Navigation container for mobile - only show if not demo */}
                {!shouldShowDemoHabit && (
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
                )}

                {/* Previous button - Desktop - only show if not demo */}
                {!shouldShowDemoHabit && (goodHabits.length + badHabits.length) > 1 && (
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
                  habit={displayedHabit} 
                  onTrack={shouldShowDemoHabit ? () => {} : handleTrackHabit}
                  onUndo={shouldShowDemoHabit ? undefined : handleUndoHabit}
                  isCompletedToday={shouldShowDemoHabit ? false : currentHabitStatus?.isCompletedToday}
                  completedAt={shouldShowDemoHabit ? undefined : currentHabitStatus?.todayLog?.timestamp}
                  navigationDirection={shouldShowDemoHabit ? null : navigationDirection}
                  todayLog={shouldShowDemoHabit ? undefined : currentHabitStatus?.todayLog}
                />

                {/* Demo indicator - positioned below the habit card */}
                {shouldShowDemoHabit && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800 shadow-md">
                      Demo Habit
                    </Badge>
                  </div>
                )}

                {/* Next button - Desktop - only show if not demo */}
                {!shouldShowDemoHabit && (goodHabits.length + badHabits.length) > 1 && (
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

                {/* Habit counter indicator - text only, no dots - only show if not demo */}
                {!shouldShowDemoHabit && (goodHabits.length + badHabits.length) > 1 && (
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
              <div data-tour="add-habit-empty">
                <AddHabitCTA 
                  onAddHabit={() => setShowAddHabit(true)}
                  hasHabits={false}
                />
              </div>
            )}
          </div>
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

        <EditHabitDialog
          open={showEditHabit}
          onOpenChange={setShowEditHabit}
          onEditHabit={handleUpdateHabit}
          habit={editingHabit}
        />

        <SettingsScreen
          open={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onUpdateSettings={updateSettings}
          onExportData={exportData}
          onImportData={importData}
          onShowHelp={() => {
            setShowSettings(false);
            resetWelcome();
          }}
        />

        {/* Welcome Overlay */}
        <WelcomeOverlay
          isVisible={isWelcomeVisible}
          onClose={closeWelcome}
          onComplete={completeWelcome}
          hasHabits={(goodHabits.length + badHabits.length) > 0}
          onStepChange={setWelcomeStep}
        />
      </div>
    </ContentWrapper>
  );
}
