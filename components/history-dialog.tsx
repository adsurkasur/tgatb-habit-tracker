import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Award
} from 'lucide-react';
import { Habit, HabitType } from '@/shared/schema';
import { getHabitStats, getAllHabitLogs } from '@/lib/habit-storage';
import { format, startOfDay, isToday, subDays, eachDayOfInterval } from 'date-fns';

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

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    const stats = {
      totalHabits: habits.length,
      goodHabits: habits.filter(h => h.type === 'good').length,
      badHabits: habits.filter(h => h.type === 'bad').length,
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
      
      // Today completion
      const logs = getAllHabitLogs(habit.id);
      const today = format(new Date(), 'yyyy-MM-dd');
      if (logs.some((log: any) => log.date === today)) {
        stats.todayCompletion++;
      }
      
      // Weekly completion
      const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
      });
      
      const weeklyCompletions = last7Days.filter(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        return logs.some((log: any) => log.date === dayStr);
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
        habits: habits.map(habit => {
          const habitLogs = getAllHabitLogs(habit.id);
          const dateStr = format(date, 'yyyy-MM-dd');
          const completed = habitLogs.some((log: any) => log.date === dateStr);
          
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
      value: `${statistics.todayCompletion}/${statistics.totalHabits}`,
      icon: <CheckCircle className="w-5 h-5" />,
      description: `${Math.round((statistics.todayCompletion / Math.max(statistics.totalHabits, 1)) * 100)}% completed`,
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
    dailyLogs.find(log => format(log.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) 
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Habit History & Analytics
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {statCards.map((stat, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Habit Breakdown */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Habit Breakdown</h3>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {habits.map(habit => {
                    const stats = getHabitStats(habit.id);
                    return (
                      <div key={habit.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          {habit.type === 'good' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{habit.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {stats.totalCompletions} completions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
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
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-lg border"
                  modifiers={{
                    completed: (date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return dailyLogs.some(log => 
                        format(log.date, 'yyyy-MM-dd') === dateStr && 
                        log.habits.some(h => h.completed)
                      );
                    }
                  }}
                  modifiersStyles={{
                    completed: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
                  }}
                />
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                  {selectedDate && isToday(selectedDate) && (
                    <Badge variant="secondary" className="ml-2">Today</Badge>
                  )}
                </h3>
                
                {selectedDayLog ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {selectedDayLog.habits.map(habit => (
                        <div 
                          key={habit.id} 
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            habit.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {habit.type === 'good' ? (
                              <CheckCircle className={`w-4 h-4 ${habit.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                            ) : (
                              <XCircle className={`w-4 h-4 ${habit.completed ? 'text-red-500' : 'text-muted-foreground'}`} />
                            )}
                            <span className={habit.completed ? 'font-medium' : 'text-muted-foreground'}>
                              {habit.name}
                            </span>
                          </div>
                          {habit.completed && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              ✓
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No data available for this date
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-6">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {dailyLogs.map((log, index) => {
                  const completedCount = log.habits.filter(h => h.completed).length;
                  const completionRate = log.habits.length > 0 ? (completedCount / log.habits.length) * 100 : 0;
                  
                  return (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">
                            {format(log.date, 'EEEE, MMMM d')}
                            {isToday(log.date) && (
                              <Badge variant="secondary" className="ml-2">Today</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {completedCount}/{log.habits.length} habits completed ({Math.round(completionRate)}%)
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {log.habits.map(habit => (
                            <div
                              key={habit.id}
                              className={`w-3 h-3 rounded-full ${
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
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
