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
 * - Integration with Safe Area plugin for proper edge-to-edge support
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
    if (!shouldRun(lastApplyRef, DEBOUNCE_MS)) return;
    const targetFullscreen = resolveTargetFullscreen(forceFullscreen, fullscreenMode);
    logStart(targetFullscreen);
    try {
      if (isAndroid) {
        await applyAndroidBars(targetFullscreen);
      } else if (isIOS) {
        await applyIOSBars(targetFullscreen);
      }
      finalizeState(targetFullscreen);
      await smallSettleDelay();
    } catch (error) {
      await attemptRecovery(error, targetFullscreen);
    }
  }, [fullscreenMode, isAndroid, isIOS]);

  // --- Helper functions (declared below) ---
  const shouldRun = (last: React.MutableRefObject<number>, debounce: number) => {
    const now = Date.now();
    if (now - last.current < debounce) return false;
    last.current = now; return true;
  };
  const resolveTargetFullscreen = (force?: boolean, modeParam?: boolean) => force ?? modeParam ?? globalState.isFullscreen;
  const logStart = (target: boolean) => {
    console.log(`🔧 [SystemBars] Starting application: fullscreen=${target}, platform=${Capacitor.getPlatform()}`);
    console.log(`🔧 [SystemBars] Global state: isInitialized=${globalState.isInitialized}, isFullscreen=${globalState.isFullscreen}`);
  };
  const applyAndroidBars = async (target: boolean) => {
    const plugins = Object.keys((window as any).Capacitor?.Plugins || {});
    console.log(`🔧 [SystemBars] Available plugins: ${plugins.join(', ')}`);
    console.log(`🔧 [SystemBars] Using StatusBar API as primary method`);
    if (target) {
      // Set status bar color to transparent for fullscreen/cutout devices
      await StatusBar.setBackgroundColor({ color: '#00000000' });
      await StatusBar.hide();
      await setNavColor('#00000000');
    } else {
      await StatusBar.show();
      await StatusBar.setStyle({ style: StatusBarStyles.Light });
      await StatusBar.setBackgroundColor({ color: PURPLE_COLOR });
      await setNavColor(PURPLE_COLOR);
    }
    await maybeApplySystemUi(target);
  };
  const setNavColor = async (color: string) => {
    try {
      const { NavigationBar } = (window as any).Capacitor?.Plugins || {};
      if (NavigationBar) {
        await NavigationBar.setNavigationBarColor({ color, darkButtons: false });
      }
    } catch (e) { console.warn('🔧 [SystemBars] NavigationBar color failed:', e); }
  };
  const maybeApplySystemUi = async (target: boolean) => {
    try {
      const { SystemUi } = (window as any).Capacitor?.Plugins || {};
      if (SystemUi) { await SystemUi.setFullscreen({ enabled: target }); }
    } catch (e) { console.warn('🔧 [SystemBars] SystemUi enhancement failed (non-critical):', e); }
  };
  const applyIOSBars = async (target: boolean) => {
    if (target) { await StatusBar.hide(); } else { await StatusBar.show(); await StatusBar.setStyle({ style: StatusBarStyles.Light }); }
  };
  const finalizeState = (target: boolean) => {
    globalState.isFullscreen = target;
    console.log(`🔧 [SystemBars] System bars configuration completed: fullscreen=${target}`);
  };
  const smallSettleDelay = () => new Promise(r => setTimeout(r, 100));
  const attemptRecovery = async (err: unknown, target: boolean) => {
    console.error('Failed to apply system bars:', err);
    if (!target) {
      try {
        await StatusBar.show();
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
        await StatusBar.setBackgroundColor({ color: PURPLE_COLOR });
      } catch (recoveryError) { console.error('Recovery failed:', recoveryError); }
    }
  };

  const debouncedApply = useCallback((forceFullscreen?: boolean) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      applySystemBars(forceFullscreen);
    }, DEBOUNCE_MS);
  }, [applySystemBars]);

  // Initialize system bars on first mount and handle fullscreen changes
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    // Only apply if this is the first initialization OR if fullscreen mode has explicitly changed
    const shouldApply = !globalState.isInitialized || (fullscreenMode !== undefined && fullscreenMode !== globalState.isFullscreen);
    
    if (shouldApply) {
      if (!globalState.isInitialized) {
        globalState.isInitialized = true;
        // Apply immediately on first initialization
        applySystemBars(fullscreenMode);
      } else {
        // Use debounced apply for subsequent changes
        debouncedApply(fullscreenMode);
      }
    }
  }, [applySystemBars, debouncedApply, fullscreenMode]);

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
