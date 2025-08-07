import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

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
      // Android configuration - prevent status bar overlay
      await StatusBar.setStyle({ style: Style.Dark }).catch(e => console.warn('StatusBar.setStyle failed:', e));
      await StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(e => console.warn('StatusBar.setBackgroundColor failed:', e));
      
      // Always show status bar and ensure it doesn't overlay content
      await StatusBar.show().catch(e => console.warn('StatusBar.show failed:', e));
      await StatusBar.setOverlaysWebView({ overlay: false }).catch(e => console.warn('StatusBar.setOverlaysWebView failed:', e));
      
      if (shouldHideStatusBar) {
        await StatusBar.hide().catch(e => console.warn('StatusBar.hide failed:', e));
      }
    } else if (platform === 'ios') {
      // iOS configuration
      await StatusBar.setStyle({ style: Style.Light }).catch(e => console.warn('StatusBar.setStyle failed:', e));
      
      if (shouldHideStatusBar) {
        await StatusBar.hide().catch(e => console.warn('StatusBar.hide failed:', e));
      } else {
        await StatusBar.show().catch(e => console.warn('StatusBar.show failed:', e));
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
      StatusBar.setStyle({ style: Style.Light });
    }
  },
  setDark: () => {
    if (isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
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
