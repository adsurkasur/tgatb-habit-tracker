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
          // Ensure nav bar is fully hidden & transparent
          try {
            if (typeof NavigationBar.setTransparency === 'function') {
              await NavigationBar.setTransparency({ isTransparent: true });
            }
            await NavigationBar.hide();
            // Re-apply shortly after to fight insets race conditions
            setTimeout(() => { NavigationBar.hide().catch(() => {}); }, 120);
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
            await StatusBar.setStyle({ style: StatusBarStyles.Dark });
            try {
              await NavigationBar.show();
              if (typeof NavigationBar.setColor === 'function') {
                await NavigationBar.setColor({ color: '#6750a4', darkButtons: false });
              }
            } catch {}
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
        if (isFullscreenEnabled) {
          await NavigationBar.hide();
          if (typeof NavigationBar.setTransparency === 'function') {
            await NavigationBar.setTransparency({ isTransparent: true });
          }
        } else {
          await NavigationBar.show();
          if (typeof NavigationBar.setColor === 'function') {
            await NavigationBar.setColor({ color: '#6750a4', darkButtons: false });
          }
        }
        
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
