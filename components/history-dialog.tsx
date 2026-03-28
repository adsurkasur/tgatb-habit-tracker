// Modular AddEntryButton component
function AddEntryButton({ show, onClick, label, date }: { show: boolean; onClick: (date: string) => void; label: string; date: string }) {
  if (!show) return null;
  return (
    <div className="w-full flex justify-center mt-4">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60"
        onClick={() => {
          if (date) onClick(date);
        }}
      >
        <Plus className="w-4 h-4 mr-1" />
        {label}
      </Button>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
// Helper to check if a date is today or in the past (date-only, local)
function isPastOrToday(date: Date) {
  const today = new Date();
  return formatLocalDate(date) <= formatLocalDate(today);
}
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSwipeableTabs } from '@/hooks/use-swipeable-tabs';
import { Calendar } from '@/components/ui/calendar';

import {
  Calendar as CalendarIcon,
  TrendingUp,
  Target,
  Flame,
  CheckCircle,
  XCircle,
  HelpCircle,
  BarChart3,
  Clock,
  Award,
  Pencil,
  Plus,
  Undo2,
  ListChecks,
} from 'lucide-react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody,
} from '@/components/ui/responsive-dialog';
import { Habit } from '@/shared/schema';
import { getHabitStats } from '@/lib/habit-storage';
import { formatLocalDate } from '@/lib/utils';
import { buildDailyLogs, buildDayLog, getCompletedDatesSet, getNegativeDatesSet, computeStatSummary, DayLog } from '@/lib/history';
import { format, isToday } from 'date-fns';

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];

  removeLog: (habitId: string, date: string) => void;
  /** Callback to open the AddEntryDialog for a given date (hoisted to page level) */
  onRequestAddEntry: (date: string) => void;
  /** Callback to open the EditEntryDialog for a given habit/date/status (hoisted to page level) */
  onRequestEditEntry: (habit: Habit, date: string, completed: boolean | null) => void;
}

// DayLog moved to lib/history.ts

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export function HistoryDialog({ open, onOpenChange, habits, removeLog, onRequestAddEntry, onRequestEditEntry }: HistoryDialogProps) {
  const t = useTranslations('HistoryDialog');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTab, setSelectedTab] = useState('overview');
  const { containerRef: swipeRef } = useSwipeableTabs({
    tabs: ['overview', 'calendar', 'timeline'],
    activeTab: selectedTab,
    onTabChange: setSelectedTab,
  });

  // Calculate comprehensive statistics
  const statistics = useMemo(() => computeStatSummary(habits), [habits]);

  // Create daily logs for timeline view
  const dailyLogs = useMemo((): DayLog[] => buildDailyLogs(habits, 30), [habits]);

  // Set of all dates with at least one completion (for calendar dots)
  const completedDates = useMemo(() => getCompletedDatesSet(habits), [habits]);
  const negativeDates = useMemo(() => getNegativeDatesSet(habits), [habits]);

  // Build day log on-demand for any selected date (not limited to 30 days)
  const selectedDayLog = useMemo(
    () => (selectedDate && isPastOrToday(selectedDate) ? buildDayLog(habits, selectedDate) : null),
    [selectedDate, habits]
  );

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent dialogClassName="w-full max-w-2xl h-[85vh] flex flex-col" drawerClassName="flex flex-col">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t('title')}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="flex-1 min-h-0 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 h-auto mb-3 sm:mb-6 shrink-0">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('tabs.overview')}</span>
                <span className="sm:hidden">{t('tabs.stats')}</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                {t('tabs.calendar')}
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                {t('tabs.timeline')}
              </TabsTrigger>
            </TabsList>

            {/* Swipe container — must be flex-col so child TabsContent can use flex-1 for height */}
            <div ref={swipeRef} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <TabsContent value="overview" className="flex-1 min-h-0 mt-0 flex flex-col overflow-y-auto">
                <OverviewTabContent habits={habits} statistics={statistics} t={t} />
              </TabsContent>

              <TabsContent value="calendar" className="flex-1 min-h-0 mt-0 overflow-y-auto overflow-x-hidden">
                <CalendarTabContent selectedDate={selectedDate} setSelectedDate={setSelectedDate} completedDates={completedDates} negativeDates={negativeDates} selectedDayLog={selectedDayLog} removeLog={removeLog} onRequestAddEntry={onRequestAddEntry} onRequestEditEntry={onRequestEditEntry} t={t} />
              </TabsContent>

              <TabsContent value="timeline" className="flex-1 min-h-0 mt-0 overflow-y-auto">
                <TimelineTabContent dailyLogs={dailyLogs} t={t} />
              </TabsContent>
            </div>
          </Tabs>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function StatGrid({ statistics, t }: { statistics: ReturnType<typeof computeStatSummary>; t: (key: string, values?: Record<string, string | number>) => string }) {
  const cards: StatCard[] = [
    {
      title: t('stats.totalHabits.title'),
      value: statistics.totalHabits,
      icon: <Target className="w-5 h-5" />,
      description: t('stats.totalHabits.description', { good: statistics.goodHabits, bad: statistics.badHabits }),
      color: 'text-blue-500',
    },
    {
      title: t('stats.combinedStreak.title'),
      value: statistics.totalStreak,
      icon: <Flame className="w-5 h-5" />,
      description: t('stats.combinedStreak.description', { longest: statistics.longestStreak }),
      color: 'text-orange-500',
    },
    {
      title: t('stats.todaysProgress.title'),
      value: `${statistics.todayCompletion}/${statistics.habitsActiveToday}`,
      icon: <CheckCircle className="w-5 h-5" />,
      description: t('stats.todaysProgress.description', { percent: Math.round((statistics.todayCompletion / Math.max(statistics.habitsActiveToday, 1)) * 100) }),
      color: 'text-green-500',
    },
    {
      title: t('stats.totalActions.title'),
      value: statistics.totalActions,
      icon: <Award className="w-5 h-5" />,
      description: t('stats.totalActions.description'),
      color: 'text-purple-500',
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-3 sm:mb-6">
      <div className="space-y-3 sm:space-y-4">
        {cards.slice(0, 2).map((stat, index) => (
          <Card key={index} className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full bg-muted ${stat.color}`}>{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {cards.slice(2).map((stat, index) => (
          <Card key={index + 2} className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full bg-muted ${stat.color}`}>{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TopHabits({ habits, t }: { habits: Habit[]; t: (key: string, values?: Record<string, string | number>) => string }) {
  return (
    <Card className="p-3 flex flex-col flex-1 min-h-48 sm:hidden">
      <h3 className="text-sm font-semibold mb-3 shrink-0">{t('topHabits.title')}</h3>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-2">
          {habits.slice(0, 3).map(habit => {
            const stats = getHabitStats(habit.id);
            return (
              <div key={habit.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {habit.type === 'good' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{habit.name}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{stats.currentStreak}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function HabitBreakdown({ habits, t }: { habits: Habit[]; t: (key: string, values?: Record<string, string | number>) => string }) {
  return (
    <Card className="p-3 sm:p-4 hidden sm:flex sm:flex-col sm:flex-1 sm:min-h-48">
      <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 shrink-0">{t('breakdown.title')}</h3>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <ListChecks className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t('breakdown.emptyTitle')}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {t('breakdown.emptyDescription')}
            </p>
          </div>
        ) : (
        <div className="space-y-2 sm:space-y-3">
          {habits.map(habit => {
            const stats = getHabitStats(habit.id);
            // Determine if habit is untracked for today
            const todayLog = buildDailyLogs([habit], 1)[0];
            const log = todayLog?.habits?.[0];
            const isUntracked = log && (log.completed === null || log.completed === undefined);
            return (
              <div key={habit.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {isUntracked ? (
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                  ) : habit.type === 'good' ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate">{habit.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('breakdown.completions', { count: stats.totalCompletions })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <Flame className="w-3 h-3" />
                    {stats.currentStreak}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </Card>
  );
}

function OverviewTabContent({ habits, statistics, t }: { habits: Habit[]; statistics: ReturnType<typeof computeStatSummary>; t: (key: string, values?: Record<string, string | number>) => string }) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StatGrid statistics={statistics} t={t} />
      <TopHabits habits={habits} t={t} />
      <HabitBreakdown habits={habits} t={t} />
    </div>
  );
}

function CalendarTabContent({
  selectedDate,
  setSelectedDate,
  completedDates,
  negativeDates,
  selectedDayLog,
  removeLog,
  onRequestAddEntry,
  onRequestEditEntry,
  t,
}: {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  completedDates: Set<string>;
  negativeDates: Set<string>;
  selectedDayLog: DayLog | null | undefined;
  removeLog: (habitId: string, date: string) => void;
  onRequestAddEntry: (date: string) => void;
  onRequestEditEntry: (habit: Habit, date: string, completed: boolean | null) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  // Get formatted date string
  const formattedDate = selectedDate ? formatLocalDate(selectedDate) : "";

  // Accept the DayLog habit type for editing
  type DayLogHabit = {
    id: string;
    name: string;
    type: Habit["type"];
    completed: boolean | null;
  };

  const handleEditClick = (habit: DayLogHabit, completed: boolean | null) => {
    // Convert to Habit type with minimal fields for the edit dialog
    const habitForEdit: Habit = {
      id: habit.id,
      name: habit.name,
      type: habit.type,
      streak: 0,
      createdAt: new Date(),
    } as Habit;
    onRequestEditEntry(habitForEdit, formattedDate, completed);
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      <div className="flex justify-center w-full">
        <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-lg border w-full sm:max-w-none [--cell-size:2rem] sm:[--cell-size:2.75rem]"
            disabled={{ after: new Date() }}
            modifiers={{
              completed: date => {
                const dateKey = formatLocalDate(date);
                return completedDates.has(dateKey) && !negativeDates.has(dateKey);
              },
              negative: date => negativeDates.has(formatLocalDate(date)),
            }}
            modifiersClassNames={{
              completed: "!bg-green-100 dark:!bg-green-900/30 !rounded-md",
              negative: "!bg-red-100 dark:!bg-red-900/30 !rounded-md",
            }}
          />
        </div>

        {selectedDate && (
          <div className="w-full mx-auto">
            <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-center">
              {format(selectedDate, 'MMMM d, yyyy')}
              {isToday(selectedDate) && <Badge variant="secondary" className="ml-2 text-xs">{t('calendar.today')}</Badge>}
            </h3>

            {/* Habit list or no data message */}
              {selectedDayLog && selectedDayLog.habits.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDayLog.habits.map(habit => {
                      // Determine status and colors
                      let bgClass = "bg-muted";
                      let icon = null;
                      const iconClass = "w-4 h-4 shrink-0";
                        let nameClass = "text-xs sm:text-sm truncate text-muted-foreground";
                        if (habit.completed === null || habit.completed === undefined) {
                          // Untracked state: grey background, question mark icon, tooltip
                          bgClass = "bg-gray-100 dark:bg-gray-800";
                          icon = (
                            <span title={t('calendar.notTracked')} aria-label={t('calendar.notTracked')}>
                              <HelpCircle className={iconClass + " text-gray-400"} />
                            </span>
                          );
                          // Keep font style and color normal for untracked
                          nameClass = "text-xs sm:text-sm truncate text-muted-foreground";
                        } else if (habit.type === "good") {
                        if (habit.completed) {
                          bgClass = "bg-green-50 dark:bg-green-900/20";
                          icon = <CheckCircle className={iconClass + " text-green-500"} />;
                          nameClass = "text-xs sm:text-sm truncate font-medium";
                        } else {
                          bgClass = "bg-red-50 dark:bg-red-900/20";
                          icon = <XCircle className={iconClass + " text-red-500"} />;
                        }
                      } else if (habit.type === "bad") {
                        if (habit.completed) {
                          // Done
                          bgClass = "bg-red-50 dark:bg-red-900/20";
                          icon = <XCircle className={iconClass + " text-red-500"} />;
                        } else {
                          // Avoided
                          bgClass = "bg-blue-50 dark:bg-blue-900/20";
                          icon = <CheckCircle className={iconClass + " text-blue-500"} />;
                          nameClass = "text-xs sm:text-sm truncate font-medium";
                        }
                      }
                      return (
                        <div
                          key={habit.id}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${bgClass}`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            {icon}
                            <span className={nameClass}>{habit.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditClick(habit, habit.completed)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                              title={t('calendar.editEntry')}
                            >
                              <Pencil className="w-4 h-4" />
                              <span className="sr-only">{t('calendar.editEntry')}</span>
                            </Button>
                            {habit.completed !== null && habit.completed !== undefined && (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  if (formattedDate) removeLog(habit.id, formattedDate);
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                title={t('calendar.clearStatus')}
                              >
                                <Undo2 className="w-4 h-4" />
                                <span className="sr-only">{t('calendar.clearStatus')}</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
              ) : (
                selectedDate && (
                  <div className="text-center text-muted-foreground text-sm flex flex-col items-center">
                    <span>{t('calendar.noDataForDate')}</span>
                  </div>
                )
              )}
              {/* Show AddEntryButton for any past or today date (not future) */}
              <AddEntryButton
                show={!!selectedDate && isPastOrToday(selectedDate)}
                  onClick={onRequestAddEntry}
                  date={formattedDate}
                label={t('calendar.addEntry')}
              />
          </div>
        )}
    </div>
  );
}

function TimelineTabContent({ dailyLogs, t }: { dailyLogs: DayLog[]; t: (key: string, values?: Record<string, string | number>) => string }) {
  return (
    <div className="space-y-3 sm:space-y-4">
        {dailyLogs.map((log, index) => {
          const completedCount = log.habits.filter(h =>
            h.completed !== null && (h.type === 'good' ? h.completed === true : h.completed === false)
          ).length;
          const totalHabitsForDay = log.habits.length;
          const completionRate = totalHabitsForDay > 0 ? (completedCount / totalHabitsForDay) * 100 : 0;

          return (
            <Card key={index} className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-medium">
                    <span className="hidden sm:inline">{format(log.date, 'EEEE, MMMM d')}</span>
                    <span className="sm:hidden">{format(log.date, 'MMM d')}</span>
                    {isToday(log.date) && <Badge variant="secondary" className="ml-2 text-xs">{t('timeline.today')}</Badge>}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('timeline.completionSummary', {
                      completed: completedCount,
                      total: totalHabitsForDay,
                      percent: Math.round(completionRate),
                    })}
                  </p>
                </div>
                <div className="flex gap-1 flex-wrap max-w-25 sm:max-w-none">
                  {log.habits.map(habit => {
                    if (habit.completed === null || habit.completed === undefined) {
                      // Untracked: grey dot, question mark tooltip
                      return (
                        <div
                          key={habit.id}
                          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-400"
                          title={t('timeline.notTrackedTitle', { name: habit.name })}
                          aria-label={t('timeline.notTracked')}
                        >
                          {/* Optionally, could use a small ? icon inside dot, but keep simple for now */}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={habit.id}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                          habit.type === 'good'
                            ? (habit.completed ? 'bg-green-500' : 'bg-red-500')
                            : (habit.completed ? 'bg-red-500' : 'bg-blue-500')
                        }`}
                        title={habit.completed ? t('timeline.completedTitle', { name: habit.name }) : t('timeline.notCompletedTitle', { name: habit.name })}
                      />
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
    </div>
  );
}
