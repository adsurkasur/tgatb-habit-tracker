import { Loader2 } from "lucide-react";

export function LoadingVisual({ label }: { label?: string }) {
  return (
    <div className="flex min-w-32 flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {label ? <span className="text-sm font-medium text-foreground">{label}</span> : null}
    </div>
  );
}
