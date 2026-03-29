  // Only initialize Capacitor here; SystemBarsManager handles bars
'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { initializeCapacitor } from '@/lib/capacitor';
import { HabitStorage } from '@/lib/habit-storage';
import { warmupHaptics } from '@/lib/haptics';

export function CapacitorInit() {
  // System bar styling handled by SystemBarsManager; only initialize Capacitor here

  useEffect(() => {
    // Disable pinch-to-zoom on native Capacitor for a native app feel
    if (typeof window !== 'undefined') {
      try {
        if (Capacitor.isNativePlatform()) {
          document.documentElement.classList.add('native-app');
          const meta = document.querySelector('meta[name="viewport"]');
          if (meta) {
            const content = meta.getAttribute('content') || '';
            const additions: string[] = [];
            if (!content.includes('viewport-fit=cover')) additions.push('viewport-fit=cover');
            if (!content.includes('user-scalable')) additions.push('user-scalable=no', 'maximum-scale=1.0');
            if (additions.length > 0) {
              meta.setAttribute('content', content + ', ' + additions.join(', '));
            }
          } else {
            const newMeta = document.createElement('meta');
            newMeta.name = 'viewport';
            newMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no, maximum-scale=1.0';
            document.head.appendChild(newMeta);
          }
        }
      } catch {}
    }

    // Delay initialization to ensure the app is fully loaded
    const timer = setTimeout(() => {
        (async () => {
          try {
            // Settings no longer needed for initialization; unified system bars hook manages fullscreen
            await HabitStorage.getSettings().catch(()=>{}); // pre-warm storage (ignore errors)
            await warmupHaptics();
          } catch {}
          initializeCapacitor();
        })();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
