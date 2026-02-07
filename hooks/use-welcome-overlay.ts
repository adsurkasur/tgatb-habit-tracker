import { useState, useEffect } from 'react';

const WELCOME_SHOWN_KEY = 'welcome-overlay-shown';

export function useWelcomeOverlay() {
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
  const [hasShownOnFirstLoad, setHasShownOnFirstLoad] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome overlay before (async for PlatformStorage)
    (async () => {
      try {
        const { PlatformStorage } = await import('../lib/platform-storage');
        const hasSeenWelcome = await PlatformStorage.getItem(WELCOME_SHOWN_KEY);
        if (!hasSeenWelcome && !hasShownOnFirstLoad) {
          const timer = setTimeout(() => {
            setIsWelcomeVisible(true);
            setHasShownOnFirstLoad(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      } catch {
        // fallback: do nothing
      }
    })();
  }, [hasShownOnFirstLoad]);

  const closeWelcome = () => {
    setIsWelcomeVisible(false);
  };

  const completeWelcome = async () => {
    // Mark as shown but don't persist state - tour will always restart fresh
    try {
      const { PlatformStorage } = await import('../lib/platform-storage');
      await PlatformStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    } catch { /* ignore */ }
    setIsWelcomeVisible(false);
  };

  const resetWelcome = async () => {
    // Temporarily clear the "shown" flag so the overlay can be displayed
    try {
      const { PlatformStorage } = await import('../lib/platform-storage');
      await PlatformStorage.removeItem(WELCOME_SHOWN_KEY);
    } catch { /* ignore */ }
    // Always show the welcome tour from the beginning when requested
    setIsWelcomeVisible(true);
  };

  return {
    isWelcomeVisible,
    closeWelcome,
    completeWelcome,
    resetWelcome
  };
}
