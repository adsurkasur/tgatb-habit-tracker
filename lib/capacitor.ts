import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Global fullscreen flag so listeners always use the latest value
let fullscreenEnabled = false;

// Initialize Capacitor plugins
interface SystemUiPluginApi { setFullscreen: (options: { enabled: boolean }) => Promise<{ enabled: boolean }>; }
interface CapacitorWindow extends Window { Capacitor?: { Plugins?: { SystemUi?: SystemUiPluginApi } } }

export const initializeCapacitor = async (settings?: { fullscreenMode?: boolean }) => {
  if (!isNativePlatform()) return;

  try {
    await SplashScreen.hide().catch(e => console.warn('SplashScreen.hide failed:', e));

    const platform = getPlatform();
    fullscreenEnabled = settings?.fullscreenMode ?? false;

    await configureSystemBars(platform, fullscreenEnabled); // fallback + iOS/web styling
    if (platform === 'android') {
      try {
        const SystemUi = (window as unknown as CapacitorWindow)?.Capacitor?.Plugins?.SystemUi;
        if (SystemUi?.setFullscreen) {
          await SystemUi.setFullscreen({ enabled: fullscreenEnabled });
        }
      } catch (e) { console.warn('SystemUi.setFullscreen (init) failed:', e); }
    }
    await setCssInsets(platform);
    registerAppListeners();

  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
};

async function configureSystemBars(platform: string, shouldHideStatusBar: boolean) {
  if (platform === 'android') return configureAndroidBars(shouldHideStatusBar);
  if (platform === 'ios') return configureIosBars(shouldHideStatusBar);
}

async function configureAndroidBars(shouldHideStatusBar: boolean) {
  // Lightweight early application; React SystemBarsManager will maintain state thereafter.
  const applyOnce = async () => {
    try {
      if (shouldHideStatusBar) {
        await StatusBar.hide();
        try {
          if (typeof NavigationBar.setTransparency === 'function') {
            await NavigationBar.setTransparency({ isTransparent: true });
          }
          await NavigationBar.hide();
        } catch (e) {
          console.warn('NavigationBar adjustments failed:', e);
        }
      } else {
        try {
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.show();
          await StatusBar.setBackgroundColor({ color: '#6750a4' });
          await StatusBar.setStyle({ style: StatusBarStyles.Light });
          // Reinforce passes
          [100,250].forEach(ms => setTimeout(() => {
            StatusBar.setBackgroundColor({ color: '#6750a4' }).catch(()=>{});
            StatusBar.setStyle({ style: StatusBarStyles.Light }).catch(()=>{});
          }, ms));
        } catch (e) {
          console.warn('StatusBar styling failed:', e);
        }
        try {
          if (typeof NavigationBar.setTransparency === 'function') {
            await NavigationBar.setTransparency({ isTransparent: false });
          }
          await NavigationBar.show();
          if (typeof NavigationBar.setColor === 'function') {
            await NavigationBar.setColor({ color: '#6750a4', darkButtons: false });
          }
        } catch (e) {
          console.warn('NavigationBar show/color failed:', e);
        }
      }
    } catch (e) {
      console.warn('configureAndroidBars error:', e);
    }
  };

  await applyOnce();
  setTimeout(applyOnce, 140);
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

function registerAppListeners() {
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive && Capacitor.getPlatform() === 'android') {
      // Re-apply system bars state on resume using latest value
      configureAndroidBars(fullscreenEnabled);
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

// Allow toggling fullscreen dynamically at runtime
export async function setFullscreenMode(enabled: boolean) {
  if (!isNativePlatform()) return;
  fullscreenEnabled = enabled;
  const platform = getPlatform();
  if (platform === 'android') {
    try {
      const SystemUi = (window as unknown as CapacitorWindow)?.Capacitor?.Plugins?.SystemUi;
      if (SystemUi?.setFullscreen) {
        await SystemUi.setFullscreen({ enabled });
        return; // native handles immersive + colors
      }
    } catch (e) { console.warn('SystemUi.setFullscreen failed:', e); }
  }
  await configureSystemBars(platform, fullscreenEnabled);
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
