import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Target, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface AddHabitCTAProps {
  onAddHabit: () => void;
  hasHabits: boolean;
}

export function AddHabitCTA({ onAddHabit, hasHabits }: AddHabitCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [previousHasHabits, setPreviousHasHabits] = useState(hasHabits);
  const [animationKey, setAnimationKey] = useState(0);

  // Handle state transitions with animations
  useEffect(() => {
    if (hasHabits !== previousHasHabits) {
      // State is changing, trigger exit animation
      setIsVisible(false);
      
      // After exit animation, update state and trigger enter animation
      setTimeout(() => {
        setPreviousHasHabits(hasHabits);
        setAnimationKey(prev => prev + 1);
        setIsVisible(true);
      }, 200);
    } else {
      // Initial render or same state
      setIsVisible(true);
    }
  }, [hasHabits, previousHasHabits]);

  if (hasHabits) {
    // Floating Action Button for when habits exist
    return (
      <div 
        key={`fab-${animationKey}`}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-4 scale-95'
        }`}
      >
        <Button
          onClick={onAddHabit}
          size="icon"
          className="h-14 w-14 rounded-full fab fab-animated"
          data-tour="add-habit-fab"
        >
          <Plus className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90" />
        </Button>
      </div>
    );
  }

  // Full CTA when no habits exist
  return (
    <Card 
      key={`cta-${animationKey}`}
      className={`w-full max-w-md mx-auto p-8 cta-card cta-card-animated transition-all duration-500 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-95'
      }`}
    >
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center cta-icon-container">
          <Target className="w-8 h-8 text-primary cta-icon" />
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
          className="w-full h-12 cta-button cta-button-animated font-medium group"
        >
          <Plus className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
          Add Your First Habit
        </Button>
        
        {/* Motivational Note */}
        <div className="flex items-center justify-center text-xs text-muted-foreground mt-4">
          <Sparkles className="w-3 h-3 mr-1 cta-sparkle" />
          <span>Every expert was once a beginner</span>
        </div>
      </div>
    </Card>
  );
}
