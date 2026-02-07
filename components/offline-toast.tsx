'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';

export function OfflineToast() {
  const { isOnline } = useNetworkStatus();
  const [showToast, setShowToast] = useState(false);
  const [prevOnline, setPrevOnline] = useState(isOnline);
  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const { state, handlers, scheduleAutoDismiss, clearTimers } = useSwipeToDismiss(dismissToast, { exitDelayMs: 2500, snapBackMs: 2000 });

  // Detect network state change during render (React-approved adjustment pattern)
  if (isOnline !== prevOnline) {
    setPrevOnline(isOnline);
    if (!isOnline) {
      setShowToast(true);
    } else if (showToast) {
      // Dismiss immediately when going back online
      setShowToast(false);
    }
  }

  // Handle auto-dismiss scheduling
  useEffect(() => {
    if (showToast && !isOnline) {
      clearTimers();
      scheduleAutoDismiss(2500, 2800);
      return clearTimers;
    }
  }, [showToast, isOnline, clearTimers, scheduleAutoDismiss]);

  // Touch/mouse event handlers
  // handlers are provided by hook

  if (!showToast) return null;

  const computeTransform = (s: typeof state) => {
    if (s.isSwipedAway) return 'translate(-50%, 100px)';
    if (s.isDragging) return `translate(-50%, ${s.dragOffset}px)`;
    return 'translate(-50%, 0)';
  };

  const computeOpacity = (s: typeof state) => {
    if (s.isSwipedAway) return 0;
    if (s.isDragging && s.dragOffset > 0) return Math.max(0.3, 1 - (s.dragOffset / 100));
    return 1;
  };

  return (
  <div 
      className={`fixed bottom-4 left-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3 min-w-max cursor-pointer select-none ${
        state.isExiting && !state.isSwipedAway ? 'animate-slide-down' : 
        !state.isDragging && !state.isSwipedAway ? 'animate-slide-up' : ''
      }`}
      style={{
        transform: computeTransform(state),
        opacity: computeOpacity(state),
        transition: state.isDragging ? 'none' : 'all 0.3s ease-out',
      }}
  onMouseDown={handlers.onMouseDown}
  onTouchStart={handlers.onTouchStart}
  onTouchMove={handlers.onTouchMove}
  onTouchEnd={handlers.onTouchEnd}
    >
      <WifiOff className="h-4 w-4 text-orange-600" />
  <span className="text-sm text-gray-800">You&apos;re offline. Some features may be limited.</span>
    </div>
  );
}
