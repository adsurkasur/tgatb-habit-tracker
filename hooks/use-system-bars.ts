'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';

/**
 * Enhanced hook to manage system status and navigation bars with Android 15 Edge-to-Edge compatibility.
 * Uses aggressive retry logic and activity lifecycle integration.
 */
export const useSystemBars = () => {
  const { resolvedTheme } = useTheme();
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    const setBars = async () => {
      const isDarkMode = resolvedTheme === 'dark';
      
      // Define colors based on your app's purple theme
      const lightThemeColor = '#6750a4'; // Primary purple
      const darkThemeColor = '#1e1b2e'; // Dark purple
      const selectedColor = isDarkMode ? darkThemeColor : lightThemeColor;
      
      try {
        // Force status bar configuration multiple times
        await StatusBar.show();
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
        await StatusBar.setBackgroundColor({ color: selectedColor });
        
        // Navigation Bar configuration
        try {
          const navBar = NavigationBar as any;
          
          if (navBar.show) await navBar.show();
          if (navBar.setColor) {
            await navBar.setColor({
              color: selectedColor,
              darkButtons: false,
            });
          }
          if (navBar.setBackgroundColor) {
            await navBar.setBackgroundColor({
              color: selectedColor,
              darkButtons: false,
            });
          }
        } catch (e) {
          console.warn("Navigation bar configuration failed:", e);
        }
        
        console.log(`System bars set to ${selectedColor} for ${isDarkMode ? 'dark' : 'light'} theme`);
      } catch (e) {
        console.error("Failed to set system bar colors:", e);
      }
    };

    // Clear any existing retry interval
    if (retryIntervalRef.current) {
      clearInterval(retryIntervalRef.current);
    }

    // Set immediately
    setBars();
    
    // Set up persistent retry mechanism for Android 15
    retryIntervalRef.current = setInterval(setBars, 2000); // Retry every 2 seconds
    
    // Also retry with delays to handle Android 15 timing issues
    const timeouts = [100, 500, 1000, 2000, 5000];
    timeouts.forEach(delay => {
      setTimeout(setBars, delay);
    });

    // Add visibility change listener to re-apply colors when app comes to foreground
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(setBars, 100);
        setTimeout(setBars, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', setBars);

    // Cleanup
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', setBars);
    };
  }, [resolvedTheme]);

  return { resolvedTheme };
};
