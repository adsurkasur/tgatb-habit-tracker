import { useState, useEffect } from 'react';

const WELCOME_SHOWN_KEY = 'welcome-overlay-shown';

export function useWelcomeOverlay() {
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
  const [hasShownOnFirstLoad, setHasShownOnFirstLoad] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome overlay before
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    
    if (!hasSeenWelcome && !hasShownOnFirstLoad) {
      // Show welcome overlay after a short delay to let the page load
      const timer = setTimeout(() => {
        setIsWelcomeVisible(true);
        setHasShownOnFirstLoad(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasShownOnFirstLoad]);

  const closeWelcome = () => {
    setIsWelcomeVisible(false);
  };

  const completeWelcome = () => {
    // Mark as shown but don't persist state - tour will always restart fresh
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    setIsWelcomeVisible(false);
  };

  const resetWelcome = () => {
    // Temporarily clear the "shown" flag so the overlay can be displayed
    localStorage.removeItem(WELCOME_SHOWN_KEY);
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
