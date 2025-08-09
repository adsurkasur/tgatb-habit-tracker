import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

let fullscreenPref = false; // mirrors saved settings

// Narrow NavigationBar plugin interface (only what we use)
interface NavigationBarPlugin {
  show: () => Promise<void>;
  hide: () => Promise<void>;
  setColor: (options: { color: string; darkButtons: boolean }) => Promise<void>;
}
const navBar: Partial<NavigationBarPlugin> = NavigationBar as unknown as Partial<NavigationBarPlugin>;

// Simplified initializer (v0.1.0 style) – hook will manage bar colors
export const initializeCapacitor = async (settings?: { fullscreenMode?: boolean }) => {
  if (!isNativePlatform()) return;
  try {
    await SplashScreen.hide().catch(e => console.warn('SplashScreen.hide failed:', e));
    const platform = getPlatform();
    fullscreenPref = settings?.fullscreenMode ?? false;

    if (platform === 'android') {
      await StatusBar.show().catch(()=>{});
      try { await navBar.show?.(); } catch(e) { console.warn('NavigationBar.show failed:', e); }
      if (fullscreenPref) {
        await StatusBar.hide().catch(()=>{});
        try { await navBar.hide?.(); } catch(e) { console.warn('NavigationBar.hide failed:', e); }
      }
    } else if (platform === 'ios') {
      await StatusBar.setStyle({ style: StatusBarStyles.Light }).catch(()=>{});
      if (fullscreenPref) await StatusBar.hide().catch(()=>{}); else await StatusBar.show().catch(()=>{});
    }

    // Basic CSS insets
    try {
      const root = document.documentElement;
      const statusBarHeight = platform === 'android' ? 24 : 44;
      root.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
      root.style.setProperty('--safe-area-top', '0px');
    } catch {}

    // Back button
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) App.exitApp().catch(()=>{}); else window.history.back();
    }).catch(()=>{});
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
};

// Simple fullscreen toggle (no immersive custom plugin)
export async function setFullscreenMode(enabled: boolean) {
  if (!isNativePlatform()) return;
  fullscreenPref = enabled;
  const platform = getPlatform();
  if (platform === 'android') {
    if (enabled) {
      await StatusBar.hide().catch(()=>{});
      try { await navBar.hide?.(); } catch {}
    } else {
      await StatusBar.show().catch(()=>{});
      try { await navBar.show?.(); } catch {}
    }
  } else if (platform === 'ios') {
    if (enabled) await StatusBar.hide().catch(()=>{}); else await StatusBar.show().catch(()=>{});
  }
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
