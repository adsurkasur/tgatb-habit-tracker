'use client';

import { useEffect } from 'react';
import { initializeCapacitor } from '@/lib/capacitor';

export function CapacitorInit() {
  useEffect(() => {
    // Delay initialization to ensure the app is fully loaded
    const timer = setTimeout(() => {
      try {
        initializeCapacitor();
      } catch (error) {
        console.error('CapacitorInit error:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
