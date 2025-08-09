'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { App } from '@capacitor/app';

/**
 * DEPRECATED: Replaced by SystemBarsManager component for centralized fullscreen & bar control.
 * (Legacy) Enhanced fullscreen hook that provided persistent navigation bar hiding.
 */
export const useEnhancedFullscreen = (isFullscreenEnabled: boolean) => {
  const debounceRef = useRef<number | null>(null);
  const keyboardListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    // Debounced fullscreen settings application
    const applyFullscreenSettings = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(async () => {
        try {
          const { EdgeToEdge } = (window as any).Capacitor?.Plugins || {};
          // @capgo plugin cannot hide the bar, only set color; rely on fullscreen flag for status bar
          try {
            await NavigationBar.setNavigationBarColor({ color: '#000000', darkButtons: false });
          } catch {}
          // Optionally, for Android 11+, make nav bar fully transparent:
          if (isFullscreenEnabled) {
            await StatusBar.hide();
            if (EdgeToEdge?.setBackgroundColor) {
              await EdgeToEdge.setBackgroundColor({ color: '#000000' });
            }
          } else {
            await StatusBar.show();
            if (EdgeToEdge?.setBackgroundColor) {
              await EdgeToEdge.setBackgroundColor({ color: '#6750a4' });
            } else {
              await StatusBar.setBackgroundColor({ color: '#6750a4' });
            }
            // CRITICAL FIX: Light style = WHITE text on purple background
            await StatusBar.setStyle({ style: StatusBarStyles.Light });
            try { await NavigationBar.setNavigationBarColor({ color: '#6750a4', darkButtons: false }); } catch {}
          }
        } catch (error) {
          console.warn('Failed to apply fullscreen settings:', error);
        }
      }, 400); // Only allow once every 400ms
    };

    // Apply settings immediately
    applyFullscreenSettings();

    // Only reapply fullscreen after specific events, debounced
    if (isFullscreenEnabled) {
      const handleResize = () => applyFullscreenSettings();
      const handleFocus = () => applyFullscreenSettings();
      const handleVisibility = () => {
        if (!document.hidden) applyFullscreenSettings();
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibility);
      // Re-apply when app resumes
      const resumeHandle = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) applyFullscreenSettings();
      });

      keyboardListenerRef.current = () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibility);
        // Cleanup app listener
        Promise.resolve(resumeHandle).then(h => h.remove?.()).catch(() => {});
      };
    }

    // Cleanup function
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
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
  // Only color adjustment available
  const navColor = isFullscreenEnabled ? '#000000' : '#6750a4';
  await NavigationBar.setNavigationBarColor({ color: navColor, darkButtons: false });
        
        if (isFullscreenEnabled) {
          await StatusBar.hide();
        } else {
          await StatusBar.show();
          // Restore purple background and white icons
          await StatusBar.setBackgroundColor({ color: '#6750a4' });
          await StatusBar.setStyle({ style: StatusBarStyles.Dark });
        }
      } catch (error) {
        console.warn('Manual fullscreen application failed:', error);
      }
    }
  };
};
