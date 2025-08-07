import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MobileDialogContent } from '@/components/ui/mobile-dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  BarChart3,
  Clock,
  Award,
  X
} from 'lucide-react';
import { Habit, HabitType } from '@/shared/schema';
import { getHabitStats, getAllHabitLogs } from '@/lib/habit-storage';
import { formatLocalDate } from '@/lib/utils';
import { format, startOfDay, isToday, subDays, eachDayOfInterval } from 'date-fns';
import { useMobileBackNavigation } from '@/hooks/use-mobile-back-navigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
}

interface DayLog {
  date: Date;
  habits: {
    id: string;
    name: string;
    type: HabitType;
    completed: boolean;
  }[];
}

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export function HistoryDialog({ open, onOpenChange, habits }: HistoryDialogProps) {
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
  const statistics = useMemo(() => {
    const today = startOfDay(new Date());
    const habitsActiveToday = habits.filter(habit => {
      const habitCreatedDate = startOfDay(habit.createdAt);
      return habitCreatedDate <= today;
    }).length;

    const stats = {
      totalHabits: habits.length,
      goodHabits: habits.filter(h => h.type === 'good').length,
      badHabits: habits.filter(h => h.type === 'bad').length,
      habitsActiveToday,
      totalStreak: 0,
      longestStreak: 0,
      todayCompletion: 0,
      weeklyCompletion: 0,
      totalActions: 0
    };

    habits.forEach(habit => {
      const habitStats = getHabitStats(habit.id);
      stats.totalStreak += habitStats.currentStreak;
      stats.longestStreak = Math.max(stats.longestStreak, habitStats.longestStreak);
      stats.totalActions += habitStats.totalCompletions;
      
      // Today completion - only count habits that existed today
      const habitCreatedDate = startOfDay(habit.createdAt);
      const today = startOfDay(new Date());
      
      if (habitCreatedDate <= today) {
        const logs = getAllHabitLogs(habit.id);
        const todayStr = formatLocalDate(new Date()); // Use local timezone
        if (logs.some((log: any) => log.date === todayStr && log.completed === true)) {
          stats.todayCompletion++;
        }
      }
      
      // Weekly completion - only count habits that existed on each day
      const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
      });
      
      const weeklyCompletions = last7Days.filter(day => {
        const dayStart = startOfDay(day);
        if (habitCreatedDate <= dayStart) {
          const dayStr = formatLocalDate(day); // Use local timezone
          const logs = getAllHabitLogs(habit.id);
          return logs.some((log: any) => log.date === dayStr && log.completed === true);
        }
        return false;
      }).length;
      
      stats.weeklyCompletion += weeklyCompletions;
    });

    return stats;
  }, [habits]);

  // Create daily logs for timeline view
  const dailyLogs = useMemo((): DayLog[] => {
    const logs: DayLog[] = [];
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    last30Days.forEach(date => {
      const dayLog: DayLog = {
        date,
        habits: habits
          .filter(habit => {
            // Only include habits that existed on this date
            const habitCreatedDate = startOfDay(habit.createdAt);
            const currentDate = startOfDay(date);
            return habitCreatedDate <= currentDate;
          })
          .map(habit => {
            const habitLogs = getAllHabitLogs(habit.id);
            // Use local timezone for consistent date handling
            const dateStr = formatLocalDate(date);
            // Check if there's a completed log for this date
            const completed = habitLogs.some((log: any) => log.date === dateStr && log.completed === true);
            
            return {
              id: habit.id,
              name: habit.name,
              type: habit.type,
              completed
            };
          })
      };
      logs.push(dayLog);
    });

    return logs.reverse(); // Most recent first
  }, [habits]);

  // Statistics cards
  const statCards: StatCard[] = [
    {
      title: 'Total Habits',
      value: statistics.totalHabits,
      icon: <Target className="w-5 h-5" />,
      description: `${statistics.goodHabits} good, ${statistics.badHabits} bad`,
      color: 'text-blue-500'
    },
    {
      title: 'Current Streaks',
      value: statistics.totalStreak,
      icon: <Flame className="w-5 h-5" />,
      description: `Longest: ${statistics.longestStreak} days`,
      color: 'text-orange-500'
    },
    {
      title: 'Today\'s Progress',
      value: `${statistics.todayCompletion}/${statistics.habitsActiveToday}`,
      icon: <CheckCircle className="w-5 h-5" />,
      description: `${Math.round((statistics.todayCompletion / Math.max(statistics.habitsActiveToday, 1)) * 100)}% completed`,
      color: 'text-green-500'
    },
    {
      title: 'Total Actions',
      value: statistics.totalActions,
      icon: <Award className="w-5 h-5" />,
      description: 'All time completions',
      color: 'text-purple-500'
    }
  ];

  // Get selected day data
  const selectedDayLog = selectedDate ? 
    dailyLogs.find(log => formatLocalDate(log.date) === formatLocalDate(selectedDate)) 
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MobileDialogContent className={`material-radius-lg surface-elevation-3 [&>button]:hidden ${isMobile ? "w-full max-w-full p-0 flex flex-col h-auto gap-0" : "w-[900px] h-[700px] max-w-[900px] max-h-[700px] flex flex-col items-stretch justify-start"}`}>
        <DialogHeader className="px-6 py-4 border-b bg-background z-10 flex-shrink-0 space-y-0 !flex-row !text-left relative">
          <div className="flex items-center w-full justify-between">
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Habit History & Analytics
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center w-6 h-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none hover:bg-accent"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>

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

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
            <div className="h-full overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-3 sm:mb-6">
                <div className="space-y-3 sm:space-y-4">
                  {statCards.slice(0, 2).map((stat, index) => (
                    <Card key={index} className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </div>
                        <div className={`p-2 sm:p-3 rounded-full bg-muted ${stat.color}`}>
                          {stat.icon}
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {/* Mobile-only Habit Breakdown */}
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
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {stats.currentStreak}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {statCards.slice(2).map((stat, index) => (
                    <Card key={index + 2} className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </div>
                        <div className={`p-2 sm:p-3 rounded-full bg-muted ${stat.color}`}>
                          {stat.icon}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Desktop-only Habit Breakdown */}
              <Card className="p-3 sm:p-4 hidden sm:block">
                <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Habit Breakdown</h3>
                <ScrollArea className="h-40 sm:h-48">
                  <div className="space-y-2 sm:space-y-3">
                    {habits.map(habit => {
                      const stats = getHabitStats(habit.id);
                      return (
                        <div key={habit.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            {habit.type === 'good' ? (
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium truncate">{habit.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {stats.totalCompletions} completions
                              </p>
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
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="flex-1 overflow-hidden mt-0">
            <div className="h-full overflow-y-auto">
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <div className="flex justify-center w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-lg border"
                    modifiers={{
                      completed: (date) => {
                        const dateStr = formatLocalDate(date); // Use local timezone
                        return dailyLogs.some(log => 
                          formatLocalDate(log.date) === dateStr && 
                          log.habits.some(h => h.completed === true)
                        );
                      }
                    }}
                    modifiersStyles={{
                      completed: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
                    }}
                  />
                </div>
                
                {selectedDate && (
                  <div className="w-full max-w-md mx-auto">
                    <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-center">
                      {format(selectedDate, 'MMMM d, yyyy')}
                      {isToday(selectedDate) && (
                        <Badge variant="secondary" className="ml-2 text-xs">Today</Badge>
                      )}
                    </h3>
                  
                  {selectedDayLog ? (
                    <ScrollArea className="h-48 sm:h-64">
                      <div className="space-y-2">
                        {selectedDayLog.habits.map(habit => (
                          <div 
                            key={habit.id} 
                            className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                              habit.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              {habit.type === 'good' ? (
                                <CheckCircle className={`w-4 h-4 ${habit.completed ? 'text-green-500' : 'text-muted-foreground'} flex-shrink-0`} />
                              ) : (
                                <XCircle className={`w-4 h-4 ${habit.completed ? 'text-red-500' : 'text-muted-foreground'} flex-shrink-0`} />
                              )}
                              <span className={`text-xs sm:text-sm truncate ${habit.completed ? 'font-medium' : 'text-muted-foreground'}`}>
                                {habit.name}
                              </span>
                            </div>
                            {habit.completed && (
                              <Badge variant="outline" className="text-green-600 border-green-600 text-xs flex-shrink-0">
                                ✓
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
                      No data available for this date
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="flex-1 overflow-hidden mt-0">
            <div className="h-full overflow-y-auto">
              <div className="space-y-3 sm:space-y-4">
                {dailyLogs.map((log, index) => {
                  const completedCount = log.habits.filter(h => h.completed).length;
                  const totalHabitsForDay = log.habits.length; // This already filters habits by creation date
                  const completionRate = totalHabitsForDay > 0 ? (completedCount / totalHabitsForDay) * 100 : 0;
                  
                  return (
                    <Card key={index} className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-base font-medium">
                            <span className="hidden sm:inline">{format(log.date, 'EEEE, MMMM d')}</span>
                            <span className="sm:hidden">{format(log.date, 'MMM d')}</span>
                            {isToday(log.date) && (
                              <Badge variant="secondary" className="ml-2 text-xs">Today</Badge>
                            )}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {completedCount}/{totalHabitsForDay} habits completed ({Math.round(completionRate)}%)
                          </p>
                        </div>
                        <div className="flex gap-1 flex-wrap max-w-[100px] sm:max-w-none">
                          {log.habits.map(habit => (
                            <div
                              key={habit.id}
                              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                                habit.completed 
                                  ? habit.type === 'good' ? 'bg-green-500' : 'bg-red-500'
                                  : 'bg-muted-foreground/20'
                              }`}
                              title={`${habit.name}: ${habit.completed ? 'Completed' : 'Not completed'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </MobileDialogContent>
    </Dialog>
  );
}
