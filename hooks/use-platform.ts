import { Capacitor } from '@capacitor/core';

/**
 * Returns true when running inside any Capacitor native shell.
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Returns true only when running inside a Capacitor Android native shell.
 *
 * Usage: native-only behavior where mobile web should NOT be grouped with app runtime.
 */
export function isNativeAndroidPlatform(): boolean {
  return isNativePlatform() && Capacitor.getPlatform() === 'android';
}

/**
 * Returns true when running inside a Capacitor Android native shell,
 * OR when the browser user-agent indicates Android (PWA / mobile Chrome).
 *
 * Usage: conditionally disable Vaul keyboard repositioning on Android
 * to prevent the visualViewport  window.innerHeight timing mismatch
 * that causes a transient downward drawer shift.
 */
export function useIsAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;

  // Capacitor native check (most reliable for native builds)
  if (isNativeAndroidPlatform()) {
    return true;
  }

  // Fallback: user-agent sniff (covers PWA / mobile browser)
  return /Android/i.test(navigator.userAgent);
}
