import { useState } from "react";
import { ChevronRight, Trash2 } from "lucide-react";
import { DeleteAllHabitsModal } from "@/components/delete-all-habits-modal";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/hooks/use-loading";
import { feedbackButtonPress } from "@/lib/feedback";

interface HabitManagementSettingsProps {
  onDeleteAllHabits?: () => Promise<void>;
}

export function HabitManagementSettings({ onDeleteAllHabits }: HabitManagementSettingsProps) {
  const { toast } = useToast();
  const { show: showLoading, hide: hideLoading } = useLoading();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Habit Management</h2>
      <div
        className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-all duration-200 theme-transition"
        onClick={() => { feedbackButtonPress(); setShowDeleteModal(true); }}
      >
        <div className="flex items-center space-x-3">
          <Trash2 className="w-5 h-5 text-destructive" />
          <span className="font-medium text-destructive">Delete All Habits</span>
        </div>
        <ChevronRight className="w-5 h-5 text-destructive" />
      </div>

      <DeleteAllHabitsModal
        open={showDeleteModal}
        loading={deleteLoading}
        onCancel={() => setShowDeleteModal(false)}
        onDelete={async () => {
          setDeleteLoading(true);
          showLoading();
          try {
            if (onDeleteAllHabits) {
              await onDeleteAllHabits();
              toast({
                title: 'All habits deleted',
                description: 'Your habit list has been cleared.',
                duration: 3000,
              });
            } else {
              toast({
                title: 'Delete Failed',
                description: 'No delete handler provided.',
                variant: 'destructive',
                duration: 3000,
              });
            }
          } catch {
            toast({
              title: 'Delete Failed',
              description: 'An error occurred while deleting habits.',
              variant: 'destructive',
              duration: 3000,
            });
          } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
            hideLoading();
          }
        }}
      />
    </div>
  );
}
