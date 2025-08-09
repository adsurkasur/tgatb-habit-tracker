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

// Simplified initializer (v0.1.0 style) – unified hook manages system bars
export const initializeCapacitor = async (settings?: { fullscreenMode?: boolean }) => {
  if (!isNativePlatform()) return;
  try {
    await SplashScreen.hide().catch(e => console.warn('SplashScreen.hide failed:', e));
    const platform = getPlatform();
    fullscreenPref = settings?.fullscreenMode ?? false;

    // NOTE: Status bar and navigation bar management is now handled by useSystemBarsUnified hook
    // This prevents conflicts and ensures single source of truth for system UI

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

// Simple fullscreen toggle (delegated to unified hook)
export async function setFullscreenMode(enabled: boolean) {
  if (!isNativePlatform()) return;
  fullscreenPref = enabled;
  
  // NOTE: Actual system bar changes are handled by useSystemBarsUnified hook
  // This just tracks the preference for other parts of the app
  console.log(`🔧 [CapacitorLib] Fullscreen preference set to: ${enabled} (actual UI changes handled by unified hook)`);
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
