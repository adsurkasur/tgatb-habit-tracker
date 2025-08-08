'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';

// Import EdgeToEdge correctly
declare global {
  interface Window {
    EdgeToEdge?: {
      enable: () => Promise<void>;
      disable: () => Promise<void>;
      setBackgroundColor: (options: { color: string }) => Promise<void>;
      getInsets: () => Promise<any>;
    };
  }
}

/**
 * Enhanced hook to manage system status and navigation bars with Android 15 Edge-to-Edge compatibility.
 * Uses the proper EdgeToEdge plugin integration and @squareetlabs/capacitor-navigation-bar for hiding.
 */
export const useSystemBars = () => {
  const { resolvedTheme } = useTheme();
  const isInitializedRef = useRef(false);
  const reapplyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    const initializeEdgeToEdge = async () => {
      try {
        // Access EdgeToEdge from global Capacitor object
        const { EdgeToEdge } = (window as any).Capacitor?.Plugins || {};
        
        if (EdgeToEdge && !isInitializedRef.current) {
          await EdgeToEdge.enable();
          console.log('Edge-to-Edge enabled successfully');
          isInitializedRef.current = true;
        }
      } catch (e) {
        console.warn("Edge-to-Edge initialization failed:", e);
      }
    };

    const setBars = async () => {
      // Keep a constant purple to match app branding and avoid theme-induced changes
      const selectedColor = '#6750a4';
      
      try {
        // Access EdgeToEdge from global Capacitor object
        const { EdgeToEdge } = (window as any).Capacitor?.Plugins || {};
        
        // Primary method: Use EdgeToEdge plugin (recommended approach)
        if (EdgeToEdge) {
      // Do NOT color navigation bar; keep it transparent via MainActivity.
      // Only style the StatusBar (top) to purple with white icons.
      await StatusBar.show();
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: StatusBarStyles.Dark });
      await StatusBar.setBackgroundColor({ color: selectedColor });
      // Best effort: set nav bar color to purple to avoid black flashes on transient reveals
      try {
        await (NavigationBar as any).setColor?.({ color: selectedColor });
      } catch {}
      console.log(`EdgeToEdge: Status bar set to ${selectedColor} (nav bar stays transparent)`);
        } else {
          // Fallback: Use individual plugins
          await StatusBar.show();
          await StatusBar.setOverlaysWebView({ overlay: false });
          // Use Dark style to make icons WHITE on purple background
          await StatusBar.setStyle({ 
            style: StatusBarStyles.Dark 
          });
          await StatusBar.setBackgroundColor({ color: selectedColor });
          try {
            await (NavigationBar as any).setColor?.({ color: selectedColor });
          } catch {}
          
      console.log(`Fallback: Status bar set to ${selectedColor} (nav bar stays transparent)`);
        }

      } catch (e) {
        console.error("Failed to set system bar colors:", e);
      }
    };

    // Initialize EdgeToEdge on first run
    initializeEdgeToEdge();
    
    // Apply once on mount
    setBars();

    // Add visibility change listener to re-apply colors when app comes to foreground
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (reapplyTimeoutRef.current) clearTimeout(reapplyTimeoutRef.current);
        reapplyTimeoutRef.current = setTimeout(setBars, 150);
      }
    };

    const handleFocus = () => {
      if (reapplyTimeoutRef.current) clearTimeout(reapplyTimeoutRef.current);
      reapplyTimeoutRef.current = setTimeout(setBars, 150);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      if (reapplyTimeoutRef.current) clearTimeout(reapplyTimeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [resolvedTheme]);

  return { resolvedTheme };
};
