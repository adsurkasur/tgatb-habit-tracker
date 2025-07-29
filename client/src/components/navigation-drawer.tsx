import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Menu, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  AlignJustify, 
  Settings, 
  Heart,
  Plus,
  Flame
} from "lucide-react";
import { useState } from "react";
import { Habit } from "@shared/schema";

interface NavigationDrawerProps {
  goodHabits: Habit[];
  badHabits: Habit[];
  onSettingsClick: () => void;
  onAddHabitClick: () => void;
}

export function NavigationDrawer({ 
  goodHabits, 
  badHabits, 
  onSettingsClick, 
  onAddHabitClick 
}: NavigationDrawerProps) {
  const [open, setOpen] = useState(false);
  const [goodHabitsOpen, setGoodHabitsOpen] = useState(false);
  const [badHabitsOpen, setBadHabitsOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="state-layer-hover">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-muted">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">Habit Tracker</h2>
            <p className="text-sm text-muted-foreground mt-1">Track your daily progress</p>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Good Habits Accordion */}
            <Collapsible open={goodHabitsOpen} onOpenChange={setGoodHabitsOpen}>
              <div className="bg-card material-radius-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full p-4 justify-between h-auto state-layer-hover"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Good Habits</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${goodHabitsOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 space-y-2">
                  {goodHabits.length === 0 ? (
                    <div className="p-3 bg-muted material-radius text-center">
                      <span className="text-muted-foreground text-sm">No good habits yet</span>
                    </div>
                  ) : (
                    goodHabits.map((habit) => (
                      <div key={habit.id} className="flex items-center justify-between p-3 bg-muted material-radius">
                        <span className="text-foreground text-sm">{habit.name}</span>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                          <Flame className="w-3 h-3 mr-1" />
                          {habit.streak} days
                        </Badge>
                      </div>
                    ))
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
                    className="w-full p-4 justify-between h-auto state-layer-hover"
                  >
                    <div className="flex items-center space-x-3">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Bad Habits</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${badHabitsOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 space-y-2">
                  {badHabits.length === 0 ? (
                    <div className="p-3 bg-muted material-radius text-center">
                      <span className="text-muted-foreground text-sm">No bad habits tracked</span>
                    </div>
                  ) : (
                    badHabits.map((habit) => (
                      <div key={habit.id} className="flex items-center justify-between p-3 bg-muted material-radius">
                        <span className="text-foreground text-sm">{habit.name}</span>
                        <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
                          <Flame className="w-3 h-3 mr-1" />
                          {habit.streak} days
                        </Badge>
                      </div>
                    ))
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Separator className="my-6" />

            {/* Navigation Items */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto state-layer-hover"
              >
                <AlignJustify className="w-5 h-5 mr-3" />
                <span>AlignJustify</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto state-layer-hover"
                onClick={() => {
                  onSettingsClick();
                  setOpen(false);
                }}
              >
                <Settings className="w-5 h-5 mr-3" />
                <span>Settings</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto state-layer-hover"
              >
                <Heart className="w-5 h-5 mr-3" />
                <span>Donate</span>
              </Button>
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="absolute bottom-6 right-6">
            <Button
              onClick={() => {
                onAddHabitClick();
                setOpen(false);
              }}
              className="w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground material-radius-lg surface-elevation-3"
              size="icon"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
