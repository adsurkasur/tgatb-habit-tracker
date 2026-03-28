'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';

interface NavigationBarPlugin { setNavigationBarColor?: (opts: { color: string; darkButtons?: boolean }) => Promise<void> }
interface SystemUiPlugin { setFullscreen?: (opts: { enabled: boolean; darkMode?: boolean }) => Promise<void> }

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
const LIGHT_SURFACE_COLOR = '#ffffff';
const DARK_SURFACE_COLOR = '#201e24';
const DEBOUNCE_MS = 300;

interface SystemBarsState {
  isFullscreen: boolean;
  isDarkMode: boolean;
  isInitialized: boolean;
}

const globalState: SystemBarsState = {
  isFullscreen: false,
  isDarkMode: false,
  isInitialized: false
};

export const useSystemBarsUnified = (fullscreenMode?: boolean, isDarkMode?: boolean) => {
  const debounceRef = useRef<number | null>(null);
  const lastDarkModeRef = useRef<boolean | undefined>(undefined);
  const lastFullscreenRef = useRef<boolean | undefined>(undefined);
  
  const isAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  const applySystemBars = useCallback(async (forceFullscreen?: boolean) => {
    if (!Capacitor.isNativePlatform()) return;

    // --- Helper functions (inside useCallback to satisfy exhaustive-deps) ---
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
        const darkMode = isDarkMode ?? globalState.isDarkMode;
        const cap = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor;
        const { SystemUi } = cap?.Plugins || {};
        const sys = SystemUi as unknown as SystemUiPlugin | undefined;
        if (sys && typeof sys.setFullscreen === 'function') { await sys.setFullscreen({ enabled: target, darkMode }); }
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
      
      // Resolve the current dark mode state
      const darkMode = isDarkMode ?? globalState.isDarkMode;
      
      if (target) {
        // Fullscreen mode: use theme-aware colors
        const barColor = darkMode ? DARK_SURFACE_COLOR : LIGHT_SURFACE_COLOR;
        const useDarkIcons = !darkMode;
        await StatusBar.show();
        await StatusBar.setStyle({ style: useDarkIcons ? StatusBarStyles.Dark : StatusBarStyles.Light });
        await StatusBar.setBackgroundColor({ color: barColor });
        await setNavColor(barColor);
      } else {
        // Non-fullscreen mode: use purple
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
      globalState.isDarkMode = isDarkMode ?? globalState.isDarkMode;
      if (process.env.NODE_ENV !== "production") {
        console.log(`[SystemBars] System bars configuration completed: fullscreen=${target}, darkMode=${globalState.isDarkMode}`);
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
    // Skip debounce gate for initialization and theme-only changes (critical updates)
    // Keep debounce only for repeated fullscreen changes (non-critical)
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
  }, [fullscreenMode, isDarkMode, isAndroid, isIOS]);

  const debouncedApply = useCallback((forceFullscreen?: boolean) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      applySystemBars(forceFullscreen);
    }, DEBOUNCE_MS);
  }, [applySystemBars]);

  // Track if dark mode changed to apply immediately (critical for first-open)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    // Dark mode changes are CRITICAL: apply immediately, never debounce
    if (isDarkMode !== lastDarkModeRef.current) {
      lastDarkModeRef.current = isDarkMode;
      // Apply immediately for theme changes
      applySystemBars(fullscreenMode);
    }
  }, [isDarkMode, fullscreenMode, applySystemBars]);

  // Initialize system bars on first mount and handle fullscreen changes (debounced)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    // Only apply if this is the first initialization OR if fullscreen mode has changed
    const shouldApply = !globalState.isInitialized || (fullscreenMode !== undefined && fullscreenMode !== lastFullscreenRef.current);
    
    if (shouldApply) {
      if (!globalState.isInitialized) {
        globalState.isInitialized = true;
        lastFullscreenRef.current = fullscreenMode;
        lastDarkModeRef.current = isDarkMode;
        // Apply immediately on first initialization (no debounce)
        applySystemBars(fullscreenMode);
      } else if (fullscreenMode !== lastFullscreenRef.current) {
        // Fullscreen changes are debounced (non-critical)
        lastFullscreenRef.current = fullscreenMode;
        debouncedApply(fullscreenMode);
      }
    }
  }, [applySystemBars, debouncedApply, fullscreenMode, isDarkMode]);

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
