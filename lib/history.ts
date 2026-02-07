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
      if (logs.some(log => log.date === todayStr && log.completed === true)) {
        stats.todayCompletion++;
      }
    }

    // Weekly completion - only count habits that existed on each day
    const weeklyCompletions = last7Days.filter(day => {
      const dayStart = startOfDay(day);
      if (habitCreatedDate <= dayStart) {
        const dayStr = formatLocalDate(day);
        const logs = getAllHabitLogs(habit.id);
        return logs.some(log => log.date === dayStr && log.completed === true);
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
        .filter(habit => startOfDay(habit.createdAt) <= startOfDay(date))
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
  return {
    date,
    habits: habits
      .filter(habit => startOfDay(habit.createdAt) <= startOfDay(date))
      .map(habit => {
        const habitLogs = getAllHabitLogs(habit.id);
        const dateStr = formatLocalDate(date);
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

/** Get a Set of date strings (YYYY-MM-DD) that have at least one completed habit. */
export function getCompletedDatesSet(habits: Habit[]): Set<string> {
  const dates = new Set<string>();
  for (const habit of habits) {
    const logs = getAllHabitLogs(habit.id);
    for (const log of logs) {
      if (log.completed === true) {
        dates.add(log.date);
      }
    }
  }
  return dates;
}
