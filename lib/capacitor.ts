import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Initialize Capacitor plugins
export const initializeCapacitor = async (settings?: { fullscreenMode?: boolean }) => {
  if (!isNativePlatform()) return;

  try {
    // Hide splash screen after app loads
    await SplashScreen.hide().catch(e => console.warn('SplashScreen.hide failed:', e));

    // Configure status bar for proper display
    const platform = getPlatform();
    const shouldHideStatusBar = settings?.fullscreenMode ?? false;
    
    if (platform === 'android') {
      // One-time basic setup; ongoing control is handled by hooks
      await StatusBar.show();

      if (shouldHideStatusBar) {
        await StatusBar.hide();
        // Enable native immersive to fully hide system bars without JS loops
        try {
          const Immersive = (window as any).Capacitor?.Plugins?.Immersive;
          await Immersive?.enable?.();
        } catch (e) { console.warn('Immersive.enable failed:', e); }
      } else {
        try {
          const Immersive = (window as any).Capacitor?.Plugins?.Immersive;
          await Immersive?.disable?.();
        } catch (e) { /* ignore */ }
      }
    } else if (platform === 'ios') {
      // iOS configuration
      await StatusBar.setStyle({ style: StatusBarStyles.Light });
      
      if (shouldHideStatusBar) {
        await StatusBar.hide();
      } else {
        await StatusBar.show();
      }
    }

    // Get status bar info and set CSS variables
    try {
      const statusBarInfo = await StatusBar.getInfo();
      const root = document.documentElement;
      
      // Set status bar height based on platform
      const statusBarHeight = platform === 'android' ? 24 : 44;
      root.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
      // Since we disabled overlay, no need for safe area padding
      root.style.setProperty('--safe-area-top', '0px');
  // When respecting OS nav bar, let bottom inset be provided by the platform/CSS.
      
      console.log('Status bar configured:', { ...statusBarInfo, height: statusBarHeight, overlays: false });
    } catch (error) {
      console.warn('Failed to get status bar info:', error);
    }

    // App state change listeners
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
    }).catch(e => console.warn('App.addListener appStateChange failed:', e));

    // Back button handler
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp().catch(e => console.warn('App.exitApp failed:', e));
      } else {
        window.history.back();
      }
    }).catch(e => console.warn('App.addListener backButton failed:', e));

  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
};

// Haptic feedback helpers
export const haptics = {
  impact: (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNativePlatform()) {
      Haptics.impact({ style });
    }
  },
  notification: (type: NotificationType = NotificationType.Success) => {
    if (isNativePlatform()) {
      Haptics.notification({ type });
    }
  },
  vibrate: (duration = 300) => {
    if (isNativePlatform()) {
      Haptics.vibrate({ duration });
    }
  }
};

// Status bar helpers
export const statusBar = {
  setLight: () => {
    if (isNativePlatform()) {
      StatusBar.setStyle({ style: StatusBarStyles.Light });
    }
  },
  setDark: () => {
    if (isNativePlatform()) {
      StatusBar.setStyle({ style: StatusBarStyles.Dark });
    }
  },
  setDefault: () => {
    if (isNativePlatform()) {
      StatusBar.setStyle({ style: StatusBarStyles.Default });
    }
  },
  setBackgroundColor: (color: string) => {
    if (isNativePlatform()) {
      StatusBar.setBackgroundColor({ color });
    }
  },
  hide: () => {
    if (isNativePlatform()) {
      StatusBar.hide();
    }
  },
  show: () => {
    if (isNativePlatform()) {
      StatusBar.show();
    }
  }
};
