'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';

/**
 * A hook to manage the system status and navigation bars based on the app theme.
 */
export const useSystemBars = () => {
  const { resolvedTheme } = useTheme(); // Use resolvedTheme to handle 'system' theme setting

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    const setBars = async () => {
      const isDarkMode = resolvedTheme === 'dark';
      
      // Define colors based on your app's purple theme
      // Light theme: Purple background with light text
      // Dark theme: Dark purple/slate background with light text
      const lightThemeColor = '#6750a4'; // Primary purple from your theme
      const darkThemeColor = '#1e1b2e'; // Dark purple/slate for dark mode
      
      try {
        // Set Status Bar style and color
        await StatusBar.setStyle({ 
          style: StatusBarStyles.Light // Always light text since both themes use dark backgrounds
        });
        await StatusBar.setBackgroundColor({ 
          color: isDarkMode ? darkThemeColor : lightThemeColor 
        });

        // Set Navigation Bar style and color
        // Using 'as any' to bypass TypeScript issues with the plugin's type definitions
        await (NavigationBar as any).setColor({
          color: isDarkMode ? darkThemeColor : lightThemeColor,
          darkButtons: false, // Light buttons/icons for dark backgrounds
        });
        
        console.log(`System bars updated for ${isDarkMode ? 'dark' : 'light'} theme`);
      } catch (e) {
        console.error("Failed to set system bar colors:", e);
      }
    };

    setBars();
  }, [resolvedTheme]);

  return { resolvedTheme };
};
