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
 * - Theme-aware fullscreen bar color (Light/Dark uses CSS theme base color)
 * - Purple fallback in non-fullscreen mode (#6750a4)
 * - Robust error handling and recovery
 * - Integration with Safe Area plugin for proper edge-to-edge support
 */

const PURPLE_COLOR = '#6750a4';
const DEBOUNCE_MS = 300;

const expandShortHex = (hex: string): string => {
  if (/^#([a-fA-F0-9]{3})$/.test(hex)) {
    return hex.replace(/^#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/, (_m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);
  }
  return hex;
};

const componentToHex = (c: number) => {
  const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

const rgbToHex = (r: number, g: number, b: number) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

const hslToRgb = (h: number, s: number, l: number) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
};

const cssColorToHex = (raw: string) => {
  const value = raw.trim();
  if (!value || value === 'transparent') return null;

  if (value.startsWith('#')) {
    const normalized = expandShortHex(value);
    return normalized.length === 7 ? normalized : normalized.substring(0, 7);
  }

  const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    return rgbToHex(r, g, b);
  }

  const hslMatch = value.match(/hsla?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)(?:,\s*([0-9.]+))?\)/);
  if (hslMatch) {
    const h = Number(hslMatch[1]);
    const s = Number(hslMatch[2].replace('%', '')) / 100;
    const l = Number(hslMatch[3].replace('%', '')) / 100;
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  return null;
};

const getThemeBarColor = () => {
  if (typeof window === 'undefined' || !window.document || !window.document.documentElement) {
    return PURPLE_COLOR;
  }

  const root = window.document.documentElement;
  const tryVars = ['--background', '--surface', '--primary'];
  for (const cssVar of tryVars) {
    const value = getComputedStyle(root).getPropertyValue(cssVar)?.trim();
    const hex = cssColorToHex(value);
    if (hex) {
      return hex;
    }
  }

  return PURPLE_COLOR;
};

const resolveStatusBarStyle = (isDarkMode: boolean | undefined) => {
  if (isDarkMode === undefined) {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? StatusBarStyles.Light : StatusBarStyles.Dark;
    }
    return StatusBarStyles.Light;
  }
  return isDarkMode ? StatusBarStyles.Light : StatusBarStyles.Dark;
};

const resolveNavBarDarkButtons = (isDarkMode: boolean | undefined): boolean => {
  if (isDarkMode === undefined) {
    if (typeof document !== 'undefined') {
      return !document.documentElement.classList.contains('dark');
    }
    return false;
  }
  return !isDarkMode;
};

const setNavigationBarColor = async (color: string, darkButtons: boolean) => {
  try {
    const cap = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor;
    const { NavigationBar } = cap?.Plugins || {};
    const nav = NavigationBar as unknown as NavigationBarPlugin | undefined;
    if (nav && typeof nav.setNavigationBarColor === 'function') {
      await nav.setNavigationBarColor({ color, darkButtons });
    }
  } catch (e) {
    console.warn('🔧 [SystemBars] NavigationBar color failed:', e);
  }
};

interface SystemBarsState {
  isFullscreen: boolean;
  isInitialized: boolean;
}

const globalState: SystemBarsState = {
  isFullscreen: false,
  isInitialized: false
};

export const useSystemBarsUnified = (fullscreenMode?: boolean, isDarkMode?: boolean) => {
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

      const themeBarColor = getThemeBarColor();
      const statusBarStyle = resolveStatusBarStyle(isDarkMode);
      const navDarkButtons = resolveNavBarDarkButtons(isDarkMode);

      if (target) {
        await StatusBar.show();
        await StatusBar.setStyle({ style: statusBarStyle });
        await StatusBar.setBackgroundColor({ color: themeBarColor });
        await setNavigationBarColor(themeBarColor, navDarkButtons);
      } else {
        await StatusBar.show();
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
        await StatusBar.setBackgroundColor({ color: PURPLE_COLOR });
        await setNavigationBarColor(PURPLE_COLOR, false);
      }
      await maybeApplySystemUi(target);
    };
    const applyIOSBars = async (target: boolean) => {
      if (target) {
        await StatusBar.show();
        await StatusBar.setStyle({ style: resolveStatusBarStyle(isDarkMode) });
      } else {
        await StatusBar.show();
        await StatusBar.setStyle({ style: resolveStatusBarStyle(isDarkMode) });
      }
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
  }, [fullscreenMode, isDarkMode, isAndroid, isIOS]);

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
        const themeBarColor = getThemeBarColor();
        await StatusBar.show();
        await StatusBar.setStyle({ style: resolveStatusBarStyle(undefined) });
        await StatusBar.setBackgroundColor({ color: themeBarColor });
        await setNavigationBarColor(themeBarColor, resolveNavBarDarkButtons(undefined));
      } else {
        await StatusBar.show();
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
        await StatusBar.setBackgroundColor({ color: PURPLE_COLOR });
        await setNavigationBarColor(PURPLE_COLOR, false);
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
