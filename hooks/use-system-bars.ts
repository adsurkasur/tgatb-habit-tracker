'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';

// Restored v0.1.0 behavior: actively set both status & navigation bar colors per theme.
export const useSystemBars = () => {
  // Theme no longer affects system bar colors; always brand purple with white icons

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

  const setBars = async () => {
  // Consistent purple background with white icons/text
  const purple = '#6750a4';
      try {
  // CRITICAL FIX: Light style = WHITE text on dark background (purple)
  await StatusBar.setStyle({ style: StatusBarStyles.Light });
  await StatusBar.setBackgroundColor({ color: purple });
        try {
          await NavigationBar.setNavigationBarColor({
            color: purple,
            darkButtons: false // false = light icons
          });
        } catch (e) { console.warn('NavigationBar.setNavigationBarColor failed:', e); }
      } catch (e) {
        console.warn('useSystemBars setBars failed:', e);
      }
    };
    setBars();
  }, []);
};
