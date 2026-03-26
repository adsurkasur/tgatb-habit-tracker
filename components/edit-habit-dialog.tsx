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
import { useTranslations } from "next-intl";

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditHabit: (id: string, name: string, type: HabitType, schedule?: HabitSchedule) => void;
  habit: Habit | null;
}

export function EditHabitDialog({ open, onOpenChange, onEditHabit, habit }: EditHabitDialogProps) {
  const t = useTranslations("EditHabitDialog");
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
          <ResponsiveDialogTitle>{t("title")}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <form id="edit-habit-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Habit Name Input */}
            <div className="space-y-2">
              <Label htmlFor="edit-habit-name" className="text-sm font-medium">
                {t("fields.name")}
              </Label>
              <Input
                id="edit-habit-name"
                type="text"
                placeholder={t("placeholders.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="material-radius focus:border-primary"
                required
              />
            </div>

            {/* Habit Type Segmented Button */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("fields.type")}</Label>
              <div className="grid grid-cols-1 border border-border material-radius overflow-hidden sm:grid-cols-2">
                <Button
                  type="button"
                  variant={type === "good" ? "default" : "ghost"}
                  className={`w-full material-radius-none ${
                    type === "good"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "hover:bg-green-50 hover:text-green-700"
                  }`}
                  onClick={() => setType("good")}
                >
                  {t("type.good")}
                </Button>
                <Button
                  type="button"
                  variant={type === "bad" ? "default" : "ghost"}
                  className={`w-full material-radius-none ${
                    type === "bad"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "hover:bg-red-50 hover:text-red-700"
                  }`}
                  onClick={() => setType("bad")}
                >
                  {t("type.bad")}
                </Button>
              </div>
            </div>

            {/* Schedule Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("fields.schedule")}</Label>
              <div className="grid grid-cols-1 border border-border material-radius overflow-hidden sm:grid-cols-3">
                {(["daily", "interval", "weekly"] as const).map((st) => (
                  <Button
                    key={st}
                    type="button"
                    onClick={() => setScheduleType(st)}
                    className={`w-full material-radius-none text-xs font-medium transition-all duration-200 ${
                      scheduleType === st
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "bg-background hover:bg-muted text-foreground"
                    }`}
                    variant="ghost"
                  >
                    {st === "daily"
                      ? t("schedule.daily")
                      : st === "interval"
                        ? t("schedule.interval")
                        : t("schedule.weekly")}
                  </Button>
                ))}
              </div>

              {/* Interval days input */}
              {scheduleType === "interval" && (
                <div className="flex items-center gap-2 mt-2">
                  <Label htmlFor="edit-interval-days" className="text-sm text-muted-foreground whitespace-nowrap">
                    {t("interval.every")}
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
                  <span className="text-sm text-muted-foreground">{t("interval.days")}</span>
                </div>
              )}

              {/* Weekday multi-select */}
              {scheduleType === "weekly" && (
                <div className="grid grid-cols-7 gap-1.5 mt-2">
                  {WEEKDAY_KEYS.map((dayKey, idx) => (
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
                      {t(`weekdays.${dayKey}`)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <div className="grid grid-cols-1 gap-2 w-full sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full material-radius"
            >
              {t("actions.cancel")}
            </Button>
            <Button
              type="submit"
              form="edit-habit-form"
              className="w-full material-radius cta-color-hover text-white"
              disabled={!name.trim()}
            >
              {t("actions.saveChanges")}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
