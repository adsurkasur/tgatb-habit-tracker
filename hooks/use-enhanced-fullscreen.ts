'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';

/**
 * Enhanced fullscreen hook that provides persistent navigation bar hiding
 * using the better @squareetlabs/capacitor-navigation-bar plugin.
 */
export const useEnhancedFullscreen = (isFullscreenEnabled: boolean) => {
  const reapplyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    const applyFullscreenSettings = async () => {
      try {
        const { EdgeToEdge } = (window as any).Capacitor?.Plugins || {};
  const Immersive = (window as any).Capacitor?.Plugins?.Immersive;
        
        // Only hide navigation bar in fullscreen mode
        if (isFullscreenEnabled) {
          // Set nav bar color to purple before hide to avoid black flash during transient reveals
          try { await (NavigationBar as any).setColor?.({ color: '#6750a4' }); } catch {}
          await NavigationBar.hide();
        }
        
        if (isFullscreenEnabled) {
          // Hide status bar for fullscreen
          await StatusBar.hide();
          try { await Immersive?.enable?.(); } catch {}
          
          // Set black background for fullscreen if EdgeToEdge available
          if (EdgeToEdge?.setBackgroundColor) {
            await EdgeToEdge.setBackgroundColor({ color: '#000000' }); // Black for fullscreen
          }
          
          console.log('Fullscreen mode applied: status bar hidden, navigation bar permanently hidden');
        } else {
          // Show status bar but keep navigation bar hidden
          await StatusBar.show();
          try { await Immersive?.disable?.(); } catch {}
          
          // Restore purple background and white icons when exiting fullscreen
          if (EdgeToEdge?.setBackgroundColor) {
            await EdgeToEdge.setBackgroundColor({ color: '#6750a4' }); // Purple background
          } else {
            // Fallback: use StatusBar plugin
            await StatusBar.setBackgroundColor({ color: '#6750a4' });
          }
          
          // Set white icons on purple background
          await StatusBar.setStyle({ style: StatusBarStyles.Dark });
          
          console.log('Normal mode: status bar shown with purple background and white icons, navigation bar permanently hidden');
        }
      } catch (error) {
        console.warn('Failed to apply fullscreen settings:', error);
      }
    };

    // Apply settings immediately
    applyFullscreenSettings();

    // Re-apply on focus/visibility/orientation with debounce (no intervals)
    const debouncedReapply = () => {
      if (reapplyTimeoutRef.current) clearTimeout(reapplyTimeoutRef.current);
      reapplyTimeoutRef.current = setTimeout(applyFullscreenSettings, 150);
    };

    const handleFocus = () => debouncedReapply();
    const handleVisibility = () => { if (!document.hidden) debouncedReapply(); };
    const handleResize = () => debouncedReapply();

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      if (reapplyTimeoutRef.current) clearTimeout(reapplyTimeoutRef.current);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreenEnabled]);

  return {
    applyFullscreenSettings: async () => {
      if (!Capacitor.isNativePlatform()) return;
      
      try {
        // Hide navigation bar only when fullscreen is enabled
        if (isFullscreenEnabled) {
          try { await (NavigationBar as any).setColor?.({ color: '#6750a4' }); } catch {}
          await NavigationBar.hide();
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
