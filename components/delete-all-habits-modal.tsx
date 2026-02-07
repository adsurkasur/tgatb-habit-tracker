import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";

interface DeleteAllHabitsModalProps {
  open: boolean;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  loading?: boolean;
}

export function DeleteAllHabitsModal({ open, onCancel, onDelete, loading }: DeleteAllHabitsModalProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <ResponsiveDialogContent dialogClassName="w-full max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="text-destructive">
            Delete All Habits?
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            This action cannot be undone. Are you sure you want to delete all habits?
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogFooter>
          <div className="flex justify-end space-x-2 w-full">
            <Button variant="ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
