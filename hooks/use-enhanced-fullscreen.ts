'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';

/**
 * Enhanced fullscreen hook that provides persistent navigation bar hiding
 * even when keyboard appears, specifically for Android 15 compatibility.
 */
export const useEnhancedFullscreen = (isFullscreenEnabled: boolean) => {
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keyboardListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    const applyFullscreenSettings = async () => {
      try {
        if (isFullscreenEnabled) {
          // Hide status bar
          await StatusBar.hide();
          
          // Hide navigation bar aggressively
          const navBar = NavigationBar as any;
          if (navBar.hide) {
            await navBar.hide();
          }
          
          // Set immersive mode if available
          if (navBar.setImmersive) {
            await navBar.setImmersive({ immersive: true });
          }
          
          console.log('Fullscreen mode applied: status bar and navigation bar hidden');
        } else {
          // Show status bar
          await StatusBar.show();
          
          // Show navigation bar
          const navBar = NavigationBar as any;
          if (navBar.show) {
            await navBar.show();
          }
          
          // Disable immersive mode
          if (navBar.setImmersive) {
            await navBar.setImmersive({ immersive: false });
          }
          
          console.log('Fullscreen mode disabled: status bar and navigation bar shown');
        }
      } catch (error) {
        console.warn('Failed to apply fullscreen settings:', error);
      }
    };

    // Clear any existing intervals
    if (retryIntervalRef.current) {
      clearInterval(retryIntervalRef.current);
    }

    // Apply settings immediately
    applyFullscreenSettings();

    if (isFullscreenEnabled) {
      // Set up persistent retry for fullscreen mode (to counter Android's automatic showing)
      retryIntervalRef.current = setInterval(applyFullscreenSettings, 1000);

      // Add keyboard event listeners to re-hide navigation bar when keyboard appears
      const handleKeyboardShow = () => {
        console.log('Keyboard shown, re-applying fullscreen settings');
        setTimeout(applyFullscreenSettings, 100);
        setTimeout(applyFullscreenSettings, 500);
      };

      const handleKeyboardHide = () => {
        console.log('Keyboard hidden, re-applying fullscreen settings');
        setTimeout(applyFullscreenSettings, 100);
      };

      // Listen for window resize as a proxy for keyboard events
      const handleResize = () => {
        applyFullscreenSettings();
      };

      window.addEventListener('resize', handleResize);
      
      // Also listen for focus events to reapply settings
      const handleFocus = () => {
        applyFullscreenSettings();
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          applyFullscreenSettings();
        }
      });

      // Store cleanup function
      keyboardListenerRef.current = () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('focus', handleFocus);
      };
    }

    // Cleanup function
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      if (keyboardListenerRef.current) {
        keyboardListenerRef.current();
      }
    };
  }, [isFullscreenEnabled]);

  return {
    applyFullscreenSettings: async () => {
      if (!Capacitor.isNativePlatform()) return;
      
      try {
        if (isFullscreenEnabled) {
          await StatusBar.hide();
          const navBar = NavigationBar as any;
          if (navBar.hide) await navBar.hide();
        } else {
          await StatusBar.show();
          const navBar = NavigationBar as any;
          if (navBar.show) await navBar.show();
        }
      } catch (error) {
        console.warn('Manual fullscreen application failed:', error);
      }
    }
  };
};
