'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';

/**
 * Unified System Bars Management Hook
 * 
 * This replaces all conflicting system bar management systems with a single,
 * properly synchronized implementation that follows Android best practices.
 * 
 * Key improvements:
 * - Single source of truth for system bar state
 * - Correct StatusBar style usage (Light = white text on dark background)
 * - Proper synchronization and debouncing
 * - Consistent purple theming (#6750a4)
 * - Robust error handling and recovery
 */

const PURPLE_COLOR = '#6750a4';
const DEBOUNCE_MS = 300;

interface SystemBarsState {
  isFullscreen: boolean;
  isInitialized: boolean;
}

let globalState: SystemBarsState = {
  isFullscreen: false,
  isInitialized: false
};

export const useSystemBarsUnified = (fullscreenMode?: boolean) => {
  const debounceRef = useRef<number | null>(null);
  const lastApplyRef = useRef<number>(0);
  
  const isAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  const applySystemBars = useCallback(async (forceFullscreen?: boolean) => {
    if (!Capacitor.isNativePlatform()) return;
    
    const now = Date.now();
    // Prevent rapid successive calls
    if (now - lastApplyRef.current < DEBOUNCE_MS) return;
    lastApplyRef.current = now;

    const targetFullscreen = forceFullscreen ?? fullscreenMode ?? globalState.isFullscreen;
    
    try {
      if (isAndroid) {
        // Use native SystemUi plugin for Android when available
        const { SystemUi } = (window as any).Capacitor?.Plugins || {};
        
        if (SystemUi) {
          // Prefer native plugin for consistent behavior
          await SystemUi.setFullscreen({ enabled: targetFullscreen });
          globalState.isFullscreen = targetFullscreen;
          return;
        }
        
        // Fallback to Capacitor StatusBar API
        if (targetFullscreen) {
          await StatusBar.hide();
          try {
            await NavigationBar.setNavigationBarColor({ 
              color: '#000000', 
              darkButtons: false 
            });
          } catch (e) {
            console.warn('NavigationBar.setNavigationBarColor failed:', e);
          }
        } else {
          await StatusBar.show();
          // CRITICAL: Light style = WHITE text on purple background
          await StatusBar.setStyle({ style: StatusBarStyles.Light });
          await StatusBar.setBackgroundColor({ color: PURPLE_COLOR });
          try {
            await NavigationBar.setNavigationBarColor({ 
              color: PURPLE_COLOR, 
              darkButtons: false 
            });
          } catch (e) {
            console.warn('NavigationBar.setNavigationBarColor failed:', e);
          }
        }
      } else if (isIOS) {
        // iOS implementation
        if (targetFullscreen) {
          await StatusBar.hide();
        } else {
          await StatusBar.show();
          // Use Light style for white text on dark backgrounds
          await StatusBar.setStyle({ style: StatusBarStyles.Light });
        }
      }
      
      globalState.isFullscreen = targetFullscreen;
      console.log(`System bars applied: fullscreen=${targetFullscreen}`);
      
    } catch (error) {
      console.error('Failed to apply system bars:', error);
      // Recovery: try basic configuration
      try {
        if (!targetFullscreen) {
          await StatusBar.show();
          await StatusBar.setStyle({ style: StatusBarStyles.Light });
          await StatusBar.setBackgroundColor({ color: PURPLE_COLOR });
        }
      } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError);
      }
    }
  }, [fullscreenMode, isAndroid, isIOS]);

  const debouncedApply = useCallback((forceFullscreen?: boolean) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      applySystemBars(forceFullscreen);
    }, DEBOUNCE_MS);
  }, [applySystemBars]);

  // Initialize system bars on first mount
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    if (!globalState.isInitialized) {
      globalState.isInitialized = true;
      // Apply immediately on first initialization
      applySystemBars();
    }
  }, [applySystemBars]);

  // Apply changes when fullscreen mode changes
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (fullscreenMode !== undefined) {
      debouncedApply(fullscreenMode);
    }
  }, [fullscreenMode, debouncedApply]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    applySystemBars,
    debouncedApply,
    isFullscreen: globalState.isFullscreen,
    isInitialized: globalState.isInitialized
  };
};

// Export utilities for manual control
export const systemBarsUtils = {
  setFullscreen: async (enabled: boolean) => {
    if (!Capacitor.isNativePlatform()) return;
    
    const { SystemUi } = (window as any).Capacitor?.Plugins || {};
    if (SystemUi) {
      await SystemUi.setFullscreen({ enabled });
    } else {
      // Fallback implementation
      if (enabled) {
        await StatusBar.hide();
      } else {
        await StatusBar.show();
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
        await StatusBar.setBackgroundColor({ color: PURPLE_COLOR });
      }
    }
    globalState.isFullscreen = enabled;
  },
  
  getState: () => ({ ...globalState }),
  
  reset: async () => {
    globalState.isInitialized = false;
    globalState.isFullscreen = false;
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.show();
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
        await StatusBar.setBackgroundColor({ color: PURPLE_COLOR });
      } catch (e) {
        console.warn('Reset failed:', e);
      }
    }
  }
};
