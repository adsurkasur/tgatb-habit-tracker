import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileDialogContent } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect, useRef } from "react";
import { Habit } from "@shared/schema";
import { CheckCircle, XCircle, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface AddEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
  date: string;
  addOrUpdateLog: (habitId: string, date: string, completed: boolean) => void;
  addHabit: (habit: { name: string; type: "good" | "bad" }) => Habit;
}

export function AddEntryDialog({ open, onOpenChange, habits, date, addOrUpdateLog, addHabit }: AddEntryDialogProps) {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [status, setStatus] = useState<boolean | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitType, setNewHabitType] = useState<"good" | "bad">("good");
  const [newHabitStatus, setNewHabitStatus] = useState<boolean | null>(null);
  const [lastAddedHabitId, setLastAddedHabitId] = useState<string | null>(null);
  const [tab, setTab] = useState("entry");
  const habitNameRef = useRef<HTMLInputElement | null>(null);

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
    if (selectedHabit && status !== null) {
      addOrUpdateLog(selectedHabit.id, date, status);
      setSelectedHabit(null);
      setStatus(null);
      onOpenChange(false);
    }
  };

  const handleAddNewHabit = () => {
    if (newHabitName.trim() && newHabitStatus !== null) {
      // Use main addHabit logic from parent
      const newHabit = addHabit({ name: newHabitName.trim(), type: newHabitType });
      addOrUpdateLog(newHabit.id, date, newHabitStatus);
      setLastAddedHabitId(newHabit.id);
      setNewHabitName("");
      setNewHabitType("good");
      setNewHabitStatus(null);
    }
  };

  // Helper to get status labels based on habit type
  const getStatusLabels = (type: "good" | "bad") =>
    type === "good"
      ? { "true": "Completed", "false": "Missed" }
      : { "true": "Avoided", "false": "Done" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MobileDialogContent className="w-full max-w-lg mx-auto material-radius-lg surface-elevation-3 [&>button]:hidden">
        <DialogHeader className="shrink-0 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Add Entry for {date}</DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="entry">Add New Entry</TabsTrigger>
            <TabsTrigger value="habit">Add New Habit</TabsTrigger>
          </TabsList>
          <TabsContent value="entry">
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
                    <SelectValue placeholder={habits.length === 0 ? "No habit available, add now!" : "Select habit..."} />
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
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={status === true ? "default" : "outline"}
                  onClick={() => setStatus(true)}
                  disabled={!selectedHabit}
                  className={selectedHabit && selectedHabit.type === "good" && status === true ? "bg-green-500 text-white hover:bg-green-600" : selectedHabit && selectedHabit.type === "bad" && status === true ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />{selectedHabit ? getStatusLabels(selectedHabit.type === "bad" ? "bad" : "good")["true"] : "Completed"}
                </Button>
                <Button
                  type="button"
                  variant={status === false ? "destructive" : "outline"}
                  onClick={() => setStatus(false)}
                  disabled={!selectedHabit}
                >
                  <XCircle className="w-4 h-4 mr-1" />{selectedHabit ? getStatusLabels(selectedHabit.type === "bad" ? "bad" : "good")["false"] : "Missed"}
                </Button>
              </div>
              <Button
                type="button"
                className="mt-4 w-full cta-color-hover"
                disabled={!selectedHabit || status === null}
                onClick={handleAddEntry}
              >
                Add Entry
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="habit">
            <div className="space-y-2">
              <Input
                type="text"
                ref={habitNameRef}
                className="w-full"
                placeholder="Habit name..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newHabitType === "good" ? "default" : "outline"}
                  onClick={() => setNewHabitType("good")}
                  className={newHabitType === "good" ? "bg-green-500 text-white hover:bg-green-600" : ""}
                >
                  Good
                </Button>
                <Button
                  type="button"
                  variant={newHabitType === "bad" ? "destructive" : "outline"}
                  onClick={() => setNewHabitType("bad")}
                >
                  Bad
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={newHabitStatus === true ? "default" : "outline"}
                  onClick={() => setNewHabitStatus(true)}
                  className={newHabitType === "good" && newHabitStatus === true ? "bg-green-500 text-white hover:bg-green-600" : newHabitType === "bad" && newHabitStatus === true ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />{getStatusLabels(newHabitType)["true"]}
                </Button>
                <Button
                  type="button"
                  variant={newHabitStatus === false ? "destructive" : "outline"}
                  onClick={() => setNewHabitStatus(false)}
                >
                  <XCircle className="w-4 h-4 mr-1" />{getStatusLabels(newHabitType)["false"]}
                </Button>
              </div>
              <Button
                type="button"
                className="mt-4 w-full cta-color-hover"
                disabled={!newHabitName.trim() || newHabitStatus === null}
                onClick={handleAddNewHabit}
              >
                Add Habit & Log Entry
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </MobileDialogContent>
    </Dialog>
  );
}