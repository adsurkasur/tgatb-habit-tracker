import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileDialogContent } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Habit, HabitType } from "@shared/schema";
import { useMobileBackNavigation } from "@/hooks/use-mobile-back-navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { X } from "lucide-react";

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditHabit: (id: string, name: string, type: HabitType) => void;
  habit: Habit | null;
}

export function EditHabitDialog({ open, onOpenChange, onEditHabit, habit }: EditHabitDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("good");
  const isMobile = useIsMobile();

  // Adjust state during render when habit prop changes (React-approved pattern)
  const [prevHabit, setPrevHabit] = useState(habit);
  if (habit !== prevHabit) {
    setPrevHabit(habit);
    if (habit) {
      setName(habit.name);
      setType(habit.type);
    }
  }

  // Handle mobile back navigation
  useMobileBackNavigation({
    onBackPressed: () => {
      onOpenChange(false);
    },
    isActive: open
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && habit) {
      onEditHabit(habit.id, name.trim(), type);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (habit) {
      setName(habit.name);
      setType(habit.type);
    }
    onOpenChange(false);
  };

  if (!habit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MobileDialogContent className={`w-full max-w-lg mx-auto material-radius-lg surface-elevation-3 [&>button]:hidden ${isMobile ? "p-0 flex flex-col gap-0 h-fit max-h-[400px]" : ""}`}>
        <DialogHeader className="shrink-0 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Edit Habit</DialogTitle>
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

          {/* Action Buttons */}
          <div className={`flex space-x-3 ${isMobile ? "pt-2" : "pt-2"}`}>
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
              className="flex-1 material-radius cta-color-hover text-white"
              disabled={!name.trim()}
            >
              Save Changes
            </Button>
          </div>
        </form>
        </div>
      </MobileDialogContent>
    </Dialog>
  );
}
