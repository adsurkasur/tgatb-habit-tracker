import { useState } from "react";
import { HabitType } from "@shared/schema";
import { useMobileBackNavigation } from "@/hooks/use-mobile-back-navigation";
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

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit: (name: string, type: HabitType) => void;
}

export function AddHabitDialog({ open, onOpenChange, onAddHabit }: AddHabitDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("good");

  // Handle mobile back navigation
  useMobileBackNavigation({
    onBackPressed: () => {
      onOpenChange(false);
    },
    isActive: open,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddHabit(name.trim(), type);
      setName("");
      setType("good");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setType("good");
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
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
                  className={`flex-1 material-radius-none font-medium transition-colors ${
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
                  className={`flex-1 material-radius-none font-medium transition-colors ${
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
