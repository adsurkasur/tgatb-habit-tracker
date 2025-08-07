'use client';

import { useEffect } from 'react';
import { initializeCapacitor } from '@/lib/capacitor';
import { HabitStorage } from '@/lib/habit-storage';
import { useSystemBars } from '@/hooks/use-system-bars';

export function CapacitorInit() {
  useSystemBars(); // Hook to manage system bar colors based on theme

  useEffect(() => {
    // Delay initialization to ensure the app is fully loaded
    const timer = setTimeout(() => {
      try {
        // Load user settings to apply fullscreen mode
        const userSettings = HabitStorage.getSettings();
        initializeCapacitor({ fullscreenMode: userSettings.fullscreenMode });
      } catch (error) {
        console.error('CapacitorInit error:', error);
        // Fallback initialization without settings
        initializeCapacitor();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
