'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';

/**
 * Enhanced fullscreen hook that provides persistent navigation bar hiding
 * using the better @squareetlabs/capacitor-navigation-bar plugin.
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
        const { EdgeToEdge } = (window as any).Capacitor?.Plugins || {};
        
        // Always hide navigation bar regardless of fullscreen mode using better plugin
        await NavigationBar.hide();
        
        if (isFullscreenEnabled) {
          // Hide status bar for fullscreen
          await StatusBar.hide();
          
          // Set black background for fullscreen if EdgeToEdge available
          if (EdgeToEdge?.setBackgroundColor) {
            await EdgeToEdge.setBackgroundColor({ color: '#000000' }); // Black for fullscreen
          }
          
          console.log('Fullscreen mode applied: status bar hidden, navigation bar permanently hidden');
        } else {
          // Show status bar but keep navigation bar hidden
          await StatusBar.show();
          
          console.log('Normal mode: status bar shown, navigation bar permanently hidden');
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
        // Always hide navigation bar using better plugin
        await NavigationBar.hide();
        
        if (isFullscreenEnabled) {
          await StatusBar.hide();
        } else {
          await StatusBar.show();
        }
      } catch (error) {
        console.warn('Manual fullscreen application failed:', error);
      }
    }
  };
};
