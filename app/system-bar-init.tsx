"use client";
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';

// Mount at root to enforce purple system bars with white icons on cold start & after possible overrides.
export const SystemBarInit: React.FC = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
    const purple = '#6750a4';
    let cancelled = false;
    const apply = async () => {
      try {
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
        await StatusBar.setBackgroundColor({ color: purple });
        try { await NavigationBar.setNavigationBarColor({ color: purple, darkButtons: false }); } catch {}
      } catch {}
    };
    // Retry a few times to win race conditions with splash/edge-to-edge
    [0,150,500,1200].forEach(t => setTimeout(() => { if (!cancelled) apply(); }, t));
    return () => { cancelled = true; };
  }, []);
  return null;
};
