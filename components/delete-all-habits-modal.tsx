import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface DeleteAllHabitsModalProps {
  open: boolean;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  loading?: boolean;
}

export function DeleteAllHabitsModal({ open, onCancel, onDelete, loading }: DeleteAllHabitsModalProps) {
  if (!open) return null;
  // Always attach to document.body for true overlay
  if (typeof window === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-sm animate-modal-pop relative z-[110]">
        <h3 className="text-lg font-semibold text-destructive mb-2">Delete All Habits?</h3>
        <p className="text-sm mb-4">This action cannot be undone. Are you sure you want to delete all habits?</p>
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={onDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
