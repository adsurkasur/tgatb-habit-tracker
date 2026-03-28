import { Habit, HabitType } from '@/shared/schema';
import { getAllHabitLogs, getHabitStats } from '@/lib/habit-storage';
import { formatLocalDate } from '@/lib/utils';
import { eachDayOfInterval, startOfDay, subDays } from 'date-fns';

export interface DayLog {
  date: Date;
  habits: {
    id: string;
    name: string;
    type: HabitType;
    completed: boolean | null;
  }[];
}

export interface StatSummary {
  totalHabits: number;
  goodHabits: number;
  badHabits: number;
  habitsActiveToday: number;
  totalStreak: number;
  longestStreak: number;
  todayCompletion: number;
  weeklyCompletion: number;
  totalActions: number;
}

export function computeStatSummary(habits: Habit[]): StatSummary {
  const today = startOfDay(new Date());

  const habitsActiveToday = habits.filter(habit => startOfDay(habit.createdAt) <= today).length;

  const stats: StatSummary = {
    totalHabits: habits.length,
    goodHabits: habits.filter(h => h.type === 'good').length,
    badHabits: habits.filter(h => h.type === 'bad').length,
    habitsActiveToday,
    totalStreak: 0,
    longestStreak: 0,
    todayCompletion: 0,
    weeklyCompletion: 0,
    totalActions: 0,
  };

  const todayStr = formatLocalDate(new Date());
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });

  habits.forEach(habit => {
    const habitStats = getHabitStats(habit.id);
    stats.totalStreak += habitStats.currentStreak;
    stats.longestStreak = Math.max(stats.longestStreak, habitStats.longestStreak);
    stats.totalActions += habitStats.totalCompletions;

    const habitCreatedDate = startOfDay(habit.createdAt);
    if (habitCreatedDate <= today) {
      const logs = getAllHabitLogs(habit.id);
      if (logs.some(log => log.date === todayStr && (habit.type === 'good' ? log.completed === true : log.completed === false))) {
        stats.todayCompletion++;
      }
    }

    // Weekly completion - only count habits that existed on each day
    const weeklyCompletions = last7Days.filter(day => {
      const dayStart = startOfDay(day);
      if (habitCreatedDate <= dayStart) {
        const dayStr = formatLocalDate(day);
        const logs = getAllHabitLogs(habit.id);
        return logs.some(log => log.date === dayStr && (habit.type === 'good' ? log.completed === true : log.completed === false));
      }
      return false;
    }).length;

    stats.weeklyCompletion += weeklyCompletions;
  });

  return stats;
}

export function buildDailyLogs(habits: Habit[], days = 30): DayLog[] {
  const logs: DayLog[] = [];
  const range = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });

  range.forEach(date => {
    const dayLog: DayLog = {
      date,
      habits: habits
        .filter(habit => {
          const dateStr = formatLocalDate(date);
          const habitLogs = getAllHabitLogs(habit.id);
          const hasExplicitLogForDay = habitLogs.some(log => log.date === dateStr);
          return startOfDay(habit.createdAt) <= startOfDay(date) || hasExplicitLogForDay;
        })
        .map(habit => {
          const habitLogs = getAllHabitLogs(habit.id);
          const dateStr = formatLocalDate(date);
          const logForDay = habitLogs.find(log => log.date === dateStr);
          let completed: boolean | null = null;
          if (logForDay) {
            completed = logForDay.completed;
          } else {
            completed = null; // No log for this day
          }
          return { id: habit.id, name: habit.name, type: habit.type, completed };
        }),
    };
    logs.push(dayLog);
  });

  return logs.reverse();
}

/** Build a DayLog for a single specific date (no day-range limit). */
export function buildDayLog(habits: Habit[], date: Date): DayLog {
  const dateStr = formatLocalDate(date);
  return {
    date,
    habits: habits
      .filter(habit => {
        const habitLogs = getAllHabitLogs(habit.id);
        const hasExplicitLogForDay = habitLogs.some(log => log.date === dateStr);
        return startOfDay(habit.createdAt) <= startOfDay(date) || hasExplicitLogForDay;
      })
      .map(habit => {
        const habitLogs = getAllHabitLogs(habit.id);
        const logForDay = habitLogs.find(log => log.date === dateStr);
        return {
          id: habit.id,
          name: habit.name,
          type: habit.type,
          completed: logForDay ? logForDay.completed : null,
        };
      }),
  };
}

/**
 * Get dates that should be highlighted as positive progress days.
 *
 * A date is included when at least one habit has a positive outcome on that day:
 * - good habit: completed === true
 * - bad habit: completed === false (successfully avoided)
 *
 * Logs before a habit's creation date are ignored so calendar markers stay aligned
 * with day-detail visibility.
 */
export function getCompletedDatesSet(habits: Habit[]): Set<string> {
  const dates = new Set<string>();
  for (const habit of habits) {
    const logs = getAllHabitLogs(habit.id);
    for (const log of logs) {
      // Manual backfills for dates prior to creation are valid and should be visible.
      // Treat explicit log entries as source of truth for calendar highlighting.
      const isPositiveOutcome = habit.type === 'good' ? log.completed === true : log.completed === false;
      if (isPositiveOutcome) {
        dates.add(log.date);
      }
    }
  }
  return dates;
}

/**
 * Get dates that should be highlighted as negative days.
 * - good habit: completed === false (missed)
 * - bad habit: completed === true (did the bad habit)
 */
export function getNegativeDatesSet(habits: Habit[]): Set<string> {
  const dates = new Set<string>();
  if (habits.length === 0) return dates;

  const today = startOfDay(new Date());
  const earliestHabitDate = habits
    .map((habit) => startOfDay(habit.createdAt))
    .reduce((min, date) => (date < min ? date : min), startOfDay(habits[0].createdAt));

  const logsByHabit = new Map<string, Map<string, { completed: boolean }>>();
  let earliestLoggedDate: Date | null = null;

  for (const habit of habits) {
    const logs = getAllHabitLogs(habit.id);
    const byDate = new Map<string, { completed: boolean }>();
    for (const log of logs) {
      byDate.set(log.date, { completed: log.completed });
      const logDate = startOfDay(new Date(`${log.date}T00:00:00`));
      if (!earliestLoggedDate || logDate < earliestLoggedDate) {
        earliestLoggedDate = logDate;
      }
    }
    logsByHabit.set(habit.id, byDate);
  }

  const start = earliestLoggedDate && earliestLoggedDate < earliestHabitDate
    ? earliestLoggedDate
    : earliestHabitDate;

  const range = eachDayOfInterval({ start, end: today });

  for (const day of range) {
    const dayKey = formatLocalDate(day);

    const hasUntracked = habits.some((habit) => {
      const byDate = logsByHabit.get(habit.id);
      const log = byDate?.get(dayKey);
      const createdAtOrBefore = startOfDay(habit.createdAt) <= startOfDay(day);
      const includedForDay = createdAtOrBefore || !!log;
      return includedForDay && !log;
    });

    if (hasUntracked) {
      dates.add(dayKey);
      continue;
    }

    const hasNegativeOutcome = habits.some((habit) => {
      const log = logsByHabit.get(habit.id)?.get(dayKey);
      if (!log) return false;
      return habit.type === 'good' ? log.completed === false : log.completed === true;
    });

    if (hasNegativeOutcome) {
      dates.add(dayKey);
    }
  }

  return dates;
}
