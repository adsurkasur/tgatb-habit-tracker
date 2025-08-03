'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function OfflineToast() {
  const { isOnline } = useNetworkStatus();
  const [showToast, setShowToast] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwipedAway, setIsSwipedAway] = useState(false);
  
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  const clearTimers = () => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const dismissToast = () => {
    clearTimers();
    setIsExiting(true);
    hideTimerRef.current = setTimeout(() => {
      setShowToast(false);
      setIsExiting(false);
      setIsSwipedAway(false);
      setDragOffset(0);
    }, 300);
  };

  useEffect(() => {
    clearTimers();

    if (!isOnline && !isSwipedAway) {
      // Going offline - show toast
      setShowToast(true);
      setIsExiting(false);
      
      // Start exit animation after 2.5 seconds
      exitTimerRef.current = setTimeout(() => {
        setIsExiting(true);
      }, 2500);
      
      // Hide completely after exit animation completes
      hideTimerRef.current = setTimeout(() => {
        setShowToast(false);
        setIsExiting(false);
      }, 2800); // 2500 + 300ms for exit animation
      
    } else if (showToast && !isSwipedAway) {
      // Going back online - start exit animation immediately
      dismissToast();
    }

    return clearTimers;
  }, [isOnline]); // Only depend on isOnline

  // Touch/mouse event handlers
  const handleStart = (clientY: number) => {
    if (isExiting) return;
    clearTimers(); // Pause auto-dismiss while dragging
    setIsDragging(true);
    startYRef.current = clientY;
    startTimeRef.current = Date.now();
  };

  const handleMove = (clientY: number) => {
    if (!isDragging || isExiting) return;
    
    const deltaY = clientY - startYRef.current;
    const clampedDelta = Math.max(0, deltaY); // Only allow downward movement
    setDragOffset(clampedDelta);
  };

  const handleEnd = () => {
    if (!isDragging || isExiting) return;
    
    const deltaY = dragOffset;
    const deltaTime = Date.now() - startTimeRef.current;
    const velocity = deltaY / deltaTime; // pixels per ms
    
    setIsDragging(false);
    
    // Dismiss if dragged far enough or swiped fast enough (more generous thresholds)
    if (deltaY > 40 || velocity > 0.3) {
      setIsSwipedAway(true);
      dismissToast();
    } else {
      // Snap back
      setDragOffset(0);
      // Resume auto-dismiss timer
      exitTimerRef.current = setTimeout(() => {
        setIsExiting(true);
      }, 2000); // Reduced time since user interacted
      
      hideTimerRef.current = setTimeout(() => {
        setShowToast(false);
        setIsExiting(false);
      }, 2300);
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Global mouse move and up listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientY);
    };

    const handleGlobalMouseUp = () => {
      handleEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!showToast) return null;

  const getTransform = () => {
    if (isSwipedAway) return 'translate(-50%, 100px)';
    if (isDragging) return `translate(-50%, ${dragOffset}px)`;
    return 'translate(-50%, 0)';
  };

  const getOpacity = () => {
    if (isSwipedAway) return 0;
    if (isDragging && dragOffset > 0) return Math.max(0.3, 1 - (dragOffset / 100));
    return 1;
  };

  return (
    <div 
      ref={toastRef}
      className={`fixed bottom-4 left-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3 min-w-max cursor-pointer select-none ${
        isExiting && !isSwipedAway ? 'animate-slide-down' : 
        !isDragging && !isSwipedAway ? 'animate-slide-up' : ''
      }`}
      style={{
        transform: getTransform(),
        opacity: getOpacity(),
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <WifiOff className="h-4 w-4 text-orange-600" />
      <span className="text-sm text-gray-800">You're offline. Some features may be limited.</span>
    </div>
  );
}
