'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';

export function OfflineToast() {
  const { isOnline } = useNetworkStatus();
  const [showToast, setShowToast] = useState(false);
  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const { state, handlers, scheduleAutoDismiss, clearTimers } = useSwipeToDismiss(dismissToast, { exitDelayMs: 2500, snapBackMs: 2000 });

  useEffect(() => {
    clearTimers();
    if (!isOnline) {
      // Going offline - show toast
      setShowToast(true);
      scheduleAutoDismiss(2500, 2800);
    } else if (showToast) {
      // Going back online - start exit animation immediately
      dismissToast();
    }
    return clearTimers;
  }, [isOnline, showToast, clearTimers, dismissToast, scheduleAutoDismiss]);

  // Touch/mouse event handlers
  // handlers are provided by hook

  if (!showToast) return null;

  const getTransform = () => {
  if (state.isSwipedAway) return 'translate(-50%, 100px)';
  if (state.isDragging) return `translate(-50%, ${state.dragOffset}px)`;
    return 'translate(-50%, 0)';
  };

  const getOpacity = () => {
  if (state.isSwipedAway) return 0;
  if (state.isDragging && state.dragOffset > 0) return Math.max(0.3, 1 - (state.dragOffset / 100));
    return 1;
  };

  return (
  <div 
      className={`fixed bottom-4 left-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3 min-w-max cursor-pointer select-none ${
        state.isExiting && !state.isSwipedAway ? 'animate-slide-down' : 
        !state.isDragging && !state.isSwipedAway ? 'animate-slide-up' : ''
      }`}
      style={{
        transform: getTransform(),
        opacity: getOpacity(),
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
