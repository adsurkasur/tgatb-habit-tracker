'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';

interface NavigationBarPlugin { setNavigationBarColor?: (opts: { color: string; darkButtons?: boolean }) => Promise<void> }
interface SystemUiPlugin { setFullscreen?: (opts: { enabled: boolean }) => Promise<void> }

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

const globalState: SystemBarsState = {
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

    // --- Helper functions (inside useCallback to satisfy exhaustive-deps) ---
    const shouldRun = () => {
      const now = Date.now();
      if (now - lastApplyRef.current < DEBOUNCE_MS) return false;
      lastApplyRef.current = now; return true;
    };
    const resolveTargetFullscreen = (force?: boolean) => force ?? fullscreenMode ?? globalState.isFullscreen;
    const logStart = (target: boolean) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[SystemBars] Starting application: fullscreen=${target}, platform=${Capacitor.getPlatform()}`);
        console.log(`[SystemBars] Global state: isInitialized=${globalState.isInitialized}, isFullscreen=${globalState.isFullscreen}`);
      }
    };
    const setNavColor = async (color: string) => {
      try {
        const cap = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor;
        const { NavigationBar } = cap?.Plugins || {};
        const nav = NavigationBar as unknown as NavigationBarPlugin | undefined;
        if (nav && typeof nav.setNavigationBarColor === 'function') {
          await nav.setNavigationBarColor({ color, darkButtons: false });
        }
      } catch (e) { console.warn('🔧 [SystemBars] NavigationBar color failed:', e); }
    };
    const maybeApplySystemUi = async (target: boolean) => {
      try {
        const cap = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor;
        const { SystemUi } = cap?.Plugins || {};
        const sys = SystemUi as unknown as SystemUiPlugin | undefined;
        if (sys && typeof sys.setFullscreen === 'function') { await sys.setFullscreen({ enabled: target }); }
      } catch (e) { console.warn('🔧 [SystemBars] SystemUi enhancement failed (non-critical):', e); }
    };
    const applyAndroidBars = async (target: boolean) => {
      type CapacitorPlugins = Record<string, unknown>;
      const cap = (window as unknown as { Capacitor?: { Plugins?: CapacitorPlugins } }).Capacitor;
      const plugins = Object.keys(cap?.Plugins || {});
      if (process.env.NODE_ENV !== "production") {
        console.log(`[SystemBars] Available plugins: ${plugins.join(', ')}`);
        console.log(`[SystemBars] Using StatusBar API as primary method`);
      }
      if (target) {
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
    const applyIOSBars = async (target: boolean) => {
      if (target) { await StatusBar.hide(); } else { await StatusBar.show(); await StatusBar.setStyle({ style: StatusBarStyles.Light }); }
    };
    const finalizeState = (target: boolean) => {
      globalState.isFullscreen = target;
      if (process.env.NODE_ENV !== "production") {
        console.log(`[SystemBars] System bars configuration completed: fullscreen=${target}`);
      }
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

    // --- Main logic ---
    if (!shouldRun()) return;
    const targetFullscreen = resolveTargetFullscreen(forceFullscreen);
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
    
    const cap = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor;
    const { SystemUi } = cap?.Plugins || {};
    const sys = SystemUi as unknown as SystemUiPlugin | undefined;
    if (sys && typeof sys.setFullscreen === 'function') {
      await sys.setFullscreen({ enabled });
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
