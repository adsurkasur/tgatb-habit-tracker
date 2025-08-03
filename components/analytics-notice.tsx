'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { BarChart3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AnalyticsNotice() {
  const [acknowledged, setAcknowledged] = useLocalStorage('analytics-notice-acknowledged', false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);

  // Track when component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
    // Render the element after mount
    setTimeout(() => setHasRendered(true), 10);
  }, []);

  useEffect(() => {
    // Only show if not acknowledged and component is mounted
    if (isMounted && !acknowledged) {
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [acknowledged, isMounted]);

  const handleAcknowledge = () => {
    setIsExiting(true);
    setTimeout(() => {
      setAcknowledged(true);
      setIsVisible(false);
      setIsExiting(false);
      // Dispatch custom event for PWA prompt
      window.dispatchEvent(new Event('analytics-notice-acknowledged-event'));
    }, 300);
  };

  const handleDismiss = () => {
    handleAcknowledge();
  };

  if (!isMounted || !hasRendered || acknowledged) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm",
        "sm:right-4 sm:bottom-4 sm:left-auto sm:mx-0",
        "left-1/2 -translate-x-1/2 w-[90vw] max-w-sm mx-auto",
        "sm:w-auto sm:left-auto sm:translate-x-0",
        "transform transition-all duration-400 ease-in-out",
        (!isVisible || isExiting)
          ? "translate-y-full opacity-0 max-sm:translate-y-full max-sm:opacity-0"
          : "translate-y-0 opacity-100 max-sm:translate-y-0 max-sm:opacity-100"
      )}
    >
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 hover:bg-primary/90 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Notice</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          We use Vercel Analytics to improve your experience. Anonymous usage data helps us make the app better.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAcknowledge}
            className="text-xs px-3 py-1 h-7"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
