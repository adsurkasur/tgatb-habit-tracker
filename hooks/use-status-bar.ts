import { useEffect, useState } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

interface StatusBarInfo {
  visible: boolean;
  height: number;
  overlays: boolean;
}

export const useStatusBar = () => {
  const [statusBarInfo, setStatusBarInfo] = useState<StatusBarInfo>({
    visible: true,
    height: 0,
    overlays: false
  });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const getStatusBarInfo = async () => {
      try {
        const info = await StatusBar.getInfo();
        const statusBarHeight = Capacitor.getPlatform() === 'android' ? 24 : 44; // Default heights
        
        setStatusBarInfo({
          visible: info.visible,
          height: statusBarHeight, // StatusBar.getInfo() doesn't return height on all platforms
          overlays: info.overlays ?? false // Use the actual overlay value, default to false
        });

        // Set CSS custom properties for safe area
        const root = document.documentElement;
        root.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
        // Since we're not overlaying, we don't need safe area padding
        root.style.setProperty('--safe-area-top', '0px');
        
        console.log('Status bar info:', { ...info, height: statusBarHeight, overlays: false });
      } catch (error) {
        console.warn('Failed to get status bar info:', error);
        // Fallback values
        const fallbackHeight = Capacitor.getPlatform() === 'android' ? 24 : 44;
        setStatusBarInfo({
          visible: true,
          height: fallbackHeight,
          overlays: false // Default to no overlay for cleaner layout
        });
        
        const root = document.documentElement;
        root.style.setProperty('--status-bar-height', `${fallbackHeight}px`);
        root.style.setProperty('--safe-area-top', '0px');
      }
    };

    getStatusBarInfo();

    // Listen for status bar changes
    const setupStatusBarListener = async () => {
      try {
        // Update on orientation and resize changes
        window.addEventListener('resize', getStatusBarInfo);
        window.addEventListener('orientationchange', getStatusBarInfo);
      } catch (error) {
        console.warn('Failed to setup status bar listener:', error);
      }
    };

    setupStatusBarListener();

    return () => {
      window.removeEventListener('resize', getStatusBarInfo);
      window.removeEventListener('orientationchange', getStatusBarInfo);
    };
  }, []);

  const setStatusBarVisible = async (visible: boolean) => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      if (visible) {
        await StatusBar.show();
      } else {
        await StatusBar.hide();
      }
      
      // Update info after change
      setTimeout(async () => {
        const info = await StatusBar.getInfo();
        const statusBarHeight = Capacitor.getPlatform() === 'android' ? 24 : 44;
        
        setStatusBarInfo({
          visible: info.visible,
          height: statusBarHeight,
          overlays: info.overlays ?? false // We're not using overlay mode
        });

        // Update CSS custom properties
        const root = document.documentElement;
        root.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
        root.style.setProperty('--safe-area-top', '0px');
      }, 100);
    } catch (error) {
      console.warn('Failed to set status bar visibility:', error);
    }
  };

  const setStatusBarStyle = async (style: Style) => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await StatusBar.setStyle({ style });
      console.log('Status bar style set to:', style);
    } catch (error) {
      console.warn('Failed to set status bar style:', error);
    }
  };

  const setStatusBarBackgroundColor = async (color: string) => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await StatusBar.setBackgroundColor({ color });
      console.log('Status bar background color set to:', color);
    } catch (error) {
      console.warn('Failed to set status bar background color:', error);
    }
  };

  return {
    ...statusBarInfo,
    setVisible: setStatusBarVisible,
    setStyle: setStatusBarStyle,
    setBackgroundColor: setStatusBarBackgroundColor,
    isNative: Capacitor.isNativePlatform(),
    // Helper methods for common use cases
    setLightStyle: () => setStatusBarStyle(Style.Light),
    setDarkStyle: () => setStatusBarStyle(Style.Dark),
    setDefaultStyle: () => setStatusBarStyle(Style.Default)
  };
};
