import { useState } from "react";
import { HabitType, HabitSchedule, HabitScheduleType } from "@shared/schema";
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

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit: (name: string, type: HabitType, schedule?: HabitSchedule) => void;
}

export function AddHabitDialog({ open, onOpenChange, onAddHabit }: AddHabitDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("good");
  const [scheduleType, setScheduleType] = useState<HabitScheduleType>("daily");
  const [intervalDays, setIntervalDays] = useState(2);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);

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
    if (name.trim()) {
      onAddHabit(name.trim(), type, buildSchedule());
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setName("");
    setType("good");
    setScheduleType("daily");
    setIntervalDays(2);
    setDaysOfWeek([]);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} drawerSize="compact">
      <ResponsiveDialogContent dialogClassName="w-full max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Add New Habit</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <form id="add-habit-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Habit Name Input */}
            <div className="space-y-2">
              <Label htmlFor="habit-name" className="text-sm font-medium">
                Habit Name
              </Label>
              <Input
                id="habit-name"
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
                  onClick={() => setType("good")}
                  className={`flex-1 material-radius-none font-medium transition-all duration-200 ${
                    type === "good"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-background hover:bg-muted text-foreground"
                  }`}
                  variant="ghost"
                >
                  Good
                </Button>
                <Button
                  type="button"
                  onClick={() => setType("bad")}
                  className={`flex-1 material-radius-none font-medium transition-all duration-200 ${
                    type === "bad"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-background hover:bg-muted text-foreground"
                  }`}
                  variant="ghost"
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
                  <Label htmlFor="interval-days" className="text-sm text-muted-foreground whitespace-nowrap">
                    Every
                  </Label>
                  <Input
                    id="interval-days"
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
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {WEEKDAY_LABELS.map((label, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      size="sm"
                      onClick={() => toggleDay(idx)}
                      className={`h-8 w-10 text-xs font-medium transition-all duration-200 ${
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
          <div className="flex space-x-3 justify-end w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="px-6 material-radius state-layer-hover"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-habit-form"
              className="px-6 bg-primary hover:bg-primary/90 text-white material-radius surface-elevation-1"
            >
              Save
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
