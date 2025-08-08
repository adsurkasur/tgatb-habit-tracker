'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';

/**
 * A hook to manage the system status and navigation bars based on the app theme.
 * Enhanced for Android 15 Edge-to-Edge compatibility.
 */
export const useSystemBars = () => {
  const { resolvedTheme } = useTheme();

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
        // Force status bar configuration multiple times to override Android 15 defaults
        await StatusBar.show();
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
        await StatusBar.setBackgroundColor({ color: selectedColor });
        
        // Additional attempts to ensure color sticks on Android 15
        setTimeout(async () => {
          await StatusBar.setBackgroundColor({ color: selectedColor });
        }, 100);
        
        setTimeout(async () => {
          await StatusBar.setBackgroundColor({ color: selectedColor });
        }, 500);

        // Navigation Bar configuration with multiple attempts
        try {
          const navBar = NavigationBar as any;
          
          // Show and configure navigation bar
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
          
          // Additional attempts for navigation bar
          setTimeout(async () => {
            if (navBar.setColor) {
              await navBar.setColor({
                color: selectedColor,
                darkButtons: false,
              });
            }
          }, 100);
          
        } catch (e) {
          console.warn("Navigation bar configuration failed:", e);
        }
        
        console.log(`System bars set to ${selectedColor} for ${isDarkMode ? 'dark' : 'light'} theme`);
      } catch (e) {
        console.error("Failed to set system bar colors:", e);
      }
    };

    // Set immediately and with delays to handle Android 15 timing issues
    setBars();
    setTimeout(setBars, 500);
    setTimeout(setBars, 1000);
  }, [resolvedTheme]);

  return { resolvedTheme };
};
