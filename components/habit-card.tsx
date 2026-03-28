
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Flame, RotateCcw, CheckCircle, Clock3, XCircle } from "lucide-react";
import { Habit, HabitLog } from "@shared/schema";
import { useEffect, useState, memo } from "react";
import { useTranslations } from "next-intl";
import { isExpectedDate } from "@/lib/schedule";

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
  const t = useTranslations("HabitCard");
  const animationClass = useSlideAnimation(habit?.id, navigationEvent);
  const [initialApplied, setInitialApplied] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setInitialApplied(false), 250);
    return () => clearTimeout(t);
  }, []);
  const isPositiveAction = todayLog ? (habit.type === "good" ? todayLog.completed : !todayLog.completed) : false;
  // Debug: log animation state changes in dev mode (via effect to avoid render side effects)
  useEffect(() => {
    if (!navigationEvent || process.env.NODE_ENV === 'production') return;
    console.debug('[HabitCard] Animation applied', habit?.id, navigationEvent, 'anim:', animationClass, 'initial:', initialApplied);
  }, [navigationEvent, habit?.id, animationClass, initialApplied]);
  if (!habit) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-lg border p-6 bg-muted/50">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-muted-foreground">{t("emptyTitle")}</h2>
            <p className="text-muted-foreground">{t("emptyDescription")}</p>
          </div>
        </div>
      </div>
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
      t={t}
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

function HabitCardContent({ habit, animationClass, isCompletedToday, completedAt, isPositiveAction, onTrack, onUndo, t }: {
  habit: Habit;
  animationClass: string;
  isCompletedToday: boolean;
  completedAt?: Date;
  isPositiveAction: boolean;
  onTrack: (completed: boolean) => void;
  onUndo?: () => void;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  // Determine if today is an expected date in the habit's schedule (REAL off-day logic)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isTodayExpected = isExpectedDate(habit, today);

  const createdDay = new Date(habit.createdAt);
  createdDay.setHours(0, 0, 0, 0);

  const hasReachedFirstExpectedDay = (() => {
    if (isTodayExpected) return true;
    const cursor = new Date(createdDay);
    while (cursor <= today) {
      if (isExpectedDate(habit, cursor)) {
        return true;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  })();
  
  // An off-day is when today is NOT expected in the schedule
  const isOffDay = !isTodayExpected;
  const isNotYet = isOffDay && !hasReachedFirstExpectedDay;
  const isOngoingOffDay = isOffDay && hasReachedFirstExpectedDay;
  
  // On off-days, show styling as if the habit is "on track" (completed)
  // This indicates the user is doing well on the schedule
  const showAsCompleted = isOngoingOffDay || (isCompletedToday && isPositiveAction);
  const showNegativeBadge = isCompletedToday && !isPositiveAction && !isOffDay;
  
  // DEBUG
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[HabitCard] ${habit.name}:`, {
      isTodayExpected,
      isOffDay,
      isNotYet,
      hasReachedFirstExpectedDay,
      isCompletedToday,
      isPositiveAction,
      showAsCompleted,
      schedule: habit.schedule,
      intervalStartDate: habit.intervalStartDate,
    });
  }
  
  const cardToneClass = () => {
    if (isNotYet) {
      return 'bg-slate-200 border-slate-400 dark:bg-slate-800 dark:border-slate-600';
    }

    // Off-day: show as completed/on-track (green for good, blue for bad)
    if (showAsCompleted) {
      return habit.type === 'good'
        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
        : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
    }
    
    // Expected day without completion
    if (!isCompletedToday) {
      return habit.type === 'bad' ? 'bg-card border-red-100 dark:border-red-900' : 'bg-card border-green-200 dark:border-green-700';
    }
    
    // Expected day with negative action (missed/done)
    return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
  };
  
  const questionText = () => {
    if (isNotYet) {
      return 'Still waiting for the time...';
    }

    // Off-day after schedule has started: mirror daily-like success wording
    if (isOngoingOffDay) {
      return habit.type === 'bad' ? t('question.badPositive') : t('question.goodPositive');
    }
    
    if (!isCompletedToday) return t('question.pending');
    if (isPositiveAction) return habit.type === 'bad' ? t('question.badPositive') : t('question.goodPositive');
    return habit.type === 'good' ? t('question.goodNegative') : t('question.badNegative');
  };
  
  return (
    <div className="w-full max-w-md mx-auto relative" data-tour="habit-card">
      {/* Surface owns ALL visuals: rounded, border, bg, shadow, padding */}
      <div className={`habit-card-surface habit-card-animated rounded-lg border p-6 relative surface-elevation-2 card-transition ${animationClass} ${cardToneClass()}`}>
        {/* Show not-yet, positive, or negative badge state based on schedule window and today's log outcome. */}
        <StatusBadge
          visible={showAsCompleted || showNegativeBadge || isNotYet}
          type={habit.type}
          state={isNotYet ? 'notYet' : showAsCompleted ? 'positive' : 'negative'}
        />
        <StreakBadge type={habit.type} streak={habit.streak} t={t} />
        <div className="space-y-6 mt-8">
          <HabitHeader name={habit.name} type={habit.type} completedAt={completedAt} t={t} />
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground">{questionText()}</h3>
          </div>
          <ActionButtons isCompletedToday={isCompletedToday} isOffDay={isOffDay} onUndo={onUndo} onTrack={onTrack} t={t} />
        </div>
      </div>
    </div>
  );
}

function useSlideAnimation(
  habitId: string | number | undefined,
  navigationEvent: { dir: 'left' | 'right'; seq: number } | null | undefined,
) {
  const [animationClass, setAnimationClass] = useState('');
  const [prevSeq, setPrevSeq] = useState<number | null>(null);

  // Detect navigation change during render (React-approved adjustment pattern)
  if (navigationEvent && habitId && navigationEvent.seq !== prevSeq) {
    setPrevSeq(navigationEvent.seq);
    setAnimationClass(navigationEvent.dir === 'left' ? 'slide-from-left' : 'slide-from-right');
  }

  // Clear animation class after duration (setTimeout callback, not direct effect setState)
  useEffect(() => {
    if (animationClass) {
      const timer = setTimeout(() => {
        setAnimationClass('');
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[useSlideAnimation] Animation cleared for habit', habitId);
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [animationClass, habitId]);

  return animationClass;
}

function StatusBadge({ visible, type, state }: { visible: boolean; type: Habit['type']; state: 'positive' | 'negative' | 'notYet' }) {
  const t = useTranslations("HabitCard");
  if (!visible) return null;
  if (state === 'notYet') {
    return (
      <div className="absolute top-4 left-4">
        <Badge className="text-white border-slate-700 bg-slate-600 border-opacity-80">
          <Clock3 className="w-3 h-3 mr-1" />
          Not Yet
        </Badge>
      </div>
    );
  }

  const isPositive = state === 'positive';
  const tone = isPositive ? (type === 'good' ? 'bg-green-500 border-green-600' : 'bg-blue-500 border-blue-600') : 'bg-red-500 border-red-600';
  const label = isPositive
    ? (type === 'good' ? t('status.goodCompleted') : t('status.badAvoided'))
    : (type === 'good' ? 'Not Completed' : 'Not Avoided');
  return (
    <div className="absolute top-4 left-4">
      <Badge className={`text-white border-opacity-60 ${tone}`}>
        {isPositive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
        {label}
      </Badge>
    </div>
  );
}

function StreakBadge({ type, streak, t }: { type: Habit['type']; streak: number; t: (key: string, values?: Record<string, string | number | Date>) => string }) {
  const tone = type === 'good' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20';
  return (
    <div className="absolute top-4 right-4">
      <Badge variant="secondary" className={`font-medium ${tone}`}>
        <Flame className="w-3 h-3 mr-1" />
        {t('streakDays', { count: streak })}
      </Badge>
    </div>
  );
}

function HabitHeader({ name, type, completedAt, t }: { name: string; type: Habit['type']; completedAt?: Date; t: (key: string, values?: Record<string, string | number | Date>) => string }) {
  const badgeClass = type === 'good' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white';
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold text-foreground leading-tight">{name}</h2>
      <div className="flex items-center gap-2">
        <Badge variant={type === 'good' ? 'default' : 'destructive'} className={`font-medium ${badgeClass}`}>
          {type === 'good' ? t('type.good') : t('type.bad')}
        </Badge>
        {completedAt && (
          <span className="text-sm text-muted-foreground">
            {t('atTime', { time: new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}
          </span>
        )}
      </div>
    </div>
  );
}

function ActionButtons({ isCompletedToday, isOffDay, onUndo, onTrack, t }: { isCompletedToday: boolean; isOffDay: boolean; onUndo?: () => void; onTrack: (completed: boolean) => void; t: (key: string, values?: Record<string, string | number | Date>) => string }) {
  // Show Undo button only if completed (with a log), not if just an off-day
  if (isCompletedToday && !isOffDay) {
    return (
      <div className="flex space-x-4">
        <Button
          onClick={onUndo}
          variant="outline"
          className="w-full h-16 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950 material-radius"
          size="lg"
        >
          <RotateCcw className="w-6 h-6 mr-2" />
          {t('actions.undo')}
        </Button>
      </div>
    );
  }

  // If it's an off-day, show a single disabled ongoing button
  if (isOffDay) {
    return (
      <div className="flex space-x-4">
        <Button disabled variant="outline" className="w-full h-16 border-slate-500 text-slate-700 bg-slate-300 hover:bg-slate-300 dark:border-slate-500 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-700 material-radius cursor-not-allowed" size="lg">
          {t('question.ongoing')}
        </Button>
      </div>
    );
  }

  // Show Check/X buttons for pending days
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
