// Modular AddEntryButton component
function AddEntryButton({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <div className="w-full flex justify-center mt-4">
      <Button
        type="button"
        size="sm"
        variant="default"
        onClick={onClick}
      >
        + Add Entry
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
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EditEntryDialog } from './edit-entry-dialog';
import { AddEntryDialog } from './add-entry-dialog';
import { MobileDialogContent } from '@/components/ui/mobile-dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  X
} from 'lucide-react';
import { Habit } from '@/shared/schema';
import { getHabitStats } from '@/lib/habit-storage';
import { formatLocalDate } from '@/lib/utils';
import { buildDailyLogs, computeStatSummary, DayLog } from '@/lib/history';
import { format, isToday } from 'date-fns';
import { useMobileBackNavigation } from '@/hooks/use-mobile-back-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHabits } from '@/hooks/use-habits';

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
  addOrUpdateLog: (habitId: string, date: string, completed: boolean) => void;
}

// DayLog moved to lib/history.ts

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export function HistoryDialog({ open, onOpenChange, habits, addOrUpdateLog }: HistoryDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTab, setSelectedTab] = useState('overview');
  const isMobile = useIsMobile();

  // Handle mobile back navigation
  useMobileBackNavigation({
    onBackPressed: () => {
      onOpenChange(false);
    },
    isActive: open
  });

  // Calculate comprehensive statistics
  const statistics = useMemo(() => computeStatSummary(habits), [habits]);

  // Create daily logs for timeline view
  const dailyLogs = useMemo((): DayLog[] => buildDailyLogs(habits, 30), [habits]);

  // Stat cards are rendered via StatGrid

  const selectedDayLog = selectedDate ? dailyLogs.find(log => formatLocalDate(log.date) === formatLocalDate(selectedDate)) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MobileDialogContent className={`material-radius-lg surface-elevation-3 [&>button]:hidden ${isMobile ? 'w-full max-w-full p-0 flex flex-col h-auto gap-0' : 'w-[900px] h-[700px] max-w-[900px] max-h-[700px] flex flex-col items-stretch justify-start'}`}>
        <HistoryHeader onClose={() => onOpenChange(false)} />
        <div className="flex-1 overflow-y-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 min-h-0 flex flex-col px-6 pt-4 pb-6">
            <TabsList className="grid w-full grid-cols-3 h-auto mb-3 sm:mb-6 flex-shrink-0">
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

            <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
              <OverviewTabContent habits={habits} statistics={statistics} />
            </TabsContent>

            <TabsContent value="calendar" className="flex-1 overflow-hidden mt-0">
              <CalendarTabContent selectedDate={selectedDate} setSelectedDate={setSelectedDate} dailyLogs={dailyLogs} selectedDayLog={selectedDayLog} addOrUpdateLog={addOrUpdateLog} habits={habits} addHabit={useHabits().addHabit} />
            </TabsContent>

            <TabsContent value="timeline" className="flex-1 overflow-hidden mt-0">
              <TimelineTabContent dailyLogs={dailyLogs} />
            </TabsContent>
          </Tabs>
        </div>
      </MobileDialogContent>
    </Dialog>
  );
}

function HistoryHeader({ onClose }: { onClose: () => void }) {
  return (
    <DialogHeader className="px-6 py-4 border-b bg-background z-10 flex-shrink-0 space-y-0 !flex-row !text-left relative">
      <div className="flex items-center w-full justify-between">
        <DialogTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Habit History & Analytics
        </DialogTitle>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-6 h-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none hover:bg-accent"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </DialogHeader>
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
      title: "Current Streaks",
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
    <Card className="p-3 sm:hidden">
      <h3 className="text-sm font-semibold mb-3">Top Habits</h3>
      <ScrollArea className="h-40">
        <div className="space-y-2">
          {habits.slice(0, 3).map(habit => {
            const stats = getHabitStats(habit.id);
            return (
              <div key={habit.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {habit.type === 'good' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{habit.name}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs flex-shrink-0">{stats.currentStreak}</Badge>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}

function HabitBreakdown({ habits }: { habits: Habit[] }) {
  return (
    <Card className="p-3 sm:p-4 hidden sm:block">
      <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Habit Breakdown</h3>
      <ScrollArea className="h-40 sm:h-48">
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
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  ) : habit.type === 'good' ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate">{habit.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stats.totalCompletions} completions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <Flame className="w-3 h-3" />
                    {stats.currentStreak}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}

function OverviewTabContent({ habits, statistics }: { habits: Habit[]; statistics: ReturnType<typeof computeStatSummary> }) {
  return (
    <div className="h-full overflow-y-auto">
      <StatGrid statistics={statistics} />
      <TopHabits habits={habits} />
      <HabitBreakdown habits={habits} />
    </div>
  );
}

function CalendarTabContent({
  selectedDate,
  setSelectedDate,
  dailyLogs,
  selectedDayLog,
  addOrUpdateLog,
  habits,
  addHabit,
}: {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  dailyLogs: DayLog[];
  selectedDayLog: DayLog | null | undefined;
  addOrUpdateLog: (habitId: string, date: string, completed: boolean) => void;
  habits: Habit[];
  addHabit: (habit: { name: string; type: "good" | "bad" }) => Habit;
}) {
  // Edit Entry dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [editCompleted, setEditCompleted] = useState<boolean | null>(null);

  // Add Entry dialog state
  const [addEntryDialogOpen, setAddEntryDialogOpen] = useState(false);

  // Get formatted date string
  const formattedDate = selectedDate ? formatLocalDate(selectedDate) : "";


  // Accept the DayLog habit type for editing
  type DayLogHabit = {
    id: string;
    name: string;
    type: Habit["type"];
    completed: boolean;
  };

  const handleEditClick = (habit: DayLogHabit, completed: boolean) => {
    // Convert to Habit type with minimal fields for dialog
    setEditHabit({
      id: habit.id,
      name: habit.name,
      type: habit.type,
      streak: 0,
      createdAt: new Date(),
    } as Habit);
    setEditCompleted(completed);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (completed: boolean) => {
    if (editHabit && formattedDate) {
      addOrUpdateLog(editHabit.id, formattedDate, completed);
    }
    setEditDialogOpen(false);
    setEditHabit(null);
    setEditCompleted(null);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center gap-4 sm:gap-6">
        <div className="flex justify-center w-full">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-lg border"
            modifiers={{
              completed: date => {
                const dateStr = formatLocalDate(date);
                return dailyLogs.some(log => formatLocalDate(log.date) === dateStr && log.habits.some(h => h.completed === true));
              },
            }}
          />
        </div>

        {selectedDate && (
          <div className="w-full max-w-md mx-auto">
            <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-center">
              {format(selectedDate, 'MMMM d, yyyy')}
              {isToday(selectedDate) && <Badge variant="secondary" className="ml-2 text-xs">Today</Badge>}
            </h3>

            {/* Habit list or no data message */}
              {selectedDayLog && selectedDayLog.habits.length > 0 ? (
                <ScrollArea className="max-h-64 sm:max-h-72 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedDayLog.habits.map(habit => {
                      // Determine status and colors
                      let bgClass = "bg-muted";
                      let icon = null;
                      const iconClass = "w-4 h-4 flex-shrink-0";
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
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(habit, habit.completed)}
                              className="ml-2"
                            >
                              Edit Entry
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                selectedDate && (
                  <div className="text-center text-muted-foreground text-sm flex flex-col items-center">
                    <span>No data available for this date</span>
                  </div>
                )
              )}
              {/* Only show AddEntryButton for today/past dates with no logs */}
              <AddEntryButton
                show={
                  !!selectedDate && (
                    isToday(selectedDate) ||
                    (isPastOrToday(selectedDate) && !isToday(selectedDate) && (!selectedDayLog || selectedDayLog.habits.length === 0))
                  )
                }
                onClick={() => setAddEntryDialogOpen(true)}
              />
            {/* AddEntryDialog modal */}
            {addEntryDialogOpen && (
              <AddEntryDialog
                open={addEntryDialogOpen}
                onOpenChange={setAddEntryDialogOpen}
                habits={habits}
                date={formattedDate}
                addOrUpdateLog={addOrUpdateLog}
                addHabit={addHabit}
              />
            )}
            {/* Edit Entry Dialog */}
            {editHabit && (
              <React.Suspense fallback={null}>
                <EditEntryDialog
                  open={editDialogOpen}
                  onOpenChange={setEditDialogOpen}
                  habit={editHabit}
                  date={formattedDate}
                  completed={editCompleted}
                  onSave={handleSaveEdit}
                />
              </React.Suspense>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineTabContent({ dailyLogs }: { dailyLogs: DayLog[] }) {
  return (
    <div className="h-full overflow-y-auto">
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
                <div className="flex gap-1 flex-wrap max-w-[100px] sm:max-w-none">
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
    </div>
  );
}
