'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';

// DEPRECATED: Replaced by SystemBarsManager. Avoid using this hook going forward.
// Minimal, non-intrusive system bar styling to avoid conflicts and blinking (legacy)
export const useSystemBars = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

    const apply = async () => {
      try {
        const info = await StatusBar.getInfo();
        // If status bar is hidden (fullscreen), do nothing
        if (info.visible === false) return;

        const isDarkMode = resolvedTheme === 'dark';
        const selectedColor = isDarkMode ? '#1e1b2e' : '#6750a4';

        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: StatusBarStyles.Dark }); // white icons
        await StatusBar.setBackgroundColor({ color: selectedColor });
      } catch (e) {
        console.warn('useSystemBars apply failed:', e);
      }
    };

    apply();
    const onFocus = () => apply();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [resolvedTheme]);
};
