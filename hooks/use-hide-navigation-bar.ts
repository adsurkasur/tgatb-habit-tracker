'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';

/**
 * Hook to permanently hide the Android navigation bar throughout the app.
 * Uses the specialized @squareetlabs/capacitor-navigation-bar plugin
 * which is designed specifically for hiding navigation bars.
 */
export const useHideNavigationBar = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

  const showNavigationBar = async () => {
      try {
    await NavigationBar.show();
    console.log('Navigation bar shown (respect OS nav bar)');
      } catch (error) {
    console.warn('Failed to show navigation bar:', error);
      }
    };

  // Show immediately
  showNavigationBar();

  // Re-apply when app becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
    showNavigationBar();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

  // Also ensure on user interactions we keep default nav bar visible
    const events: (keyof WindowEventMap)[] = ['focus', 'touchstart', 'click'];
    const handleEvent = () => {
    setTimeout(() => showNavigationBar(), 100);
    };

    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    // Cleanup
    return () => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, []);
};
