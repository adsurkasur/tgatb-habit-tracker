import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileDialogContent } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Habit } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { X } from "lucide-react";

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
  const isMobile = useIsMobile();

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MobileDialogContent className={`w-full max-w-lg mx-auto material-radius-lg surface-elevation-3 [&>button]:hidden ${isMobile ? "p-0 flex flex-col gap-0 h-fit max-h-[400px]" : ""}`}>
        <DialogHeader className="shrink-0 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Edit Entry</DialogTitle>
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
        <div className={`${isMobile ? "overflow-y-auto" : ""}`}>
          <form onSubmit={handleSubmit} className={`${isMobile ? "px-6 pt-4 pb-4 space-y-4" : "space-y-6"}`}>
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
            <div className={`flex space-x-3 justify-end ${isMobile ? "pt-2" : "pt-4"}`}>
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
                className="px-6 bg-primary hover:bg-primary/90 text-white material-radius surface-elevation-1"
                disabled={status === null}
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </MobileDialogContent>
    </Dialog>
  );
}