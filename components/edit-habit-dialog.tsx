import { useState } from "react";
import { Habit, HabitType, HabitSchedule, HabitScheduleType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditHabit: (id: string, name: string, type: HabitType, schedule?: HabitSchedule) => void;
  habit: Habit | null;
}

export function EditHabitDialog({ open, onOpenChange, onEditHabit, habit }: EditHabitDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("good");
  const [scheduleType, setScheduleType] = useState<HabitScheduleType>("daily");
  const [intervalDays, setIntervalDays] = useState(2);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);

  // Adjust state during render when habit prop changes (React-approved pattern)
  const [prevHabit, setPrevHabit] = useState(habit);
  if (habit !== prevHabit) {
    setPrevHabit(habit);
    if (habit) {
      setName(habit.name);
      setType(habit.type);
      const sch = habit.schedule ?? { type: "daily" as const };
      setScheduleType(sch.type);
      setIntervalDays(sch.intervalDays ?? 2);
      setDaysOfWeek(sch.daysOfWeek ?? []);
    }
  }

  const buildSchedule = (): HabitSchedule => {
    switch (scheduleType) {
      case "interval":
        return { type: "interval", intervalDays: Math.max(2, intervalDays) };
      case "weekly":
        return { type: "weekly", daysOfWeek: daysOfWeek.length > 0 ? [...daysOfWeek].sort() : undefined };
      default:
        return { type: "daily" };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && habit) {
      onEditHabit(habit.id, name.trim(), type, buildSchedule());
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (habit) {
      setName(habit.name);
      setType(habit.type);
      const sch = habit.schedule ?? { type: "daily" as const };
      setScheduleType(sch.type);
      setIntervalDays(sch.intervalDays ?? 2);
      setDaysOfWeek(sch.daysOfWeek ?? []);
    }
    onOpenChange(false);
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  if (!habit) return null;

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} drawerSize="compact">
      <ResponsiveDialogContent dialogClassName="w-full max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit Habit</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <form id="edit-habit-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Habit Name Input */}
            <div className="space-y-2">
              <Label htmlFor="edit-habit-name" className="text-sm font-medium">
                Habit Name
              </Label>
              <Input
                id="edit-habit-name"
                type="text"
                placeholder="Enter habit name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="material-radius focus:border-primary"
                required
              />
            </div>

            {/* Habit Type Segmented Button */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Habit Type</Label>
              <div className="flex border border-border material-radius overflow-hidden">
                <Button
                  type="button"
                  variant={type === "good" ? "default" : "ghost"}
                  className={`flex-1 material-radius-none ${
                    type === "good"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "hover:bg-green-50 hover:text-green-700"
                  }`}
                  onClick={() => setType("good")}
                >
                  Good
                </Button>
                <Button
                  type="button"
                  variant={type === "bad" ? "default" : "ghost"}
                  className={`flex-1 material-radius-none ${
                    type === "bad"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "hover:bg-red-50 hover:text-red-700"
                  }`}
                  onClick={() => setType("bad")}
                >
                  Bad
                </Button>
              </div>
            </div>

            {/* Schedule Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Schedule</Label>
              <div className="flex border border-border material-radius overflow-hidden">
                {(["daily", "interval", "weekly"] as const).map((st) => (
                  <Button
                    key={st}
                    type="button"
                    onClick={() => setScheduleType(st)}
                    className={`flex-1 material-radius-none text-xs font-medium transition-all duration-200 ${
                      scheduleType === st
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "bg-background hover:bg-muted text-foreground"
                    }`}
                    variant="ghost"
                  >
                    {st === "daily" ? "Daily" : st === "interval" ? "Every N Days" : "Weekdays"}
                  </Button>
                ))}
              </div>

              {/* Interval days input */}
              {scheduleType === "interval" && (
                <div className="flex items-center gap-2 mt-2">
                  <Label htmlFor="edit-interval-days" className="text-sm text-muted-foreground whitespace-nowrap">
                    Every
                  </Label>
                  <Input
                    id="edit-interval-days"
                    type="number"
                    min={2}
                    max={365}
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(parseInt(e.target.value) || 2)}
                    className="w-20 material-radius"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              )}

              {/* Weekday multi-select */}
              {scheduleType === "weekly" && (
                <div className="grid grid-cols-7 gap-1.5 mt-2">
                  {WEEKDAY_LABELS.map((label, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      size="sm"
                      onClick={() => toggleDay(idx)}
                      className={`h-8 w-full text-xs font-medium transition-all duration-200 ${
                        daysOfWeek.includes(idx)
                          ? "bg-primary hover:bg-primary/90 text-white"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                      variant="ghost"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <div className="flex space-x-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 material-radius"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-habit-form"
              className="flex-1 material-radius cta-color-hover text-white"
              disabled={!name.trim()}
            >
              Save Changes
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
