import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
// import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Removed unused fullscreen preference & nav bar shim – unified system bars hook owns that state now.

// Simplified initializer (v0.1.0 style) – unified hook manages system bars
export const initializeCapacitor = async () => {
  if (!isNativePlatform()) return;
  try {
    await SplashScreen.hide().catch(e => console.warn('SplashScreen.hide failed:', e));
    const platform = getPlatform();
  // (fullscreen preference now tracked exclusively inside useSystemBarsUnified)

    // NOTE: Status bar and navigation bar management is now handled by useSystemBarsUnified hook
    // This prevents conflicts and ensures single source of truth for system UI

    // Basic CSS insets
    try {
      const root = document.documentElement;
      const statusBarHeight = platform === 'android' ? 24 : 44;
      root.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
      root.style.setProperty('--safe-area-top', '0px');
    } catch {}

    // Back button listener removed to avoid conflict with page-specific handler
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
};

// Simple fullscreen toggle (delegated to unified hook)
export async function setFullscreenMode(enabled: boolean) {
  if (!isNativePlatform()) return;
  // NOTE: Actual system bar changes & preference are handled by useSystemBarsUnified hook
  if (process.env.NODE_ENV !== "production") {
    console.log(`[CapacitorLib] Fullscreen preference change requested: ${enabled} (handled by unified hook)`);
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
