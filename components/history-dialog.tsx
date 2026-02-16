// Modular AddEntryButton component
function AddEntryButton({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <div className="w-full flex justify-center mt-4">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60"
        onClick={onClick}
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Entry
      </Button>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
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
import { buildDailyLogs, buildDayLog, getCompletedDatesSet, computeStatSummary, DayLog } from '@/lib/history';
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
            Habit History & Analytics
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="flex-1 min-h-0 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 h-auto mb-3 sm:mb-6 shrink-0">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Timeline
              </TabsTrigger>
            </TabsList>

            <div ref={swipeRef} className="flex-1 min-h-0">
              <TabsContent value="overview" className="flex-1 min-h-0 mt-0 flex flex-col">
                <OverviewTabContent habits={habits} statistics={statistics} />
              </TabsContent>

              <TabsContent value="calendar" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden mt-0">
                <CalendarTabContent selectedDate={selectedDate} setSelectedDate={setSelectedDate} completedDates={completedDates} selectedDayLog={selectedDayLog} removeLog={removeLog} onRequestAddEntry={onRequestAddEntry} onRequestEditEntry={onRequestEditEntry} />
              </TabsContent>

              <TabsContent value="timeline" className="flex-1 min-h-0 overflow-y-auto mt-0">
                <TimelineTabContent dailyLogs={dailyLogs} />
              </TabsContent>
            </div>
          </Tabs>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function StatGrid({ statistics }: { statistics: ReturnType<typeof computeStatSummary> }) {
  const cards: StatCard[] = [
    {
      title: 'Total Habits',
      value: statistics.totalHabits,
      icon: <Target className="w-5 h-5" />,
      description: `${statistics.goodHabits} good, ${statistics.badHabits} bad`,
      color: 'text-blue-500',
    },
    {
      title: "Combined Streak",
      value: statistics.totalStreak,
      icon: <Flame className="w-5 h-5" />,
      description: `Longest: ${statistics.longestStreak} days`,
      color: 'text-orange-500',
    },
    {
      title: "Today's Progress",
      value: `${statistics.todayCompletion}/${statistics.habitsActiveToday}`,
      icon: <CheckCircle className="w-5 h-5" />,
      description: `${Math.round((statistics.todayCompletion / Math.max(statistics.habitsActiveToday, 1)) * 100)}% completed`,
      color: 'text-green-500',
    },
    {
      title: 'Total Actions',
      value: statistics.totalActions,
      icon: <Award className="w-5 h-5" />,
      description: 'All time completions',
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

function TopHabits({ habits }: { habits: Habit[] }) {
  return (
    <Card className="p-3 flex flex-col flex-1 min-h-0 sm:hidden">
      <h3 className="text-sm font-semibold mb-3 shrink-0">Top Habits</h3>
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

function HabitBreakdown({ habits }: { habits: Habit[] }) {
  return (
    <Card className="p-3 sm:p-4 hidden sm:flex sm:flex-col sm:flex-1 sm:min-h-0">
      <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 shrink-0">Habit Breakdown</h3>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <ListChecks className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No habits yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Add a habit to see your breakdown here
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
                    <p className="text-xs sm:text-sm text-muted-foreground">{stats.totalCompletions} completions</p>
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

function OverviewTabContent({ habits, statistics }: { habits: Habit[]; statistics: ReturnType<typeof computeStatSummary> }) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StatGrid statistics={statistics} />
      <TopHabits habits={habits} />
      <HabitBreakdown habits={habits} />
    </div>
  );
}

function CalendarTabContent({
  selectedDate,
  setSelectedDate,
  completedDates,
  selectedDayLog,
  removeLog,
  onRequestAddEntry,
  onRequestEditEntry,
}: {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  completedDates: Set<string>;
  selectedDayLog: DayLog | null | undefined;
  removeLog: (habitId: string, date: string) => void;
  onRequestAddEntry: (date: string) => void;
  onRequestEditEntry: (habit: Habit, date: string, completed: boolean | null) => void;
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
              completed: date => completedDates.has(formatLocalDate(date)),
            }}
            modifiersClassNames={{
              completed: "!bg-green-100 dark:!bg-green-900/30 !rounded-md",
            }}
          />
        </div>

        {selectedDate && (
          <div className="w-full mx-auto">
            <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-center">
              {format(selectedDate, 'MMMM d, yyyy')}
              {isToday(selectedDate) && <Badge variant="secondary" className="ml-2 text-xs">Today</Badge>}
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
                            <span title="Not Tracked" aria-label="Not Tracked">
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
                          // Avoided
                          bgClass = "bg-blue-50 dark:bg-blue-900/20";
                          icon = <CheckCircle className={iconClass + " text-blue-500"} />;
                          nameClass = "text-xs sm:text-sm truncate font-medium";
                        } else {
                          // Done
                          bgClass = "bg-red-50 dark:bg-red-900/20";
                          icon = <XCircle className={iconClass + " text-red-500"} />;
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
                              title="Edit entry"
                            >
                              <Pencil className="w-4 h-4" />
                              <span className="sr-only">Edit entry</span>
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
                                title="Clear status"
                              >
                                <Undo2 className="w-4 h-4" />
                                <span className="sr-only">Clear status</span>
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
                    <span>No data available for this date</span>
                  </div>
                )
              )}
              {/* Show AddEntryButton for any past or today date (not future) */}
              <AddEntryButton
                show={!!selectedDate && isPastOrToday(selectedDate)}
                onClick={() => onRequestAddEntry(formattedDate)}
              />
          </div>
        )}
    </div>
  );
}

function TimelineTabContent({ dailyLogs }: { dailyLogs: DayLog[] }) {
  return (
    <div className="space-y-3 sm:space-y-4">
        {dailyLogs.map((log, index) => {
          const completedCount = log.habits.filter(h => h.completed).length;
          const totalHabitsForDay = log.habits.length;
          const completionRate = totalHabitsForDay > 0 ? (completedCount / totalHabitsForDay) * 100 : 0;

          return (
            <Card key={index} className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-medium">
                    <span className="hidden sm:inline">{format(log.date, 'EEEE, MMMM d')}</span>
                    <span className="sm:hidden">{format(log.date, 'MMM d')}</span>
                    {isToday(log.date) && <Badge variant="secondary" className="ml-2 text-xs">Today</Badge>}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {completedCount}/{totalHabitsForDay} habits completed ({Math.round(completionRate)}%)
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
                          title={`${habit.name}: Not Tracked`}
                          aria-label="Not Tracked"
                        >
                          {/* Optionally, could use a small ? icon inside dot, but keep simple for now */}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={habit.id}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${habit.completed ? (habit.type === 'good' ? 'bg-green-500' : 'bg-red-500') : 'bg-muted-foreground/20'}`}
                        title={`${habit.name}: ${habit.completed ? 'Completed' : 'Not completed'}`}
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
