import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSwipeableTabs } from "@/hooks/use-swipeable-tabs";
import { useState, useEffect, useRef } from "react";
import { Habit } from "@shared/schema";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody,
} from "@/components/ui/responsive-dialog";
import { useTranslations } from "next-intl";

interface AddEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
  date: string;
  addOrUpdateLog: (habitId: string, date: string, completed: boolean) => void;
  addHabit: (habit: { name: string; type: "good" | "bad"; schedule?: import("@shared/schema").HabitSchedule }) => Habit;
}

export function AddEntryDialog({ open, onOpenChange, habits, date, addOrUpdateLog, addHabit }: AddEntryDialogProps) {
  const t = useTranslations("AddEntryDialog");
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [status, setStatus] = useState<boolean | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitType, setNewHabitType] = useState<"good" | "bad">("good");
  const [newHabitScheduleType, setNewHabitScheduleType] = useState<"daily" | "interval" | "weekly">("daily");
  const [newHabitIntervalDays, setNewHabitIntervalDays] = useState(2);
  const [newHabitWeekdays, setNewHabitWeekdays] = useState<number[]>([]);
  const [lastAddedHabitId, setLastAddedHabitId] = useState<string | null>(null);
  const [tab, setTab] = useState("entry");
  const { containerRef: swipeRef } = useSwipeableTabs({
    tabs: ["entry", "habit"],
    activeTab: tab,
    onTabChange: setTab,
  });
  const habitNameRef = useRef<HTMLInputElement | null>(null);

  // Reset form state when dialog opens (component stays mounted for close animation)
  useEffect(() => {
    if (open) {
      // Defer resets to avoid synchronous cascading renders when dialog opens
      setTimeout(() => {
        setSelectedHabit(null);
        setStatus(null);
        setNewHabitName("");
        setNewHabitType("good");
        setNewHabitScheduleType("daily");
        setNewHabitIntervalDays(2);
        setNewHabitWeekdays([]);
        setLastAddedHabitId(null);
        setTab("entry");
      }, 0);
    }
  }, [open]);

  // When habits prop updates, select the last added habit if present
  // Adjust state during render (React-approved pattern)
  const [prevHabitsLen, setPrevHabitsLen] = useState(habits.length);
  if (lastAddedHabitId && habits.length !== prevHabitsLen) {
    setPrevHabitsLen(habits.length);
    const habit = habits.find(h => h.id === lastAddedHabitId) || null;
    if (habit) {
      setSelectedHabit(habit);
      setLastAddedHabitId(null);
      setTab("entry"); // Switch to entry tab after adding habit
    }
  }

  // Focus habit name input when user switches to Add Habit tab
  useEffect(() => {
    if (tab === "habit") {
      // small delay to ensure the input is mounted
      const t = window.setTimeout(() => {
        habitNameRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(t);
    }
  }, [tab]);

  const handleAddEntry = () => {
    if (selectedHabit && status !== null && date && date.trim()) {
      const storedStatus = selectedHabit.type === "bad" ? !status : status;
      addOrUpdateLog(selectedHabit.id, date, storedStatus);
      setSelectedHabit(null);
      setStatus(null);
      onOpenChange(false);
    }
  };

  const handleAddNewHabit = () => {
    if (newHabitName.trim()) {
      // Build schedule based on selected type
      let schedule;
      if (newHabitScheduleType === "interval") {
        schedule = {
          type: "interval" as const,
          intervalDays: Math.max(2, newHabitIntervalDays),
        };
      } else if (newHabitScheduleType === "weekly") {
        schedule = {
          type: "weekly" as const,
          daysOfWeek: newHabitWeekdays.length > 0 ? [...newHabitWeekdays].sort() : undefined,
        };
      } else {
        schedule = { type: "daily" as const };
      }

      // Add habit with schedule, then auto-switch to Add Entry tab via lastAddedHabitId flow.
      const newHabit = addHabit({ name: newHabitName.trim(), type: newHabitType, schedule });
      setLastAddedHabitId(newHabit.id);
      setNewHabitName("");
      setNewHabitType("good");
      setNewHabitScheduleType("daily");
      setNewHabitIntervalDays(2);
      setNewHabitWeekdays([]);
    }
  };

  // Helper to get status labels based on habit type
  const getStatusLabels = (type: "good" | "bad") =>
    type === "good"
      ? { "true": t("status.good.true"), "false": t("status.good.false") }
      : { "true": t("status.bad.true"), "false": t("status.bad.false") };

  const getStatusButtonClass = (type: "good" | "bad", value: boolean, selected: boolean) => {
    if (!selected) return "";
    if (type === "good" && value === true) return "bg-green-500 text-white hover:bg-green-600";
    if (type === "good" && value === false) return "bg-red-500 text-white hover:bg-red-600";
    if (type === "bad" && value === true) return "bg-blue-500 text-white hover:bg-blue-600";
    if (type === "bad" && value === false) return "bg-red-500 text-white hover:bg-red-600";
    return "";
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} drawerSize="compact">
      <ResponsiveDialogContent dialogClassName="w-full max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("title", { date })}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="flex-1 min-h-0">
          <Tabs value={tab} onValueChange={setTab} className="flex-1 min-h-0 flex flex-col">
            <TabsList className="grid grid-cols-2 mb-4 shrink-0 h-auto p-1">
              <TabsTrigger value="entry" className="flex-1">{t("tabs.addEntry")}</TabsTrigger>
              <TabsTrigger value="habit" className="flex-1">{t("tabs.addHabit")}</TabsTrigger>
            </TabsList>
            <div ref={swipeRef} className="flex-1 min-h-0">
            <TabsContent value="entry" className="flex-1 min-h-0 overflow-y-auto mt-0">
              <div className="space-y-2">
                <div
                  // Make the disabled select area act as a CTA to switch to the Add Habit tab
                  role={habits.length === 0 ? "button" : undefined}
                  tabIndex={habits.length === 0 ? 0 : undefined}
                  onClick={() => {
                    if (habits.length === 0) setTab("habit");
                  }}
                  onKeyDown={(e) => {
                    if (habits.length === 0 && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      setTab("habit");
                    }
                  }}
                >
                  <Select
                    value={selectedHabit?.id || ""}
                    onValueChange={(val) => {
                      const habit = habits.find((h) => h.id === val) || null;
                      setSelectedHabit(habit);
                      setStatus(null);
                    }}
                  >
                    <SelectTrigger
                      // keep trigger enabled but block pointer events so the wrapper can catch clicks
                      className={habits.length === 0 ? "pointer-events-none opacity-50 cursor-not-allowed" : undefined}
                    >
                      <SelectValue placeholder={habits.length === 0 ? t("placeholders.noHabit") : t("placeholders.selectHabit")} />
                    </SelectTrigger>
                    <SelectContent>
                      {habits.map((habit) => (
                        <SelectItem key={habit.id} value={habit.id}>
                          {habit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant={status === true ? "default" : "outline"}
                    onClick={() => setStatus(true)}
                    disabled={!selectedHabit}
                    className={`flex-1 ${selectedHabit ? getStatusButtonClass(selectedHabit.type, true, status === true) : ""}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />{selectedHabit ? getStatusLabels(selectedHabit.type === "bad" ? "bad" : "good")["true"] : t("status.good.true")}
                  </Button>
                  <Button
                    type="button"
                    variant={status === false ? "destructive" : "outline"}
                    onClick={() => setStatus(false)}
                    disabled={!selectedHabit}
                    className={`flex-1 ${selectedHabit ? getStatusButtonClass(selectedHabit.type, false, status === false) : ""}`}
                  >
                    <XCircle className="w-4 h-4 mr-1" />{selectedHabit ? getStatusLabels(selectedHabit.type === "bad" ? "bad" : "good")["false"] : t("status.good.false")}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="habit" className="flex-1 min-h-0 overflow-y-auto mt-0">
              <form className="space-y-5">
                {/* Habit Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("fields.name") || "Name"}</label>
                  <Input
                    type="text"
                    ref={habitNameRef}
                    className="w-full"
                    placeholder={t("placeholders.name") || "Habit name"}
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                  />
                </div>

                {/* Habit Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("fields.type") || "Type"}</label>
                  <div className="grid grid-cols-1 border border-border material-radius overflow-hidden sm:grid-cols-2">
                    <Button
                      type="button"
                      onClick={() => setNewHabitType("good")}
                      className={`w-full material-radius-none font-medium transition-all duration-200 ${
                        newHabitType === "good"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-background hover:bg-muted text-foreground"
                      }`}
                      variant="ghost"
                    >
                      {t("type.good")}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setNewHabitType("bad")}
                      className={`w-full material-radius-none font-medium transition-all duration-200 ${
                        newHabitType === "bad"
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
                  <label className="text-sm font-medium">{t("fields.schedule") || "Schedule"}</label>
                  <div className="grid grid-cols-1 border border-border material-radius overflow-hidden sm:grid-cols-3">
                    {(["daily", "interval", "weekly"] as const).map((st) => (
                      <Button
                        key={st}
                        type="button"
                        onClick={() => setNewHabitScheduleType(st)}
                        className={`w-full material-radius-none text-xs font-medium transition-all duration-200 ${
                          newHabitScheduleType === st
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
                  {newHabitScheduleType === "interval" && (
                    <div className="flex items-center gap-2 mt-2">
                      <label htmlFor="new-habit-interval-days" className="text-sm text-muted-foreground whitespace-nowrap">
                        {t("interval.every")}
                      </label>
                      <Input
                        id="new-habit-interval-days"
                        type="number"
                        min={2}
                        max={365}
                        value={newHabitIntervalDays}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          if (val === "") {
                            setNewHabitIntervalDays(2);
                          } else {
                            const num = parseInt(val, 10);
                            if (!isNaN(num)) {
                              setNewHabitIntervalDays(Math.max(2, Math.min(365, num)));
                            }
                          }
                        }}
                        className="w-20 material-radius"
                      />
                      <span className="text-sm text-muted-foreground">{t("interval.days")}</span>
                    </div>
                  )}

                  {/* Weekday multi-select */}
                  {newHabitScheduleType === "weekly" && (
                    <div className="grid grid-cols-7 gap-1.5 mt-2">
                      {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((dayKey, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          size="sm"
                          onClick={() => {
                            setNewHabitWeekdays(prev =>
                              prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]
                            );
                          }}
                          className={`h-8 w-full text-xs font-medium transition-all duration-200 ${
                            newHabitWeekdays.includes(idx)
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
            </TabsContent>
            </div>
          </Tabs>
          {/* Footer CTA — fixed (shrink-0) so it never scrolls with tab content */}
          <div className="mt-4 shrink-0">
            {tab === "entry" ? (
              <Button
                type="button"
                className="w-full cta-color-hover"
                disabled={!selectedHabit || status === null}
                onClick={handleAddEntry}
              >
                {t("actions.addEntry")}
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full cta-color-hover"
                disabled={!newHabitName.trim()}
                onClick={handleAddNewHabit}
              >
                {t("tabs.addHabit")}
              </Button>
            )}
          </div>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}