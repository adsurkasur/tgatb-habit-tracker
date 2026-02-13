// System bars handled centrally by SystemBarsManager
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTheme } from "@/components/theme-provider";
import { HabitCard } from "@/components/habit-card";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { EditHabitDialog } from "@/components/edit-habit-dialog";
import { DonationDialog } from "@/components/donation-dialog";
import { HistoryDialog } from "@/components/history-dialog";
import { AddEntryDialog } from "@/components/add-entry-dialog";
import { EditEntryDialog } from "@/components/edit-entry-dialog";
import { AboutDialog } from "@/components/about-dialog";
import { AddHabitCTA } from "@/components/add-habit-cta";
import { ResponsiveSettings } from "@/components/responsive-settings";
import { ContentWrapper } from "@/components/content-wrapper";
import { WelcomeOverlay } from "@/components/welcome-overlay";
import { OfflineHeaderIndicator } from "@/components/offline-header-indicator";
import { useHabits } from "@/hooks/use-habits";
import { hasOpenModals, closeTopModal } from "@/hooks/use-mobile-back-navigation";
import { useWelcomeOverlay } from "@/hooks/use-welcome-overlay";
import { useToast } from "@/hooks/use-toast";
import { useSystemBarsUnified } from "@/hooks/use-system-bars-unified";
import { ToastAction } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { HabitType, Habit } from "@shared/schema";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export default function Home() {
  // Use unified exportData and importData from useHabits
  const {
    exportData,
    importData,
    habits,
    currentHabit,
    currentHabitIndex,
    navigationEvent,
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
    addOrUpdateLog,
    removeLog,
  } = useHabits();

  // Theme context for instant dark mode update
  const { setIsDark } = useTheme();
  // Open Add Habit dialog if ?action=add-habit is present in the URL (for PWA shortcut)
  const [showAddHabit, setShowAddHabit] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('action') === 'add-habit';
  });
  const [showEditHabit, setShowEditHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hoisted AddEntry / EditEntry dialog state (siblings of HistoryDialog, not children)
  // This prevents vaul keyboard handlers from cross-contaminating the parent drawer.
  const [historyAddEntryOpen, setHistoryAddEntryOpen] = useState(false);
  const [historyAddEntryDate, setHistoryAddEntryDate] = useState("");
  const [historyEditEntryOpen, setHistoryEditEntryOpen] = useState(false);
  const [historyEditHabit, setHistoryEditHabit] = useState<Habit | null>(null);
  const [historyEditDate, setHistoryEditDate] = useState("");
  const [historyEditCompleted, setHistoryEditCompleted] = useState<boolean | null>(null);
  
  const { toast } = useToast();
  
  const { isWelcomeVisible, closeWelcome, completeWelcome, resetWelcome } = useWelcomeOverlay();

  // Navigation bar handling centralized in Capacitor layer
  
  // ...existing code...
  // Handler for jump-to navigation from drawer (must be after useHabits)
  const handleHabitSelect = useCallback((habit: Habit) => {
    const index = habits.findIndex(h => h.id === habit.id);
    if (index !== -1) {
      navigateToHabitIndex(index);
      setDrawerOpen(false); // Close drawer after selection
    }
  }, [habits, navigateToHabitIndex]);

  // MAJOR FIX: Apply unified system bar theming with fullscreen support
  useSystemBarsUnified(settings.fullscreenMode);

  // Update theme immediately when settings.darkMode changes
  useEffect(() => {
    setIsDark(settings.darkMode);
  }, [settings.darkMode, setIsDark]);

  // Back again to exit logic (Android only) - MOVED after settings are available
  const lastBackPressRef = useRef<number>(0);
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;
    const handler = App.addListener('backButton', () => {
      const now = Date.now();
      
      
      if (hasOpenModals()) {
        // Close the topmost modal via manager
        closeTopModal();
        return;
      }
      
      // FIXED: Ensure back-to-exit works in both normal and fullscreen mode
      if (now - lastBackPressRef.current < 2000) {
        App.exitApp();
      } else {
        lastBackPressRef.current = now;
  toast({ title: "Press back again to exit", duration: 3000 });
      }
    });
    return () => { handler.then(h => h.remove()); };
  }, [toast, settings.fullscreenMode]);

  const handleTrackHabit = useCallback((completed: boolean) => {
    if (currentHabit) {
      trackHabit(currentHabit.id, completed);
    }
  }, [currentHabit, trackHabit]);

  const demoTrackHandler = useCallback(() => {}, []);
  const handleUndoHabit = useCallback(() => {
    if (currentHabit) {
      undoHabitTracking(currentHabit.id);
    }
  }, [currentHabit, undoHabitTracking]);

  // Ref to track last added habit
  const lastAddedHabitRef = useRef<{ name: string; type: HabitType } | null>(null);

  const handleAddHabit = (name: string, type: HabitType) => {
    lastAddedHabitRef.current = { name, type };
    addHabit({ name, type });
    setShowAddHabit(false);
  };

  useEffect(() => {
    if (lastAddedHabitRef.current) {
      const { name, type } = lastAddedHabitRef.current;
      const newIndex = habits.findIndex(h => h.name === name && h.type === type);
      if (newIndex !== -1) {
        navigateToHabitIndex(newIndex);
        lastAddedHabitRef.current = null;
      }
    }
  }, [habits, navigateToHabitIndex]);

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowEditHabit(true);
  };

  const handleUpdateHabit = (id: string, name: string, type: HabitType) => {
  updateHabit({ id, name, type });
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
    
  const deletedHabit = deleteHabit({ id: habitId });
    
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
  const currentHabitStatus = useMemo(() => (
    currentHabit ? getHabitCompletionStatus(currentHabit.id) : null
  ), [currentHabit, getHabitCompletionStatus]);

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
  const allHabits = [...goodHabits, ...badHabits];

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

  // Touch/swipe navigation (main area only)
  const mainRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartTarget: EventTarget | null = null;

    function isToastTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(
        target.closest('.radix-toast') ||
        target.closest('[data-radix-toast]') ||
        target.closest('.ToastViewport') ||
        target.closest('.Toast')
      );
    }

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX;
      touchStartTarget = event.target;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      touchEndX = event.changedTouches[0].screenX;
      if (isToastTarget(touchStartTarget)) return;
      handleSwipe();
    };

    const handleSwipe = () => {
      if ((goodHabits.length + badHabits.length) > 1) {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0) {
            moveToNextHabit();
          } else {
            moveToPreviousHabit();
          }
        }
      }
    };

    main.addEventListener('touchstart', handleTouchStart);
    main.addEventListener('touchend', handleTouchEnd);
    return () => {
      main.removeEventListener('touchstart', handleTouchStart);
      main.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goodHabits.length, badHabits.length, moveToPreviousHabit, moveToNextHabit]);

  return (
    <>
      <ContentWrapper>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          {/* Top App Bar - always visible, not part of scrollable main */}
          <header className="bg-header border-b border-border px-4 py-3 flex items-center justify-between surface-elevation-2 sticky top-0 z-40">
            <div data-tour="navigation">
              <NavigationDrawer
                goodHabits={goodHabits}
                badHabits={badHabits}
                onSettingsClick={() => setShowSettings(true)}
                onHistoryClick={() => setShowHistory(true)}
                onDonateClick={() => setShowDonate(true)}
                onAboutClick={() => setShowAbout(true)}
                onEditHabit={handleEditHabit}
                onDeleteHabit={handleDeleteHabit}
                onHelpClick={resetWelcome}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                onHabitSelect={handleHabitSelect}
              />
            </div>
            <h1 className="text-xl font-semibold">The Good and The Bad</h1>
            <OfflineHeaderIndicator />
          </header>

          {/* Main Content - scrollable area below header */}
          <main ref={mainRef} className="flex-1 overflow-y-auto p-6 flex items-center justify-center main-content-container">
            <div data-tour="habit-area" className="w-full max-w-md mx-auto">
              {displayedHabit ? (
                <>
                  <div className="relative w-full max-w-md mx-auto">

                  {/* Previous button - Desktop - only show if not demo */}
                  {!shouldShowDemoHabit && (goodHabits.length + badHabits.length) > 1 && (
                    <button
                      onClick={moveToPreviousHabit}
                      className="max-sm:hidden absolute left-0 top-1/2 -translate-x-15 -translate-y-1/2 z-10 nav-button w-12 h-12 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                      aria-label="Previous habit"
                    >
                      <svg className="w-6 h-6 text-primary group-hover:text-primary/80 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  <HabitCard 
                    habit={displayedHabit} 
                    onTrack={shouldShowDemoHabit ? demoTrackHandler : handleTrackHabit}
                    onUndo={shouldShowDemoHabit ? undefined : handleUndoHabit}
                    isCompletedToday={shouldShowDemoHabit ? false : currentHabitStatus?.isCompletedToday}
                    completedAt={shouldShowDemoHabit ? undefined : currentHabitStatus?.todayLog?.timestamp}
                    navigationEvent={shouldShowDemoHabit ? null : navigationEvent}
                    todayLog={shouldShowDemoHabit ? undefined : currentHabitStatus?.todayLog}
                  />

                  {/* Next button - Desktop - only show if not demo */}
                  {!shouldShowDemoHabit && (goodHabits.length + badHabits.length) > 1 && (
                    <button
                      onClick={moveToNextHabit}
                      className="max-sm:hidden absolute right-0 top-1/2 translate-x-15 -translate-y-1/2 z-10 nav-button w-12 h-12 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                      aria-label="Next habit"
                    >
                      <svg className="w-6 h-6 text-primary group-hover:text-primary/80 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                </div>

                {/* Habit counter indicator - positioned outside the habit card container to avoid clipping */}
                {!shouldShowDemoHabit && (goodHabits.length + badHabits.length) > 1 && (
                  <>
                    <div className="flex justify-center mt-4">
                      <div className="text-xs text-muted-foreground text-center">
                        {currentHabitIndex + 1} of {goodHabits.length + badHabits.length} habits
                        <div className="text-[10px] opacity-60 mt-1">
                          Use ← → keys, navigation buttons, or swipe to navigate
                        </div>
                      </div>
                    </div>
                    {/* Mobile navigation buttons below legend */}
                    <div className="max-sm:flex hidden justify-center mt-4 nav-container-mobile">
                      <button
                        onClick={moveToPreviousHabit}
                        className="nav-button w-10 h-10 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group mx-2 cursor-pointer"
                        aria-label="Previous habit"
                      >
                        <svg className="w-5 h-5 text-primary group-hover:text-primary/80 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={moveToNextHabit}
                        className="nav-button w-10 h-10 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group mx-2 cursor-pointer"
                        aria-label="Next habit"
                      >
                        <svg className="w-5 h-5 text-primary group-hover:text-primary/80 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}

                {/* Demo indicator - positioned outside the habit card container */}
                {shouldShowDemoHabit && (
                  <div className="flex justify-center mt-4">
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800 shadow-md">
                      Demo Habit
                    </Badge>
                  </div>
                )}
              </>
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

        {/* Centralized dialogs moved from NavigationDrawer */}
        <DonationDialog 
          open={showDonate}
          onOpenChange={setShowDonate}
        />

        <HistoryDialog 
          open={showHistory}
          onOpenChange={setShowHistory}
          habits={allHabits}
          removeLog={removeLog}
          onRequestAddEntry={(date) => {
            setHistoryAddEntryDate(date);
            setHistoryAddEntryOpen(true);
          }}
          onRequestEditEntry={(habit, date, completed) => {
            setHistoryEditHabit(habit);
            setHistoryEditDate(date);
            setHistoryEditCompleted(completed);
            setHistoryEditEntryOpen(true);
          }}
        />

        {/* AddEntryDialog — sibling of HistoryDialog so keyboard events don't affect parent drawer */}
        <AddEntryDialog
          open={historyAddEntryOpen}
          onOpenChange={setHistoryAddEntryOpen}
          habits={allHabits}
          date={historyAddEntryDate}
          addOrUpdateLog={addOrUpdateLog}
          addHabit={addHabit}
        />

        {/* EditEntryDialog — sibling of HistoryDialog for same reason */}
        {historyEditHabit && (
          <EditEntryDialog
            open={historyEditEntryOpen}
            onOpenChange={setHistoryEditEntryOpen}
            habit={historyEditHabit}
            date={historyEditDate}
            completed={historyEditCompleted}
            onSave={(completed) => {
              addOrUpdateLog(historyEditHabit.id, historyEditDate, completed);
              setHistoryEditEntryOpen(false);
              setHistoryEditHabit(null);
              setHistoryEditCompleted(null);
            }}
          />
        )}

        <AboutDialog 
          open={showAbout}
          onOpenChange={setShowAbout}
        />

        <ResponsiveSettings
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
          onDeleteAllHabits={async () => {
            // Delete all habits logic
            for (const habit of allHabits) {
              await deleteHabit({ id: habit.id });
            }
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
    </>
  );
}
