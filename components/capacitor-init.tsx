  // Only initialize Capacitor here; SystemBarsManager handles bars
'use client';

import { useEffect } from 'react';
import { initializeCapacitor } from '@/lib/capacitor';
import { HabitStorage } from '@/lib/habit-storage';

export function CapacitorInit() {
  // System bar styling handled by SystemBarsManager; only initialize Capacitor here

  useEffect(() => {
    // Delay initialization to ensure the app is fully loaded
    const timer = setTimeout(() => {
        (async () => {
          try {
            // Load user settings to apply fullscreen mode
            const userSettings = await HabitStorage.getSettings();
            initializeCapacitor({ fullscreenMode: userSettings.fullscreenMode });
          } catch (error) {
            console.error('CapacitorInit error:', error);
            // Fallback initialization without settings
            initializeCapacitor();
          }
        })();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
