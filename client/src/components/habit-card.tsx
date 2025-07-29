import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Flame } from "lucide-react";
import { Habit } from "@shared/schema";

interface HabitCardProps {
  habit: Habit;
  onTrack: (completed: boolean) => void;
}

export function HabitCard({ habit, onTrack }: HabitCardProps) {
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
    <Card className="w-full max-w-md mx-auto p-6 bg-card surface-elevation-2 card-transition relative">
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
        </div>

        {/* Question */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">
            Did you do it?
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
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
        </div>
      </div>
    </Card>
  );
}
