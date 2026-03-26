'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { ThemeChangeEvent } from '@/components/theme-provider';

interface NavigationBarPlugin {
  setNavigationBarColor?: (opts: { color: string; darkButtons?: boolean }) => Promise<void>;
}

interface SystemUiPlugin {
  setFullscreen?: (opts: { enabled: boolean }) => Promise<void>;
  setThemeColor?: (opts: { color: string; isDark: boolean }) => Promise<void>;
}

/**
 * Unified System Bars Management Hook (Theme-Aware)
 *
 * This replaces all conflicting system bar management systems with a single,
 * properly synchronized implementation that follows Android best practices.
 *
 * Key improvements:
 * - Single source of truth for system bar state (theme + fullscreen)
 * - Theme-aware coloring: bars adapt to light/dark mode
 * - Proper synchronization and debouncing
 * - Correct StatusBar style usage (Light = white text on dark background)
 * - Robust error handling and recovery
 * - Integration with Safe Area plugin for proper edge-to-edge support
 * - Event-driven architecture: responds to theme changes without prop-drilling
 */

const DEBOUNCE_MS = 300;
let pendingApplyPromise: Promise<void> | null = null;

// Color scheme: maps theme to system bar colors
// Light mode: white/light surface, dark icons
// Dark mode: dark surface, light icons
const THEME_COLORS = {
  light: {
    surface: '#ffffff',
    darkIcons: true,
  },
  dark: {
    surface: '#1a1a1a', // Match --surface dark: hsl(258, 8%, 11%)
    darkIcons: false,
  },
};

interface SystemBarsState {
  isFullscreen: boolean;
  isDark: boolean;
  isInitialized: boolean;
}

const globalState: SystemBarsState = {
  isFullscreen: false,
  isDark: false,
  isInitialized: false,
};

/**
 * Reads current theme from DOM and localStorage
 */
const getCurrentTheme = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

export const useSystemBarsUnified = (fullscreenMode?: boolean) => {
  const debounceRef = useRef<number | null>(null);
  const lastApplyRef = useRef<number>(0);
  const [currentTheme, setCurrentTheme] = useState<boolean>(getCurrentTheme());

  const isAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  /**
   * Apply system bars with current theme and fullscreen state.
   * Guards against concurrent applies to prevent race conditions.
   */
  const applySystemBars = useCallback(
    async (forceFullscreen?: boolean, forceTheme?: boolean) => {
      if (!Capacitor.isNativePlatform()) return;
      
      // Prevent concurrent applies by returning early if one is already in-flight
      if (pendingApplyPromise) return pendingApplyPromise;

      // --- Helper functions ---
      const shouldRun = () => {
        const now = Date.now();
        if (now - lastApplyRef.current < DEBOUNCE_MS) return false;
        lastApplyRef.current = now;
        return true;
      };

      const resolveTargetFullscreen = (force?: boolean) =>
        force ?? fullscreenMode ?? globalState.isFullscreen;

      const resolveTargetTheme = (force?: boolean) =>
        force !== undefined ? force : currentTheme ?? globalState.isDark;

      const logStart = (fullscreen: boolean, isDark: boolean) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[SystemBars] Applying: fullscreen=${fullscreen}, theme=${isDark ? 'dark' : 'light'}, platform=${Capacitor.getPlatform()}`
          );
        }
      };

      const setNavColor = async (color: string, isDark: boolean) => {
        try {
          const cap = (
            window as unknown as {
              Capacitor?: { Plugins?: Record<string, unknown> };
            }
          ).Capacitor;
          const { NavigationBar } = cap?.Plugins || {};
          const nav = NavigationBar as unknown as NavigationBarPlugin | undefined;
          if (nav && typeof nav.setNavigationBarColor === 'function') {
            // darkButtons = true means light icons (for dark surface)
            await nav.setNavigationBarColor({
              color,
              darkButtons: !isDark,
            });
          }
        } catch (e) {
          console.warn('[SystemBars] NavigationBar color failed:', e);
        }
      };

      const setThemeColorViaSystemUi = async (color: string, isDark: boolean) => {
        try {
          const cap = (
            window as unknown as {
              Capacitor?: { Plugins?: Record<string, unknown> };
            }
          ).Capacitor;
          const { SystemUi } = cap?.Plugins || {};
          const sys = SystemUi as unknown as SystemUiPlugin | undefined;
          if (sys && typeof sys.setThemeColor === 'function') {
            await sys.setThemeColor({ color, isDark });
          }
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[SystemBars] SystemUi.setThemeColor not available (non-critical):', e);
          }
        }
      };

      const maybeApplySystemUi = async (target: boolean) => {
        try {
          const cap = (
            window as unknown as {
              Capacitor?: { Plugins?: Record<string, unknown> };
            }
          ).Capacitor;
          const { SystemUi } = cap?.Plugins || {};
          const sys = SystemUi as unknown as SystemUiPlugin | undefined;
          if (sys && typeof sys.setFullscreen === 'function') {
            await sys.setFullscreen({ enabled: target });
          }
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[SystemBars] SystemUi.setFullscreen not available (non-critical):', e);
          }
        }
      };

      const applyAndroidBars = async (fullscreen: boolean, isDark: boolean) => {
        if (fullscreen) {
          // Fullscreen: hide bars with transparent background
          await StatusBar.setBackgroundColor({ color: '#00000000' });
          await StatusBar.hide();
          await setNavColor('#00000000', isDark);
        } else {
          // Normal mode: show bars with theme-aware colors
          const colors = THEME_COLORS[isDark ? 'dark' : 'light'];
          await StatusBar.show();
          await StatusBar.setStyle({
            style: isDark ? StatusBarStyles.Light : StatusBarStyles.Dark,
          });
          await StatusBar.setBackgroundColor({ color: colors.surface });
          await setNavColor(colors.surface, isDark);
          // Notify native plugin if available
          await setThemeColorViaSystemUi(colors.surface, isDark);
        }
        await maybeApplySystemUi(fullscreen);
      };

      const applyIOSBars = async (fullscreen: boolean, isDark: boolean) => {
        if (fullscreen) {
          await StatusBar.hide();
        } else {
          await StatusBar.show();
          await StatusBar.setStyle({
            style: isDark ? StatusBarStyles.Light : StatusBarStyles.Dark,
          });
        }
      };

      const finalizeState = (fullscreen: boolean, isDark: boolean) => {
        globalState.isFullscreen = fullscreen;
        globalState.isDark = isDark;
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[SystemBars] Configuration completed: fullscreen=${fullscreen}, theme=${isDark ? 'dark' : 'light'}`
          );
        }
      };

      const smallSettleDelay = () => new Promise((r) => setTimeout(r, 100));

      const attemptRecovery = async (err: unknown, fullscreen: boolean, isDark: boolean) => {
        console.error('[SystemBars] Failed to apply bars, attempting recovery:', err);
        if (!fullscreen) {
          try {
            const colors = THEME_COLORS[isDark ? 'dark' : 'light'];
            await StatusBar.show();
            await StatusBar.setStyle({
              style: isDark ? StatusBarStyles.Light : StatusBarStyles.Dark,
            });
            await StatusBar.setBackgroundColor({ color: colors.surface });
          } catch (recoveryError) {
            console.error('[SystemBars] Recovery failed:', recoveryError);
          }
        }
      };

      // --- Main logic ---
      if (!shouldRun()) return;

      const targetFullscreen = resolveTargetFullscreen(forceFullscreen);
      const targetTheme = resolveTargetTheme(forceTheme);
      logStart(targetFullscreen, targetTheme);

      // Wrap in promise to track pending state
      const executeApply = async () => {
        try {
          if (isAndroid) {
            await applyAndroidBars(targetFullscreen, targetTheme);
          } else if (isIOS) {
            await applyIOSBars(targetFullscreen, targetTheme);
          }
          finalizeState(targetFullscreen, targetTheme);
          await smallSettleDelay();
        } catch (error) {
          await attemptRecovery(error, targetFullscreen, targetTheme);
        }
      };
      
      const applyPromise = executeApply();
      
      // Track pending promise; clear when this one completes
      pendingApplyPromise = applyPromise;
      applyPromise.finally(() => {
        if (pendingApplyPromise === applyPromise) {
          pendingApplyPromise = null;
        }
      });
      
      return applyPromise;
    },
    [fullscreenMode, isAndroid, isIOS, currentTheme]
  );

  const debouncedApply = useCallback(
    (forceFullscreen?: boolean, forceTheme?: boolean) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        applySystemBars(forceFullscreen, forceTheme);
      }, DEBOUNCE_MS);
    },
    [applySystemBars]
  );

  // Initialize system bars on first mount and handle fullscreen changes
  // Skip debounce for initial mount (apply immediately to prevent white-on-white on first open)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const shouldApply =
      !globalState.isInitialized ||
      (fullscreenMode !== undefined && fullscreenMode !== globalState.isFullscreen);

    if (shouldApply) {
      if (!globalState.isInitialized) {
        globalState.isInitialized = true;
        // Apply immediately without debounce - this is critical for first-render appearance
        applySystemBars(fullscreenMode, currentTheme);
      } else {
        // For subsequent fullscreen changes, use debounce
        debouncedApply(fullscreenMode, undefined);
      }
    }
  }, [applySystemBars, debouncedApply, fullscreenMode, currentTheme]);

  // Listen for theme changes from ThemeProvider
  // Apply theme changes immediately (without debounce) to ensure bars update on toggle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleThemeChange = (event: Event) => {
      if (event instanceof ThemeChangeEvent) {
        setCurrentTheme(event.isDark);
        // Apply theme change immediately without debounce - user expects instant visual feedback
        // Do not debounce theme changes; only debounce fullscreen mode (non-critical)
        applySystemBars(fullscreenMode, event.isDark);
      }
    };

    window.addEventListener('theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
    };
  }, [applySystemBars, fullscreenMode]);

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
    isDark: globalState.isDark,
    isInitialized: globalState.isInitialized,
  };
};

/**
 * Utilities for manual system bar control
 */
export const systemBarsUtils = {
  setFullscreen: async (enabled: boolean) => {
    if (!Capacitor.isNativePlatform()) return;

    const cap = (
      window as unknown as {
        Capacitor?: { Plugins?: Record<string, unknown> };
      }
    ).Capacitor;
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
        const colors = THEME_COLORS[globalState.isDark ? 'dark' : 'light'];
        await StatusBar.setStyle({
          style: globalState.isDark ? StatusBarStyles.Light : StatusBarStyles.Dark,
        });
        await StatusBar.setBackgroundColor({ color: colors.surface });
      }
    }
    globalState.isFullscreen = enabled;
  },

  setTheme: (isDark: boolean) => {
    globalState.isDark = isDark;
  },

  getState: () => ({ ...globalState }),

  reset: async () => {
    globalState.isInitialized = false;
    globalState.isFullscreen = false;
    globalState.isDark = false;
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.show();
        const colors = THEME_COLORS.light;
        await StatusBar.setStyle({ style: StatusBarStyles.Dark });
        await StatusBar.setBackgroundColor({ color: colors.surface });
      } catch (e) {
        console.warn('[SystemBars] Reset failed:', e);
      }
    }
  },
};

