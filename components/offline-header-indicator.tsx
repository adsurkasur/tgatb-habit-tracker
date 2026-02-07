'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

type Phase = 'hidden' | 'entering' | 'visible' | 'hiding';

export function OfflineHeaderIndicator() {
  const { isOnline, isInitialized } = useNetworkStatus();
  const [phase, setPhase] = useState<Phase>(!isOnline ? 'visible' : 'hidden');
  const [prevOnline, setPrevOnline] = useState(isOnline);

  // Detect network state change during render (React-approved adjustment pattern)
  if (isInitialized && isOnline !== prevOnline) {
    setPrevOnline(isOnline);
    setPhase(!isOnline ? 'entering' : 'hiding');
  }
  // Handle pre-initialization offline state
  if (!isInitialized && !isOnline && phase === 'hidden') {
    setPhase('visible');
  }

  // Handle delayed phase transitions (timer callbacks, not direct effect setState)
  useEffect(() => {
    if (phase === 'entering') {
      const t = setTimeout(() => setPhase('visible'), 10);
      return () => clearTimeout(t);
    }
    if (phase === 'hiding') {
      const t = setTimeout(() => setPhase('hidden'), 300);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (phase === 'hidden') {
    return <div className="w-10" />; // Spacer for balance when online
  }

  return (
    <div className="flex items-center justify-center w-10">
      <div 
        className={`p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 transition-opacity duration-300 ease-in-out ${
          phase === 'visible' ? 'opacity-100' : 'opacity-0'
        }`}
        title="You are offline"
      >
        <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      </div>
    </div>
  );
}
