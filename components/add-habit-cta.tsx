import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Target, Sparkles } from "lucide-react";

interface AddHabitCTAProps {
  onAddHabit: () => void;
  hasHabits: boolean;
}

export function AddHabitCTA({ onAddHabit, hasHabits }: AddHabitCTAProps) {
  if (hasHabits) {
    // Floating Action Button for when habits exist
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onAddHabit}
          size="icon"
          className="h-14 w-14 rounded-full fab"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  // Full CTA when no habits exist
  return (
    <Card className="w-full max-w-md mx-auto p-8 cta-card">
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Target className="w-8 h-8 text-primary" />
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">
            Start Your Journey
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Create your first habit to begin tracking your daily progress and building consistency.
          </p>
        </div>
        
        {/* CTA Button */}
        <Button
          onClick={onAddHabit}
          className="w-full h-12 cta-button font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Habit
        </Button>
        
        {/* Motivational Note */}
        <div className="flex items-center justify-center text-xs text-muted-foreground mt-4">
          <Sparkles className="w-3 h-3 mr-1" />
          <span>Every expert was once a beginner</span>
        </div>
      </div>
    </Card>
  );
}
