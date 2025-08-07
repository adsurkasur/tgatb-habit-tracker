'use client';

import { useEffect } from 'react';
import { initializeCapacitor } from '@/lib/capacitor';

export function CapacitorInit() {
  useEffect(() => {
    initializeCapacitor();
  }, []);

  return null;
}
