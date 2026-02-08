import { useState } from "react";
import { Habit, HabitType } from "@shared/schema";
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

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditHabit: (id: string, name: string, type: HabitType) => void;
  habit: Habit | null;
}

export function EditHabitDialog({ open, onOpenChange, onEditHabit, habit }: EditHabitDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("good");

  // Adjust state during render when habit prop changes (React-approved pattern)
  const [prevHabit, setPrevHabit] = useState(habit);
  if (habit !== prevHabit) {
    setPrevHabit(habit);
    if (habit) {
      setName(habit.name);
      setType(habit.type);
    }
  }

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
