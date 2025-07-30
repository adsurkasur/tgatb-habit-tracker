import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Flame, RotateCcw, CheckCircle } from "lucide-react";
import { Habit } from "@shared/schema";

interface HabitCardProps {
  habit: Habit;
  onTrack: (completed: boolean) => void;
  onUndo?: () => void;
  isCompletedToday?: boolean;
  completedAt?: Date;
}

export function HabitCard({ 
  habit, 
  onTrack, 
  onUndo, 
  isCompletedToday = false,
  completedAt 
}: HabitCardProps) {
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
    <Card className={`w-full max-w-md mx-auto p-6 surface-elevation-2 card-transition relative ${
      isCompletedToday 
        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
        : 'bg-card'
    }`}>
      {/* Completion Status Badge */}
      {isCompletedToday && (
        <div className="absolute top-4 left-4">
          <Badge className="bg-green-500 text-white border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        </div>
      )}

      {/* Streak Badge */}
      <div className="absolute top-4 right-4">
        <Badge 
          variant="secondary" 
          className="bg-primary/10 text-primary border-primary/20 font-medium"
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
            {isCompletedToday ? "Already done today!" : "Did you do it?"}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          {isCompletedToday ? (
            <>
              {onUndo && (
                <Button
                  onClick={onUndo}
                  variant="outline"
                  className="flex-1 h-16 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950 transition-all hover:scale-105"
                  size="lg"
                >
                  <RotateCcw className="w-6 h-6 mr-2" />
                  Undo
                </Button>
              )}
              <Button
                disabled
                className="flex-1 h-16 bg-green-500 text-white cursor-not-allowed opacity-50"
                size="lg"
              >
                <CheckCircle className="w-8 h-8" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => onTrack(true)}
                className="flex-1 h-16 bg-green-500 hover:bg-green-600 text-white transition-all hover:scale-105 material-radius"
                size="lg"
              >
                <Check className="w-8 h-8" />
              </Button>
              <Button
                onClick={() => onTrack(false)}
                className="flex-1 h-16 bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-105 material-radius" 
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
