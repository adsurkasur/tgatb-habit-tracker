import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Flame, RotateCcw, CheckCircle } from "lucide-react";
import { Habit, HabitLog } from "@shared/schema";
import { useEffect, useRef, useState, memo } from "react";

interface HabitCardProps {
  habit: Habit;
  onTrack: (completed: boolean) => void;
  onUndo?: () => void;
  isCompletedToday?: boolean;
  completedAt?: Date;
  /** navigationEvent triggers slide animation once per sequence increment. */
  navigationEvent?: { dir: 'left' | 'right'; seq: number } | null;
  todayLog?: HabitLog; // Log for today to determine positive/negative
}

function HabitCardComponent({ 
  habit, 
  onTrack, 
  onUndo, 
  isCompletedToday = false,
  completedAt,
  navigationEvent = null,
  todayLog
}: HabitCardProps) {
  const animationClass = useSlideAnimation(habit?.id, navigationEvent);
  const [initialApplied, setInitialApplied] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setInitialApplied(false), 250);
    return () => clearTimeout(t);
  }, []);
  const isPositiveAction = todayLog ? (habit.type === "good" ? todayLog.completed : !todayLog.completed) : false;
  // Debug: log every render and animation class
  if (navigationEvent && process.env.NODE_ENV !== 'production') {
    // Throttle duplicate logs in the same microtask (React strict mode double render in dev)
    type HabitCardWindow = Window & { __habitCardLastLog?: { seq: number | null } };
    const win = window as HabitCardWindow;
    const lastLogRef = win.__habitCardLastLog || { seq: null };
    if (lastLogRef.seq !== navigationEvent.seq) {
      console.debug('[HabitCard] Render (seq change) habit', habit?.id, navigationEvent, 'anim:', animationClass, 'initial:', initialApplied);
      win.__habitCardLastLog = { seq: navigationEvent.seq };
    } else {
      console.debug('[HabitCard] Re-render same seq (likely StrictMode) habit', habit?.id, 'anim:', animationClass);
    }
  }
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
    <HabitCardContent
      habit={habit}
      animationClass={initialApplied ? `${animationClass} habit-card-initial` : animationClass}
      isCompletedToday={isCompletedToday}
      completedAt={completedAt}
      isPositiveAction={isPositiveAction}
      onTrack={onTrack}
      onUndo={onUndo}
    />
  );
}

// Only re-render if props actually change
function areEqual(prevProps: HabitCardProps, nextProps: HabitCardProps) {
  // Only re-render if habit id, navigationEvent.seq, isCompletedToday, completedAt, or todayLog change
  return (
    prevProps.habit.id === nextProps.habit.id &&
    prevProps.isCompletedToday === nextProps.isCompletedToday &&
    prevProps.completedAt === nextProps.completedAt &&
    prevProps.onTrack === nextProps.onTrack &&
    prevProps.onUndo === nextProps.onUndo &&
    JSON.stringify(prevProps.todayLog) === JSON.stringify(nextProps.todayLog) &&
    ((prevProps.navigationEvent && nextProps.navigationEvent && prevProps.navigationEvent.seq === nextProps.navigationEvent.seq) ||
      (!prevProps.navigationEvent && !nextProps.navigationEvent))
  );
}

export const HabitCard = memo(HabitCardComponent, areEqual);

function HabitCardContent({ habit, animationClass, isCompletedToday, completedAt, isPositiveAction, onTrack, onUndo }: {
  habit: Habit;
  animationClass: string;
  isCompletedToday: boolean;
  completedAt?: Date;
  isPositiveAction: boolean;
  onTrack: (completed: boolean) => void;
  onUndo?: () => void;
}) {
  const cardToneClass = () => {
    if (!isCompletedToday) {
      return habit.type === 'bad' ? 'bg-card border-red-100 dark:border-red-900' : 'bg-card border-green-200 dark:border-green-700';
    }
    if (isPositiveAction) {
      return habit.type === 'good'
        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
        : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
    }
    return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
  };
  const questionText = () => {
    if (!isCompletedToday) return 'Did you do it?';
    if (isPositiveAction) return habit.type === 'bad' ? "You didn't do it!" : 'Already done today!';
    return habit.type === 'good' ? "You didn't do it today!" : 'You did it today!';
  };
  return (
    <Card
      key={`habit-${habit.id}`}
      data-tour="habit-card"
      className={`w-full max-w-md mx-auto p-6 surface-elevation-2 card-transition habit-card-animated ${animationClass} relative ${cardToneClass()}`}
    >
      <StatusBadge visible={isCompletedToday} isPositiveAction={isPositiveAction} type={habit.type} />
      <StreakBadge type={habit.type} streak={habit.streak} />
      <div className="space-y-6 mt-8">
        <HabitHeader name={habit.name} type={habit.type} completedAt={completedAt} />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">{questionText()}</h3>
        </div>
        <ActionButtons isCompletedToday={isCompletedToday} onUndo={onUndo} onTrack={onTrack} />
      </div>
    </Card>
  );
}

function useSlideAnimation(
  habitId: string | number | undefined,
  navigationEvent: { dir: 'left' | 'right'; seq: number } | null | undefined,
) {
  const [animationClass, setAnimationClass] = useState('');
  const previousSeqRef = useRef<number | null>(null);

  useEffect(() => {
    if (navigationEvent && habitId) {
      const { seq, dir } = navigationEvent;
      if (seq !== previousSeqRef.current) {
        previousSeqRef.current = seq;
        setAnimationClass(dir === 'left' ? 'slide-from-left' : 'slide-from-right');
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[useSlideAnimation] Trigger animation for habit', habitId, 'seq:', seq, 'dir:', dir);
        }
        const timer = setTimeout(() => {
          setAnimationClass('');
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[useSlideAnimation] Animation cleared for habit', habitId, 'seq:', seq);
          }
        }, 250);
        return () => clearTimeout(timer);
      }
    }
  }, [habitId, navigationEvent]);

  return animationClass;
}

function StatusBadge({ visible, isPositiveAction, type }: { visible: boolean; isPositiveAction: boolean; type: Habit['type'] }) {
  if (!visible) return null;
  const tone = isPositiveAction ? (type === 'good' ? 'bg-green-500 border-green-600' : 'bg-blue-500 border-blue-600') : 'bg-red-500 border-red-600';
  const label = isPositiveAction ? (type === 'good' ? 'Completed' : 'Avoided') : (type === 'good' ? 'Missed' : 'Done');
  return (
    <div className="absolute top-4 left-4">
      <Badge className={`text-white border-opacity-60 ${tone}`}>
        <CheckCircle className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    </div>
  );
}

function StreakBadge({ type, streak }: { type: Habit['type']; streak: number }) {
  const tone = type === 'good' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20';
  return (
    <div className="absolute top-4 right-4">
      <Badge variant="secondary" className={`font-medium ${tone}`}>
        <Flame className="w-3 h-3 mr-1" />
        {streak} days
      </Badge>
    </div>
  );
}

function HabitHeader({ name, type, completedAt }: { name: string; type: Habit['type']; completedAt?: Date }) {
  const badgeClass = type === 'good' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white';
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold text-foreground leading-tight">{name}</h2>
      <div className="flex items-center gap-2">
        <Badge variant={type === 'good' ? 'default' : 'destructive'} className={`font-medium ${badgeClass}`}>
          {type === 'good' ? 'Good' : 'Bad'}
        </Badge>
        {completedAt && (
          <span className="text-sm text-muted-foreground">
            at {new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

function ActionButtons({ isCompletedToday, onUndo, onTrack }: { isCompletedToday: boolean; onUndo?: () => void; onTrack: (completed: boolean) => void }) {
  if (isCompletedToday) {
    return (
      <div className="flex space-x-4">
        <Button
          onClick={onUndo}
          variant="outline"
          className="w-full h-16 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950 material-radius"
          size="lg"
        >
          <RotateCcw className="w-6 h-6 mr-2" />
          Undo
        </Button>
      </div>
    );
  }

  return (
    <div className="flex space-x-4">
      <Button onClick={() => onTrack(true)} className="flex-1 h-16 bg-green-500 hover:bg-green-600 text-white material-radius" size="lg">
        <Check className="w-8 h-8" />
      </Button>
      <Button onClick={() => onTrack(false)} className="flex-1 h-16 bg-red-500 hover:bg-red-600 text-white material-radius" size="lg">
        <X className="w-8 h-8" />
      </Button>
    </div>
  );
}
