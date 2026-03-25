import { LoadingVisual } from "@/components/ui/loading-visual";

export default function LocaleLoading() {
  return (
    <div className="fixed inset-0 z-99998 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <LoadingVisual />
    </div>
  );
}
