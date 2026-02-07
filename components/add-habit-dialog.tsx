import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileDialogContent } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { HabitType } from "@shared/schema";
import { useMobileBackNavigation } from "@/hooks/use-mobile-back-navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { X } from "lucide-react";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit: (name: string, type: HabitType) => void;
}

export function AddHabitDialog({ open, onOpenChange, onAddHabit }: AddHabitDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("good");
  const isMobile = useIsMobile();

  // Handle mobile back navigation
  useMobileBackNavigation({
    onBackPressed: () => {
      onOpenChange(false);
    },
    isActive: open
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MobileDialogContent className={`w-full max-w-lg mx-auto material-radius-lg surface-elevation-3 [&>button]:hidden ${isMobile ? "p-0 flex flex-col gap-0 h-fit max-h-[400px]" : ""}`}>
        <DialogHeader className="shrink-0 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Add New Habit</DialogTitle>
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
