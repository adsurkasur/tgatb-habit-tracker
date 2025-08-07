import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Initialize Capacitor plugins
export const initializeCapacitor = async () => {
  if (!isNativePlatform()) return;

  try {
    // Hide splash screen after app loads
    await SplashScreen.hide().catch(e => console.warn('SplashScreen.hide failed:', e));

    // Configure status bar
    await StatusBar.setStyle({ style: Style.Dark }).catch(e => console.warn('StatusBar.setStyle failed:', e));
    await StatusBar.setBackgroundColor({ color: '#000000' }).catch(e => console.warn('StatusBar.setBackgroundColor failed:', e));

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
