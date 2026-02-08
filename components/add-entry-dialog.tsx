import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

  // Reset form state when dialog opens (component stays mounted for close animation)
  useEffect(() => {
    if (open) {
      // Defer resets to avoid synchronous cascading renders when dialog opens
      setTimeout(() => {
        setSelectedHabit(null);
        setStatus(null);
        setNewHabitName("");
        setNewHabitType("good");
        setNewHabitStatus(null);
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
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} drawerSize="compact">
      <ResponsiveDialogContent dialogClassName="w-full max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Add Entry for {date}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="flex-1 min-h-0">
          <Tabs value={tab} onValueChange={setTab} className="flex-1 min-h-0 flex flex-col">
            <TabsList className="grid grid-cols-2 mb-4 shrink-0 h-auto p-1">
              <TabsTrigger value="entry" className="flex-1">Add New Entry</TabsTrigger>
              <TabsTrigger value="habit" className="flex-1">Add New Habit</TabsTrigger>
            </TabsList>
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
                    className={`flex-1 ${selectedHabit && selectedHabit.type === "good" && status === true ? "bg-green-500 text-white hover:bg-green-600" : selectedHabit && selectedHabit.type === "bad" && status === true ? "bg-blue-500 text-white hover:bg-blue-600" : ""}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />{selectedHabit ? getStatusLabels(selectedHabit.type === "bad" ? "bad" : "good")["true"] : "Completed"}
                  </Button>
                  <Button
                    type="button"
                    variant={status === false ? "destructive" : "outline"}
                    onClick={() => setStatus(false)}
                    disabled={!selectedHabit}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1" />{selectedHabit ? getStatusLabels(selectedHabit.type === "bad" ? "bad" : "good")["false"] : "Missed"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="habit" className="flex-1 min-h-0 overflow-y-auto mt-0">
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
                    className={`flex-1 ${newHabitType === "good" ? "bg-green-500 text-white hover:bg-green-600" : ""}`}
                  >
                    Good
                  </Button>
                  <Button
                    type="button"
                    variant={newHabitType === "bad" ? "destructive" : "outline"}
                    onClick={() => setNewHabitType("bad")}
                    className="flex-1"
                  >
                    Bad
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={newHabitStatus === true ? "default" : "outline"}
                    onClick={() => setNewHabitStatus(true)}
                    className={`flex-1 ${newHabitType === "good" && newHabitStatus === true ? "bg-green-500 text-white hover:bg-green-600" : newHabitType === "bad" && newHabitStatus === true ? "bg-blue-500 text-white hover:bg-blue-600" : ""}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />{getStatusLabels(newHabitType)["true"]}
                  </Button>
                  <Button
                    type="button"
                    variant={newHabitStatus === false ? "destructive" : "outline"}
                    onClick={() => setNewHabitStatus(false)}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1" />{getStatusLabels(newHabitType)["false"]}
                  </Button>
                </div>
              </div>
            </TabsContent>
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
                Add Entry
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full cta-color-hover"
                disabled={!newHabitName.trim() || newHabitStatus === null}
                onClick={handleAddNewHabit}
              >
                Add Habit & Log Entry
              </Button>
            )}
          </div>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}