import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { 
  Menu, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  History, 
  Settings, 
  Heart,
  Plus,
  Flame,
  Edit,
  Trash2
} from "lucide-react";
import React, { useState, useCallback } from "react";
import { Habit } from "@shared/schema";
import { DonationDialog } from "./donation-dialog";
import { HistoryDialog } from "./history-dialog";
import { useMobileBackNavigation } from "@/hooks/use-mobile-back-navigation";

interface NavigationDrawerProps {
  goodHabits: Habit[];
  badHabits: Habit[];
  onSettingsClick: () => void;
  onAddHabitClick: () => void;
  onHistoryClick?: () => void;
  onDonateClick?: () => void;
  onEditHabit?: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
}

// Memoized habit item component to prevent unnecessary re-renders
const HabitItem = React.memo<{
  habit: Habit;
  index: number;
  isOpen: boolean;
  type: 'good' | 'bad';
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}>(({ habit, index, isOpen, type, onEdit, onDelete }) => {
  const colorClasses = type === 'good' 
    ? "bg-green-500/10 text-green-600 border-green-500/20"
    : "bg-red-500/10 text-red-600 border-red-500/20";
    
  return (
    <div 
      className="flex items-center justify-between p-3 bg-muted material-radius collapsible-item state-layer-hover"
      style={{
        // Only animate on opening, not closing to reduce lag
        animationName: isOpen ? 'fadeInSlideUp' : 'none',
        animationDuration: isOpen ? '0.25s' : '0s',
        animationTimingFunction: isOpen ? 'ease-out' : 'linear',
        animationDelay: isOpen ? `${index * 30}ms` : '0ms',
        animationFillMode: 'both'
      }}
    >
      <div className="flex items-center justify-between flex-1">
        <span className="text-foreground text-sm">{habit.name}</span>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className={colorClasses}>
            <Flame className="w-3 h-3 mr-1" />
            {habit.streak} days
          </Badge>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:text-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(habit);
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(habit.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

HabitItem.displayName = "HabitItem";

const NavigationDrawer = React.memo<NavigationDrawerProps>(({ 
  goodHabits, 
  badHabits, 
  onSettingsClick, 
  onAddHabitClick,
  onHistoryClick,
  onDonateClick,
  onEditHabit,
  onDeleteHabit
}) => {
  const [open, setOpen] = useState(false);
  const [goodHabitsOpen, setGoodHabitsOpen] = useState(false);
  const [badHabitsOpen, setBadHabitsOpen] = useState(false);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  const allHabits = [...goodHabits, ...badHabits];

  // Memoize callbacks to prevent child re-renders
  const handleSettingsClick = useCallback(() => {
    onSettingsClick();
    setOpen(false);
  }, [onSettingsClick]);

  const handleAddHabitClick = useCallback(() => {
    onAddHabitClick();
    setOpen(false);
  }, [onAddHabitClick]);

  const handleHistoryClick = useCallback(() => {
    setIsHistoryDialogOpen(true);
    setOpen(false);
  }, []);

  const handleDonateClick = useCallback(() => {
    setIsDonationDialogOpen(true);
    setOpen(false);
  }, []);

  // Handle mobile back navigation for the navigation drawer
  useMobileBackNavigation({
    onBackPressed: () => {
      setOpen(false);
    },
    isActive: open
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="state-layer-hover">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-muted">
        <VisuallyHidden.Root>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Access your habit tracking dashboard and settings</SheetDescription>
        </VisuallyHidden.Root>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border bg-card">
            <h2 className="text-2xl font-bold text-foreground">Habit Tracker</h2>
            <p className="text-sm text-muted-foreground mt-1">Track your daily progress</p>
          </div>
          
          {/* Content - Scrollable Habits Area */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Good Habits Accordion */}
            <Collapsible open={goodHabitsOpen} onOpenChange={setGoodHabitsOpen}>
              <div className="bg-card material-radius-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full p-4 justify-between h-auto no-hover accordion-trigger"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Good Habits</span>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 ml-2 badge-count">
                        {goodHabits.length}
                      </Badge>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5",
                      // Faster closing, slower opening for better UX
                      goodHabitsOpen 
                        ? "transition-transform duration-250 ease-[cubic-bezier(0.04,0.62,0.23,0.98)] rotate-180"
                        : "transition-transform duration-150 ease-[cubic-bezier(0.3,0,0.8,0.15)]"
                    )} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 space-y-2">
                  {goodHabits.length === 0 ? (
                    <div className="p-3 bg-muted material-radius text-center">
                      <span className="text-muted-foreground text-sm">No good habits yet</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {goodHabits.map((habit, index) => (
                        <HabitItem
                          key={habit.id}
                          habit={habit}
                          index={index}
                          isOpen={goodHabitsOpen}
                          type="good"
                          onEdit={onEditHabit}
                          onDelete={onDeleteHabit}
                        />
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Bad Habits Accordion */}
            <Collapsible open={badHabitsOpen} onOpenChange={setBadHabitsOpen}>
              <div className="bg-card material-radius-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full p-4 justify-between h-auto no-hover accordion-trigger"
                  >
                    <div className="flex items-center space-x-3">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Bad Habits</span>
                      <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20 ml-2 badge-count">
                        {badHabits.length}
                      </Badge>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5",
                      // Faster closing, slower opening for better UX
                      badHabitsOpen 
                        ? "transition-transform duration-250 ease-[cubic-bezier(0.04,0.62,0.23,0.98)] rotate-180"
                        : "transition-transform duration-150 ease-[cubic-bezier(0.3,0,0.8,0.15)]"
                    )} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 space-y-2">
                  {badHabits.length === 0 ? (
                    <div className="p-3 bg-muted material-radius text-center">
                      <span className="text-muted-foreground text-sm">No bad habits tracked</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {badHabits.map((habit, index) => (
                        <HabitItem
                          key={habit.id}
                          habit={habit}
                          index={index}
                          isOpen={badHabitsOpen}
                          type="bad"
                          onEdit={onEditHabit}
                          onDelete={onDeleteHabit}
                        />
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* Bottom Navigation - Fixed at bottom */}
          <div className="border-t border-border bg-card">
            <div className="p-4 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto state-layer-hover"
                onClick={handleHistoryClick}
              >
                <History className="w-5 h-5 mr-3" />
                <span>History</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto state-layer-hover"
                onClick={handleSettingsClick}
              >
                <Settings className="w-5 h-5 mr-3" />
                <span>Settings</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto state-layer-hover"
                onClick={handleDonateClick}
              >
                <Heart className="w-5 h-5 mr-3" />
                <span>Support Me</span>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
      
      {/* Donation Dialog */}
      <DonationDialog 
        open={isDonationDialogOpen} 
        onOpenChange={setIsDonationDialogOpen} 
      />
      
      {/* History Dialog */}
      <HistoryDialog 
        open={isHistoryDialogOpen} 
        onOpenChange={setIsHistoryDialogOpen}
        habits={allHabits}
      />
    </Sheet>
  );
});

NavigationDrawer.displayName = "NavigationDrawer";

export { NavigationDrawer };
