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
            // Settings no longer needed for initialization; unified system bars hook manages fullscreen
            await HabitStorage.getSettings().catch(()=>{}); // pre-warm storage (ignore errors)
          } catch {}
          initializeCapacitor();
        })();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
