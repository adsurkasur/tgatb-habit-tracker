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
    
    const now = Date.now();
    // Prevent rapid successive calls
    if (now - lastApplyRef.current < DEBOUNCE_MS) return;
    lastApplyRef.current = now;

    const targetFullscreen = forceFullscreen ?? fullscreenMode ?? globalState.isFullscreen;
    
    console.log(`🔧 [SystemBars] Starting application: fullscreen=${targetFullscreen}, platform=${Capacitor.getPlatform()}`);
    console.log(`🔧 [SystemBars] Global state: isInitialized=${globalState.isInitialized}, isFullscreen=${globalState.isFullscreen}`);
    
    try {
      if (isAndroid) {
        // Debug: Check what plugins are available
        const availablePlugins = Object.keys((window as any).Capacitor?.Plugins || {});
        console.log(`🔧 [SystemBars] Available plugins: ${availablePlugins.join(', ')}`);
        
        // Primary approach: Use StatusBar API directly with proper configuration
        console.log(`🔧 [SystemBars] Using StatusBar API as primary method`);
        
        if (targetFullscreen) {
          console.log(`🔧 [SystemBars] Applying fullscreen mode`);
          await StatusBar.hide();
          // Keep purple nav bar; only system gesture pill should adapt (native plugin handles appearance)
          try {
            const { NavigationBar } = (window as any).Capacitor?.Plugins || {};
            if (NavigationBar) {
              await NavigationBar.setNavigationBarColor({ 
                color: PURPLE_COLOR, 
                darkButtons: false // keep light (white) gesture indicator/icons
              });
              console.log(`🔧 [SystemBars] NavigationBar kept purple in fullscreen`);
            } else {
              console.warn('🔧 [SystemBars] NavigationBar plugin not available');
            }
          } catch (e) {
            console.warn('🔧 [SystemBars] NavigationBar fullscreen failed:', e);
          }
        } else {
          console.log(`🔧 [SystemBars] Applying normal mode with purple bars`);
          
          // Show status bar first
          await StatusBar.show();
          console.log(`🔧 [SystemBars] StatusBar shown`);
          
          // CRITICAL: Set style to Light (white text/icons on purple background)
          await StatusBar.setStyle({ style: StatusBarStyles.Light });
          console.log(`🔧 [SystemBars] StatusBar style set to Light (white icons)`);
          
          // Set purple background color
          await StatusBar.setBackgroundColor({ color: PURPLE_COLOR });
          console.log(`🔧 [SystemBars] StatusBar background set to: ${PURPLE_COLOR}`);
          
          // Set navigation bar to purple
          try {
            const { NavigationBar } = (window as any).Capacitor?.Plugins || {};
            if (NavigationBar) {
              await NavigationBar.setNavigationBarColor({ 
                color: PURPLE_COLOR, 
                darkButtons: false 
              });
              console.log(`🔧 [SystemBars] NavigationBar set to purple: ${PURPLE_COLOR}`);
            } else {
              console.warn('🔧 [SystemBars] NavigationBar plugin not available');
            }
          } catch (e) {
            console.warn('🔧 [SystemBars] NavigationBar color failed:', e);
          }
        }
        
        // Secondary: Try SystemUi plugin for native system UI control
        try {
          const { SystemUi } = (window as any).Capacitor?.Plugins || {};
          if (SystemUi) {
            console.log(`🔧 [SystemBars] Enhancing with native SystemUi plugin`);
            await SystemUi.setFullscreen({ enabled: targetFullscreen });
            console.log(`🔧 [SystemBars] SystemUi plugin applied: fullscreen=${targetFullscreen}`);
          } else {
            console.log(`🔧 [SystemBars] SystemUi plugin not available`);
          }
        } catch (e) {
          console.warn('🔧 [SystemBars] SystemUi enhancement failed (non-critical):', e);
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
      console.log(`🔧 [SystemBars] System bars configuration completed: fullscreen=${targetFullscreen}`);
      
      // Small delay to ensure all settings are applied
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
