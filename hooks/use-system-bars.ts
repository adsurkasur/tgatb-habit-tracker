'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';

// Import EdgeToEdge correctly
declare global {
  interface Window {
    EdgeToEdge?: {
      enable: () => Promise<void>;
      disable: () => Promise<void>;
      setBackgroundColor: (options: { color: string }) => Promise<void>;
      getInsets: () => Promise<any>;
    };
  }
}

/**
 * Enhanced hook to manage system status and navigation bars with Android 15 Edge-to-Edge compatibility.
 * Uses the proper EdgeToEdge plugin integration and @squareetlabs/capacitor-navigation-bar for hiding.
 */
export const useSystemBars = () => {
  const { resolvedTheme } = useTheme();
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    const initializeEdgeToEdge = async () => {
      try {
        // Access EdgeToEdge from global Capacitor object
        const { EdgeToEdge } = (window as any).Capacitor?.Plugins || {};
        
        if (EdgeToEdge && !isInitializedRef.current) {
          await EdgeToEdge.enable();
          console.log('Edge-to-Edge enabled successfully');
          isInitializedRef.current = true;
        }
      } catch (e) {
        console.warn("Edge-to-Edge initialization failed:", e);
      }
    };

    const setBars = async () => {
      const isDarkMode = resolvedTheme === 'dark';
      
      // Define colors based on your app's purple theme
      const lightThemeColor = '#6750a4'; // Primary purple
      const darkThemeColor = '#1e1b2e'; // Dark purple
      const selectedColor = isDarkMode ? darkThemeColor : lightThemeColor;
      
      try {
        // Access EdgeToEdge from global Capacitor object
        const { EdgeToEdge } = (window as any).Capacitor?.Plugins || {};
        
        // Primary method: Use EdgeToEdge plugin (recommended approach)
        if (EdgeToEdge) {
          await EdgeToEdge.setBackgroundColor({ color: selectedColor });
          // Use Dark style to make icons WHITE on purple background
          await StatusBar.setStyle({ 
            style: StatusBarStyles.Dark 
          });
          console.log(`EdgeToEdge: System bars set to ${selectedColor} with white icons`);
        } else {
          // Fallback: Use individual plugins
          await StatusBar.show();
          await StatusBar.setOverlaysWebView({ overlay: false });
          // Use Dark style to make icons WHITE on purple background
          await StatusBar.setStyle({ 
            style: StatusBarStyles.Dark 
          });
          await StatusBar.setBackgroundColor({ color: selectedColor });
          
          console.log(`Fallback: System bars set to ${selectedColor} with white icons`);
        }

        // Always hide navigation bar completely using the better plugin
        // Apply multiple times to prevent brief appearances
        try {
          await NavigationBar.hide();
          // Immediate re-hide to prevent brief appearances
          setTimeout(async () => {
            await NavigationBar.hide();
          }, 50);
          setTimeout(async () => {
            await NavigationBar.hide();
          }, 100);
          setTimeout(async () => {
            await NavigationBar.hide();
          }, 200);
          console.log('Navigation bar permanently hidden with aggressive hiding');
        } catch (e) {
          console.warn("Navigation bar hiding failed:", e);
        }
        
      } catch (e) {
        console.error("Failed to set system bar colors:", e);
      }
    };

    // Initialize EdgeToEdge on first run
    initializeEdgeToEdge();

    // Clear any existing retry interval
    if (retryIntervalRef.current) {
      clearInterval(retryIntervalRef.current);
    }

    // Set immediately
    setBars();
    
    // Set up persistent retry mechanism for Android 15
    retryIntervalRef.current = setInterval(setBars, 3000); // Retry every 3 seconds
    
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

    const handleFocus = () => {
      setBars();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [resolvedTheme]);

  return { resolvedTheme };
};
