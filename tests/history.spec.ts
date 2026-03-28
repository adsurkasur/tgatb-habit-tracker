import { describe, it, expect, beforeEach } from 'vitest';
import { getCompletedDatesSet } from '@/lib/history';
import { HabitStorage } from '@/lib/habit-storage';
import type { Habit, HabitLog } from '@shared/schema';

function makeHabit(id: string, type: 'good' | 'bad', createdAt: string): Habit {
  return {
    id,
    name: `${type}-${id}`,
    type,
    streak: 0,
    createdAt: new Date(`${createdAt}T00:00:00`),
  };
}

function makeLog(habitId: string, date: string, completed: boolean): HabitLog {
  return {
    id: `${habitId}-${date}-${completed ? 't' : 'f'}`,
    habitId,
    date,
    completed,
    timestamp: new Date(`${date}T12:00:00`),
  };
}

describe('getCompletedDatesSet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('marks a date for good-habit completion and bad-habit avoidance only', () => {
    const habits = [
      makeHabit('h-good', 'good', '2026-03-01'),
      makeHabit('h-bad', 'bad', '2026-03-01'),
    ];

    HabitStorage.saveLogs([
      makeLog('h-good', '2026-03-10', true),
      makeLog('h-bad', '2026-03-11', false),
      makeLog('h-bad', '2026-03-12', true),
    ]);

    const completedDates = getCompletedDatesSet(habits);

    expect(completedDates.has('2026-03-10')).toBe(true);
    expect(completedDates.has('2026-03-11')).toBe(true);
    expect(completedDates.has('2026-03-12')).toBe(false);
  });

  it('does not keep a date marked when no positive outcomes remain', () => {
    const habits = [
      makeHabit('h1', 'good', '2026-03-01'),
      makeHabit('h2', 'good', '2026-03-01'),
    ];

    HabitStorage.saveLogs([
      makeLog('h1', '2026-03-15', false),
      makeLog('h2', '2026-03-15', false),
    ]);

    const completedDates = getCompletedDatesSet(habits);

    expect(completedDates.has('2026-03-15')).toBe(false);
  });

  it('includes manual backfills before habit creation date', () => {
    const habits = [makeHabit('h-good', 'good', '2026-03-20')];

    HabitStorage.saveLogs([
      makeLog('h-good', '2026-03-19', true),
      makeLog('h-good', '2026-03-20', true),
    ]);

    const completedDates = getCompletedDatesSet(habits);

    expect(completedDates.has('2026-03-19')).toBe(true);
    expect(completedDates.has('2026-03-20')).toBe(true);
  });

  it('does not include orphaned logs for deleted habits', () => {
    const habits = [makeHabit('active-good', 'good', '2026-03-01')];

    HabitStorage.saveLogs([
      makeLog('deleted-habit', '2026-03-18', true),
      makeLog('active-good', '2026-03-19', true),
    ]);

    const completedDates = getCompletedDatesSet(habits);

    expect(completedDates.has('2026-03-18')).toBe(false);
    expect(completedDates.has('2026-03-19')).toBe(true);
  });
});
