'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OfflineHeaderIndicator() {
  const { isOnline } = useNetworkStatus();
  const [shouldShow, setShouldShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      // Going offline - show indicator
      setShouldShow(true);
      // Trigger fade in after a brief delay to ensure element is mounted
      setTimeout(() => setIsVisible(true), 10);
    } else {
      // Going online - start fade out
      setIsVisible(false);
      // Hide element after fade out completes
      setTimeout(() => setShouldShow(false), 300);
    }
  }, [isOnline]);

  if (!shouldShow) {
    return <div className="w-10" />; // Spacer for balance when online
  }

  return (
    <div className="flex items-center justify-center w-10">
      <div 
        className={`p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 transition-opacity duration-300 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      </div>
    </div>
  );
}
