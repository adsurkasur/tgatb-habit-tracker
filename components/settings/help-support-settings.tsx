import { ChevronRight, HelpCircle, Mail } from "lucide-react";
import { SUPPORT_AUTHOR, SUPPORT_EMAIL } from "@/lib/support-email";
import { feedbackButtonPress } from "@/lib/feedback";

interface HelpSupportSettingsProps {
  onShowHelp?: () => void;
}

export function HelpSupportSettings({ onShowHelp }: HelpSupportSettingsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Help & Support</h2>

      <div className="space-y-2">
        {onShowHelp && (
          <div
            className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-all duration-200 theme-transition"
            onClick={() => { feedbackButtonPress(); onShowHelp?.(); }}
          >
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Show Welcome Guide</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        <div
          className="flex items-center justify-between p-4 bg-muted material-radius cursor-pointer state-layer-hover transition-all duration-200 theme-transition"
          onClick={() => { feedbackButtonPress(); window.open(`mailto:${SUPPORT_EMAIL}?subject=Habit%20Tracker%20Support&body=Hi%2C%20I%20need%20support.`, '_blank'); }}
        >
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Contact {SUPPORT_AUTHOR} via email</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}