import { Activity } from "lucide-react";

export function MasterLoadingScreen() {
  return (
    <div id="master-loading-screen" aria-hidden="true">
      <div className="master-loading-shell">
        <div className="master-loading-brand">
          <Activity className="h-7 w-7 text-primary" />
        </div>
        <div className="master-loading-spinner" />
      </div>
    </div>
  );
}
