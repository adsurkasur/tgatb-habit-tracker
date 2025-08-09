'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';

// Restored v0.1.0 behavior: actively set both status & navigation bar colors per theme.
export const useSystemBars = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

    const setBars = async () => {
      const isDarkMode = resolvedTheme === 'dark';
      const lightThemeColor = '#6750a4';
      const darkThemeColor = '#1e1b2e';
      try {
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
        await StatusBar.setBackgroundColor({ color: isDarkMode ? darkThemeColor : lightThemeColor });
        try {
          await (NavigationBar as any).setColor({
            color: isDarkMode ? darkThemeColor : lightThemeColor,
            darkButtons: false
          });
        } catch (e) { console.warn('NavigationBar.setColor failed:', e); }
      } catch (e) {
        console.warn('useSystemBars setBars failed:', e);
      }
    };
    setBars();
  }, [resolvedTheme]);
};
