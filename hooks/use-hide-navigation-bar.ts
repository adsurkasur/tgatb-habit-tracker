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

    const hideNavigationBar = async () => {
      try {
        // Use the specialized plugin for hiding navigation bar
        await NavigationBar.hide();
        console.log('Navigation bar permanently hidden');
      } catch (error) {
        console.warn('Failed to hide navigation bar:', error);
      }
    };

    // Hide immediately
    hideNavigationBar();

    // Set up persistent hiding - reapply every few seconds
    const interval = setInterval(hideNavigationBar, 2000);

    // Also hide on various events that might show the navigation bar
    const events = ['focus', 'touchstart', 'click', 'visibilitychange'];
    const handleEvent = () => {
      setTimeout(hideNavigationBar, 100);
    };

    events.forEach(event => {
      if (event === 'visibilitychange') {
        document.addEventListener(event, handleEvent);
      } else {
        window.addEventListener(event, handleEvent);
      }
    });

    // Cleanup
    return () => {
      clearInterval(interval);
      events.forEach(event => {
        if (event === 'visibilitychange') {
          document.removeEventListener(event, handleEvent);
        } else {
          window.removeEventListener(event, handleEvent);
        }
      });
    };
  }, []);
};
