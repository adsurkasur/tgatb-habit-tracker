import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileDialogContent } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    setStatus(completed);
  }, [completed, habit, date]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MobileDialogContent className={`w-full max-w-md mx-auto material-radius-lg surface-elevation-3 ${isMobile ? "p-0 flex flex-col gap-0 h-fit max-h-[400px]" : ""}`}>
        <DialogHeader className={`${isMobile ? "px-6 pt-2 pb-1 border-b bg-background z-10 flex-shrink-0 space-y-0 !flex-row !text-left" : ""}`}>
          <div className={`flex items-center w-full ${isMobile ? "justify-between" : ""}`}>
            <DialogTitle className="text-xl font-semibold">
              {isMobile ? "Edit Entry" : `Edit Entry for ${habit.name}`}
            </DialogTitle>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
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
                  className="flex-1"
                >
                  Completed
                </Button>
                <Button
                  type="button"
                  variant={status === false ? "destructive" : "outline"}
                  onClick={() => setStatus(false)}
                  className="flex-1"
                >
                  Missed
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