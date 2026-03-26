import { LoadingVisual } from "@/components/ui/loading-visual";

export function MasterLoadingScreen() {
  return (
    <div
      id="master-loading-screen"
      aria-hidden="true"
      className="fixed inset-0 z-99999 flex items-center justify-center bg-background/80 backdrop-blur-md"
    >
      <LoadingVisual />
    </div>
  );
}
