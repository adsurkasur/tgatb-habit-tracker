import { Activity } from "lucide-react";

export default function LocaleLoading() {
  return (
    <div className="fixed inset-0 z-99998 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="grid h-13 w-13 place-items-center rounded-2xl border border-primary/25 bg-primary/14 shadow-[0_8px_30px_hsl(var(--primary)/0.16)]">
          <Activity className="h-7 w-7 text-primary" />
        </div>
        <div className="h-7 w-7 animate-spin rounded-full border-3 border-muted-foreground/25 border-t-primary" />
      </div>
    </div>
  );
}
