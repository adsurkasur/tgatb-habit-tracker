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
import { useTranslations } from "next-intl";

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit: (name: string, type: HabitType, schedule?: HabitSchedule) => void;
}

export function AddHabitDialog({ open, onOpenChange, onAddHabit }: AddHabitDialogProps) {
  const t = useTranslations("AddHabitDialog");
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
          <ResponsiveDialogTitle>{t("title")}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <form id="add-habit-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Habit Name Input */}
            <div className="space-y-2">
              <Label htmlFor="habit-name" className="text-sm font-medium">
                {t("fields.name")}
              </Label>
              <Input
                id="habit-name"
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
                  {t("type.good")}
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
                  {t("type.bad")}
                </Button>
              </div>
            </div>

            {/* Schedule Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("fields.schedule")}</Label>
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
                  <Label htmlFor="interval-days" className="text-sm text-muted-foreground whitespace-nowrap">
                    {t("interval.every")}
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
          <div className="flex space-x-3 justify-end w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="px-6 material-radius state-layer-hover"
            >
              {t("actions.cancel")}
            </Button>
            <Button
              type="submit"
              form="add-habit-form"
              className="px-6 bg-primary hover:bg-primary/90 text-white material-radius surface-elevation-1"
            >
              {t("actions.save")}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
