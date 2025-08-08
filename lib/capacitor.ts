import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Initialize Capacitor plugins
export const initializeCapacitor = async (settings?: { fullscreenMode?: boolean }) => {
  if (!isNativePlatform()) return;

  try {
    await SplashScreen.hide().catch(e => console.warn('SplashScreen.hide failed:', e));

    const platform = getPlatform();
    const shouldHideStatusBar = settings?.fullscreenMode ?? false;

  await configureSystemBars(platform, shouldHideStatusBar);
    await setCssInsets(platform);
  registerAppListeners(shouldHideStatusBar);

  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
};

async function configureSystemBars(platform: string, shouldHideStatusBar: boolean) {
  if (platform === 'android') return configureAndroidBars(shouldHideStatusBar);
  if (platform === 'ios') return configureIosBars(shouldHideStatusBar);
}

async function configureAndroidBars(shouldHideStatusBar: boolean) {
  const applyFullscreen = async () => {
    try {
      if (shouldHideStatusBar) {
        await StatusBar.hide();
        // Make nav bar transparent and hidden
        try {
          if (typeof NavigationBar.setTransparency === 'function') {
            await NavigationBar.setTransparency({ isTransparent: true });
          }
          await NavigationBar.hide();
        } catch (e) {
          console.warn('NavigationBar adjustments failed:', e);
        }
      } else {
        await StatusBar.show();
        // Show nav bar and set a stable color
        try {
          await NavigationBar.show();
          if (typeof NavigationBar.setColor === 'function') {
            await NavigationBar.setColor({ color: '#6750a4', darkButtons: false });
          }
        } catch (e) {
          console.warn('NavigationBar show/color failed:', e);
        }
      }
    } catch (e) {
      console.warn('applyFullscreen error:', e);
    }
  };

  await applyFullscreen();
  // Re-apply shortly after to combat race conditions with window insets
  setTimeout(applyFullscreen, 150);
}

async function configureIosBars(shouldHideStatusBar: boolean) {
  await StatusBar.setStyle({ style: StatusBarStyles.Light });
  if (shouldHideStatusBar) await StatusBar.hide();
  else await StatusBar.show();
}

async function setCssInsets(platform: string) {
  try {
    const statusBarInfo = await StatusBar.getInfo();
    const root = document.documentElement;
    const statusBarHeight = platform === 'android' ? 24 : 44;
    root.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
    root.style.setProperty('--safe-area-top', '0px');
    console.log('Status bar configured:', { ...statusBarInfo, height: statusBarHeight, overlays: false });
  } catch (error) {
    console.warn('Failed to get status bar info:', error);
  }
}

function registerAppListeners(shouldHideStatusBar: boolean) {
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive && Capacitor.getPlatform() === 'android') {
      // Re-apply system bars state on resume
      configureAndroidBars(shouldHideStatusBar);
    }
  }).catch(e => console.warn('App.addListener appStateChange failed:', e));

  App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp().catch(e => console.warn('App.exitApp failed:', e));
    } else {
      window.history.back();
    }
  }).catch(e => console.warn('App.addListener backButton failed:', e));
}

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
