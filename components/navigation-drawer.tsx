import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
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
  Flame,
  Edit,
  Trash2,
  HelpCircle,
  Info,
  Search
} from "lucide-react";
import React, { useState, useCallback, useMemo } from "react";
import { CloseButton } from "@/components/ui/close-button";
import { Habit } from "@shared/schema";
import { useMobileBackNavigation } from "@/hooks/use-mobile-back-navigation";

interface NavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goodHabits: Habit[];
  badHabits: Habit[];
  onSettingsClick: () => void;
  onHistoryClick?: () => void;
  onDonateClick?: () => void;
  onAboutClick?: () => void;
  onEditHabit?: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
  onHelpClick?: () => void;
  onHabitSelect?: (habit: Habit) => void;
}

// Memoized habit item component to prevent unnecessary re-renders
const HabitItem = React.memo<{
  habit: Habit;
  index: number;
  isOpen: boolean;
  type: 'good' | 'bad';
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  onSelect?: (habit: Habit) => void;
}>(({ habit, index, isOpen, type, onEdit, onDelete, onSelect }) => {
  const colorClasses = type === 'good' 
    ? "bg-green-500/10 text-green-600 border-green-500/20"
    : "bg-red-500/10 text-red-600 border-red-500/20";
    
  return (
    <div
      className="flex items-center justify-between p-3 bg-muted material-radius collapsible-item state-layer-hover cursor-pointer"
      style={{
        animationName: isOpen ? 'fadeInSlideUp' : 'none',
        animationDuration: isOpen ? '0.25s' : '0s',
        animationTimingFunction: isOpen ? 'ease-out' : 'linear',
        animationDelay: isOpen ? `${index * 30}ms` : '0ms',
        animationFillMode: 'both'
      }}
      onClick={() => onSelect?.(habit)}
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
  onHistoryClick,
  onDonateClick,
  onAboutClick,
  onEditHabit,
  onDeleteHabit,
  onHelpClick,
  onHabitSelect,
  open,
  onOpenChange
}) => {
  const [goodHabitsOpen, setGoodHabitsOpen] = useState(false);
  const [badHabitsOpen, setBadHabitsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter habits based on search query
  const filteredGoodHabits = useMemo(() => {
    if (!searchQuery.trim()) return goodHabits;
    return goodHabits.filter(habit => 
      habit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [goodHabits, searchQuery]);

  const filteredBadHabits = useMemo(() => {
    if (!searchQuery.trim()) return badHabits;
    return badHabits.filter(habit => 
      habit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [badHabits, searchQuery]);

  // Auto-expand sections when searching
  const effectiveGoodHabitsOpen = searchQuery ? true : goodHabitsOpen;
  const effectiveBadHabitsOpen = searchQuery ? true : badHabitsOpen;

  // Memoize callbacks to prevent child re-renders
  const handleSettingsClick = useCallback(() => {
  onSettingsClick();
  onOpenChange(false);
  }, [onSettingsClick, onOpenChange]);


  const handleHistoryClick = useCallback(() => {
  onHistoryClick?.();
  onOpenChange(false);
  }, [onHistoryClick, onOpenChange]);

  const handleDonateClick = useCallback(() => {
  onDonateClick?.();
  onOpenChange(false);
  }, [onDonateClick, onOpenChange]);

  const handleAboutClick = useCallback(() => {
  onAboutClick?.();
  onOpenChange(false);
  }, [onAboutClick, onOpenChange]);

  const handleHelpClick = useCallback(() => {
  onHelpClick?.();
  onOpenChange(false);
  }, [onHelpClick, onOpenChange]);

  // Handle mobile back navigation for the navigation drawer
  useMobileBackNavigation({
    onBackPressed: () => {
      onOpenChange(false);
    },
    isActive: open
  });

  return (
  <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="state-layer-hover" onClick={() => onOpenChange(true)}>
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-muted [&>button]:hidden">
        <VisuallyHidden.Root>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Access your habit tracking dashboard and settings</SheetDescription>
        </VisuallyHidden.Root>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Habit Tracker</h2>
                <p className="text-sm text-muted-foreground mt-1">Track your daily progress</p>
              </div>
              <CloseButton onClick={() => onOpenChange(false)} />
            </div>
          </div>
          {/* Search Bar */}
          <div className="px-4 py-2 border-b border-border bg-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 material-radius"
              />
              {searchQuery && (
                <CloseButton
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                  label="Clear search"
                />
              )}
            </div>
          </div>
          {/* Content - Scrollable Habits Area */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Good Habits Accordion */}
            <Collapsible open={effectiveGoodHabitsOpen} onOpenChange={setGoodHabitsOpen}>
              <div className="bg-card material-radius-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full p-4 justify-between h-auto no-hover accordion-trigger"
                    disabled={searchQuery ? true : false}
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Good Habits</span>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 ml-2 badge-count">
                        {filteredGoodHabits.length}
                      </Badge>
                    </div>
                    {!searchQuery && (
                      <ChevronDown className={cn(
                        "w-5 h-5 transition-all duration-200 ease-out",
                        goodHabitsOpen && "rotate-180"
                      )} />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 space-y-2">
                  {filteredGoodHabits.length === 0 ? (
                    <div className="p-3 bg-muted material-radius text-center">
                      <span className="text-muted-foreground text-sm">
                        {searchQuery ? "No good habits found" : "No good habits yet"}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredGoodHabits.map((habit, index) => (
                        <HabitItem
                          key={habit.id}
                          habit={habit}
                          index={index}
                          isOpen={effectiveGoodHabitsOpen}
                          type="good"
                          onEdit={onEditHabit}
                          onDelete={onDeleteHabit}
                          onSelect={onHabitSelect}
                        />
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Bad Habits Accordion */}
            <Collapsible open={effectiveBadHabitsOpen} onOpenChange={setBadHabitsOpen}>
              <div className="bg-card material-radius-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full p-4 justify-between h-auto no-hover accordion-trigger"
                    disabled={searchQuery ? true : false}
                  >
                    <div className="flex items-center space-x-3">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Bad Habits</span>
                      <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20 ml-2 badge-count">
                        {filteredBadHabits.length}
                      </Badge>
                    </div>
                    {!searchQuery && (
                      <ChevronDown className={cn(
                        "w-5 h-5 transition-all duration-200 ease-out",
                        badHabitsOpen && "rotate-180"
                      )} />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 space-y-2">
                  {filteredBadHabits.length === 0 ? (
                    <div className="p-3 bg-muted material-radius text-center">
                      <span className="text-muted-foreground text-sm">
                        {searchQuery ? "No bad habits found" : "No bad habits tracked"}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredBadHabits.map((habit, index) => (
                        <HabitItem
                          key={habit.id}
                          habit={habit}
                          index={index}
                          isOpen={effectiveBadHabitsOpen}
                          type="bad"
                          onEdit={onEditHabit}
                          onDelete={onDeleteHabit}
                          onSelect={onHabitSelect}
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
                onClick={handleHelpClick}
              >
                <HelpCircle className="w-5 h-5 mr-3" />
                <span>Help</span>
              </Button>
              
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
              
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto state-layer-hover"
                onClick={handleAboutClick}
              >
                <Info className="w-5 h-5 mr-3" />
                <span>About</span>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
      
    </Sheet>
  );
});

NavigationDrawer.displayName = "NavigationDrawer";

export { NavigationDrawer };
