import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { useTranslations } from "next-intl";

interface DeleteAllHabitsModalProps {
  open: boolean;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  loading?: boolean;
}

export function DeleteAllHabitsModal({ open, onCancel, onDelete, loading }: DeleteAllHabitsModalProps) {
  const t = useTranslations("DeleteAllHabitsModal");
  return (
    <ResponsiveDialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }} drawerSize="compact">
      <ResponsiveDialogContent dialogClassName="w-full max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="text-destructive">
            {t("title")}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t("description")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogFooter>
          <div className="flex flex-wrap justify-end gap-2 w-full">
            <Button variant="ghost" onClick={onCancel} disabled={loading}>
              {t("actions.cancel")}
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={loading}>
              {loading ? t("actions.deleting") : t("actions.delete")}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
