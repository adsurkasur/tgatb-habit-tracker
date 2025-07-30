import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { HabitType } from "@shared/schema";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit: (name: string, type: HabitType) => void;
}

export function AddHabitDialog({ open, onOpenChange, onAddHabit }: AddHabitDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("good");

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md material-radius-lg surface-elevation-3">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Dialog Actions */}
          <div className="flex space-x-3 justify-end pt-4">
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
              className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground material-radius surface-elevation-1"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
