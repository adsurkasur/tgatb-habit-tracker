import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Flame, RotateCcw, CheckCircle } from "lucide-react";
import { Habit } from "@shared/schema";
import { useEffect, useState } from "react";

interface HabitCardProps {
  habit: Habit;
  onTrack: (completed: boolean) => void;
  onUndo?: () => void;
  isCompletedToday?: boolean;
  completedAt?: Date;
  navigationDirection?: 'left' | 'right' | null;
  todayLog?: any; // Will contain the actual log to determine positive/negative
}

export function HabitCard({ 
  habit, 
  onTrack, 
  onUndo, 
  isCompletedToday = false,
  completedAt,
  navigationDirection = null,
  todayLog
}: HabitCardProps) {
  const [previousHabitId, setPreviousHabitId] = useState(habit?.id);
  const [animationClass, setAnimationClass] = useState('');

  // Determine if today's action was positive or negative
  const isPositiveAction = todayLog ? 
    (habit.type === "good" ? todayLog.completed : !todayLog.completed) : 
    false;

  // Handle habit changes and animation direction
  useEffect(() => {
    if (habit && habit.id !== previousHabitId) {
      // Set the appropriate animation class based on navigation direction
      if (navigationDirection === 'left') {
        setAnimationClass('slide-from-left');
      } else if (navigationDirection === 'right') {
        setAnimationClass('slide-from-right');
      } else {
        setAnimationClass('');
      }
      
      setPreviousHabitId(habit.id);
      
      // Clear animation class after animation completes
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 250); // Slightly longer than animation duration
      
      return () => clearTimeout(timer);
    }
  }, [habit?.id, previousHabitId, navigationDirection]);

  if (!habit) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 bg-muted/50">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">No habits yet</h2>
          <p className="text-muted-foreground">Add your first habit to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      key={`habit-${habit.id}`}
      data-tour="habit-card"
      className={`w-full max-w-md mx-auto p-6 surface-elevation-2 card-transition habit-card-animated ${animationClass} relative ${
        isCompletedToday 
          ? isPositiveAction
            ? habit.type === "good" 
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
              : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
            : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          : habit.type === "bad" 
            ? 'bg-card border-red-100 dark:border-red-900' 
            : 'bg-card border-green-200 dark:border-green-700'
      }`}
    >
      {/* Completion Status Badge */}
      {isCompletedToday && (
        <div className="absolute top-4 left-4">
          <Badge className={`text-white border-opacity-60 ${
            isPositiveAction
              ? habit.type === "good" 
                ? "bg-green-500 border-green-600" 
                : "bg-blue-500 border-blue-600"
              : "bg-red-500 border-red-600"
          }`}>
            <CheckCircle className="w-3 h-3 mr-1" />
            {isPositiveAction 
              ? (habit.type === "good" ? "Completed" : "Avoided")
              : (habit.type === "good" ? "Not Completed" : "Done")
            }
          </Badge>
        </div>
      )}

      {/* Streak Badge */}
      <div className="absolute top-4 right-4">
        <Badge 
          variant="secondary" 
          className={`font-medium ${
            habit.type === "good"
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : "bg-orange-500/10 text-orange-600 border-orange-500/20"
          }`}
        >
          <Flame className="w-3 h-3 mr-1" />
          {habit.streak} days
        </Badge>
      </div>

      <div className="space-y-6 mt-8">
        {/* Habit Name and Type */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground leading-tight">
            {habit.name}
          </h2>
          <div className="flex items-center gap-2">
            <Badge 
              variant={habit.type === "good" ? "default" : "destructive"}
              className={`font-medium ${
                habit.type === "good" 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {habit.type === "good" ? "Good" : "Bad"}
            </Badge>
            {completedAt && (
              <span className="text-sm text-muted-foreground">
                at {new Date(completedAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">
            {isCompletedToday 
              ? isPositiveAction
                ? (habit.type === "bad" ? "You didn't do it!" : "Already done today!")
                : (habit.type === "good" ? "You didn't do it today!" : "You did it today!")
              : "Did you do it?"
            }
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          {isCompletedToday ? (
            <Button
              onClick={onUndo}
              variant="outline"
              className="w-full h-16 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950 material-radius"
              size="lg"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              Undo
            </Button>
          ) : (
            <>
              <Button
                onClick={() => onTrack(true)}
                className="flex-1 h-16 bg-green-500 hover:bg-green-600 text-white material-radius"
                size="lg"
              >
                <Check className="w-8 h-8" />
              </Button>
              <Button
                onClick={() => onTrack(false)}
                className="flex-1 h-16 bg-red-500 hover:bg-red-600 text-white material-radius" 
                size="lg"
              >
                <X className="w-8 h-8" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
