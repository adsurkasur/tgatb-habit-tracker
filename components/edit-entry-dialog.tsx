import { useState } from "react";
import { Habit } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";

interface EditEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit;
  date: string; // formatted local date string
  completed: boolean | null; // null if no log exists yet
  onSave: (completed: boolean) => void;
}

export function EditEntryDialog({ open, onOpenChange, habit, date, completed, onSave }: EditEntryDialogProps) {
  const [status, setStatus] = useState<boolean | null>(completed);

  // Adjust state during render when props change (React-approved pattern)
  const [prevCompleted, setPrevCompleted] = useState(completed);
  const [prevHabit, setPrevHabit] = useState(habit);
  const [prevDate, setPrevDate] = useState(date);
  if (completed !== prevCompleted || habit !== prevHabit || date !== prevDate) {
    setPrevCompleted(completed);
    setPrevHabit(habit);
    setPrevDate(date);
    setStatus(completed);
  }

  // Helper to get status labels based on habit type
  const getStatusLabels = (type: "good" | "bad") =>
    type === "good"
      ? { "true": "Completed", "false": "Missed" }
      : { "true": "Avoided", "false": "Done" };

  // Helper to get button color classes based on habit type and status, only when selected
  const getButtonClass = (type: "good" | "bad", value: boolean, selected: boolean) => {
    if (!selected) return "";
    if (type === "good" && value === true) return "bg-green-500 text-white hover:bg-green-600";
    if (type === "good" && value === false) return "bg-red-500 text-white hover:bg-red-600";
    if (type === "bad" && value === true) return "bg-blue-500 text-white hover:bg-blue-600";
    if (type === "bad" && value === false) return "bg-red-500 text-white hover:bg-red-600";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== null) {
      onSave(status);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setStatus(completed);
    onOpenChange(false);
  };

  if (!habit) return null;

  const labels = getStatusLabels(habit.type);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent dialogClassName="w-full max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit Entry</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <form id="edit-entry-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date</Label>
              <div className="text-base font-semibold">{date}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={status === true ? "default" : "outline"}
                  onClick={() => setStatus(true)}
                  className={`flex-1 ${getButtonClass(habit.type, true, status === true)}`}
                >
                  {labels["true"]}
                </Button>
                <Button
                  type="button"
                  variant={status === false ? "destructive" : "outline"}
                  onClick={() => setStatus(false)}
                  className={`flex-1 ${getButtonClass(habit.type, false, status === false)}`}
                >
                  {labels["false"]}
                </Button>
              </div>
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
              form="edit-entry-form"
              className="px-6 bg-primary hover:bg-primary/90 text-white material-radius surface-elevation-1"
              disabled={status === null}
            >
              Save
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}