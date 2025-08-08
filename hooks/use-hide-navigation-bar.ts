'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to permanently hide the Android navigation bar throughout the app.
 * Uses the specialized @squareetlabs/capacitor-navigation-bar plugin
 * which is designed specifically for hiding navigation bars.
 */
// This hook intentionally does nothing now to avoid conflicting with other bar controllers.
// Keeping export to minimize invasive code changes where it is imported.
export const useHideNavigationBar = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
    // No-op: we respect current nav bar state. Flicker source removed.
  }, []);
};
