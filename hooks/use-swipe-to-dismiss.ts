import { useCallback, useEffect, useRef, useState } from 'react';

export interface SwipeState {
  isDragging: boolean;
  dragOffset: number;
  isExiting: boolean;
  isSwipedAway: boolean;
}

export interface SwipeHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export function useSwipeToDismiss(onDismiss: () => void, options?: { snapBackMs?: number; exitDelayMs?: number }) {
  const SNAP_BACK_MS = options?.snapBackMs ?? 2000;
  const EXIT_DELAY_MS = options?.exitDelayMs ?? 2500;

  const [state, setState] = useState<SwipeState>({ isDragging: false, dragOffset: 0, isExiting: false, isSwipedAway: false });
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleAutoDismiss = useCallback((exitDelay: number, hideDelay: number) => {
    exitTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isExiting: true }));
    }, exitDelay);
    hideTimerRef.current = setTimeout(() => {
      onDismiss();
      setState({ isDragging: false, dragOffset: 0, isExiting: false, isSwipedAway: false });
    }, hideDelay);
  }, [onDismiss]);

  const begin = useCallback((clientY: number) => {
    if (state.isExiting) return;
    clearTimers();
    setState(prev => ({ ...prev, isDragging: true }));
    startYRef.current = clientY;
    startTimeRef.current = Date.now();
  }, [state.isExiting, clearTimers]);

  const move = useCallback((clientY: number) => {
    if (!state.isDragging || state.isExiting) return;
    const deltaY = clientY - startYRef.current;
    const clamped = Math.max(0, deltaY);
    setState(prev => ({ ...prev, dragOffset: clamped }));
  }, [state.isDragging, state.isExiting]);

  const end = useCallback(() => {
    if (!state.isDragging || state.isExiting) return;
    const deltaY = state.dragOffset;
    const deltaTime = Date.now() - startTimeRef.current;
    const velocity = deltaY / Math.max(deltaTime, 1);

    setState(prev => ({ ...prev, isDragging: false }));

    if (deltaY > 40 || velocity > 0.3) {
      setState(prev => ({ ...prev, isSwipedAway: true }));
      clearTimers();
      // immediate dismiss
      onDismiss();
      setState({ isDragging: false, dragOffset: 0, isExiting: false, isSwipedAway: false });
    } else {
      // Snap back and reschedule auto-dismiss
      setState(prev => ({ ...prev, dragOffset: 0 }));
      clearTimers();
      scheduleAutoDismiss(SNAP_BACK_MS, SNAP_BACK_MS + 300);
    }
  }, [state.isDragging, state.isExiting, state.dragOffset, clearTimers, scheduleAutoDismiss, onDismiss]);

  // Global mouse listeners while dragging
  useEffect(() => {
    if (!state.isDragging) return;
    const onMove = (e: MouseEvent) => move(e.clientY);
    const onUp = () => end();
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [state.isDragging, move, end]);

  const handlers: SwipeHandlers = {
    onMouseDown: (e) => { e.preventDefault(); begin(e.clientY); },
    onTouchStart: (e) => begin(e.touches[0].clientY),
    onTouchMove: (e) => move(e.touches[0].clientY),
    onTouchEnd: () => end(),
  };

  return { state, handlers, clearTimers, scheduleAutoDismiss, setState } as const;
}
