"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Minimum horizontal distance (px) to register a swipe.
 * Prevents accidental tab switches from taps or small drags.
 */
const SWIPE_THRESHOLD = 50;

/**
 * Maximum ratio of vertical to horizontal movement.
 * If vertical movement exceeds this ratio of horizontal, it's a scroll, not a swipe.
 */
const VERTICAL_RATIO_MAX = 0.75;

export interface UseSwipeableTabsOptions {
  /** Ordered list of tab values */
  tabs: string[];
  /** Currently active tab value */
  activeTab: string;
  /** Callback to change tab */
  onTabChange: (value: string) => void;
}

export interface UseSwipeableTabsReturn {
  /** Ref to attach to the swipeable container wrapping all tab panels */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Direction of the last transition: "left" | "right" | null */
  swipeDirection: "left" | "right" | null;
  /** Whether a swipe animation is in progress */
  isAnimating: boolean;
}

/**
 * useSwipeableTabs — adds horizontal swipe gesture to switch between tabs on mobile.
 *
 * Attach `containerRef` to a wrapper around all TabsContent elements.
 * Swipe LEFT → next tab, swipe RIGHT → previous tab.
 * Desktop: no-op (touch events don't fire with mouse).
 */
export function useSwipeableTabs({
  tabs,
  activeTab,
  onTabChange,
}: UseSwipeableTabsOptions): UseSwipeableTabsReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const isMobile = useIsMobile();

  const handleSwipe = useCallback(
    (deltaX: number) => {
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex === -1) return;

      if (deltaX < -SWIPE_THRESHOLD && currentIndex < tabs.length - 1) {
        // Swipe left → next tab
        setSwipeDirection("left");
        setIsAnimating(true);
        onTabChange(tabs[currentIndex + 1]);
      } else if (deltaX > SWIPE_THRESHOLD && currentIndex > 0) {
        // Swipe right → previous tab
        setSwipeDirection("right");
        setIsAnimating(true);
        onTabChange(tabs[currentIndex - 1]);
      }
    },
    [tabs, activeTab, onTabChange],
  );

  useEffect(() => {
    if (!isMobile) return;
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      isSwiping.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current) return;
      // We do NOT preventDefault here — vertical scrolling must work
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isSwiping.current) return;
      isSwiping.current = false;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = Math.abs(touch.clientY - touchStartY.current);
      const absDeltaX = Math.abs(deltaX);

      // If vertical movement dominates, it was a scroll, not a swipe
      if (deltaY > absDeltaX * VERTICAL_RATIO_MAX) return;
      // If horizontal distance too small, ignore
      if (absDeltaX < SWIPE_THRESHOLD) return;

      handleSwipe(deltaX);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [isMobile, handleSwipe]);

  // Clear animation state after transition
  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 200); // matches duration-200
    return () => clearTimeout(timer);
  }, [isAnimating, activeTab]);

  return { containerRef, swipeDirection, isAnimating };
}
