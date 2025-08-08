/**
 * PWA utility functions for habit tracking app
 */

// Check if the app is running in standalone mode
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Check if the device is mobile
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Get installation source
export function getInstallationSource(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  if (isStandalone()) {
    return 'pwa';
  }
  
  if (isMobile()) {
    return 'mobile-browser';
  }
  
  return 'desktop-browser';
}

// Check if notifications are supported and permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return Notification.permission;
}

// Show a notification
export function showNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'habit-reminder',
      requireInteraction: false,
      ...options
    });
    return true;
  }
  
  return false;
}

// Cache habit data for offline use
export function cacheHabitData<T>(data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cached-habit-data', JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to cache habit data:', error);
  }
}

// Get cached habit data
export function getCachedHabitData<T = unknown>(): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem('cached-habit-data');
    if (!cached) return null;
    
  const { data, timestamp } = JSON.parse(cached) as { data: T; timestamp: number };
    
    // Check if cache is older than 24 hours
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > twentyFourHours) {
      localStorage.removeItem('cached-habit-data');
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to get cached habit data:', error);
    return null;
  }
}

// Clear cached data
export function clearCachedData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('cached-habit-data');
  } catch (error) {
    console.warn('Failed to clear cached data:', error);
  }
}

// Register for background sync (when supported)
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      // @ts-expect-error SyncManager is not in TS lib by default
      await registration.sync.register(tag);
      return true;
    }
  } catch (error) {
    console.warn('Background sync registration failed:', error);
  }
  
  return false;
}

// Get app version from manifest
export async function getAppVersion(): Promise<string> {
  try {
    const response = await fetch('/manifest.json');
    const manifest = await response.json();
    return manifest.version || '1.0.0';
  } catch (error) {
    console.warn('Failed to get app version:', error);
    return '1.0.0';
  }
}

export const pwaUtils = {
  isStandalone,
  isMobile,
  getInstallationSource,
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
  cacheHabitData,
  getCachedHabitData,
  clearCachedData,
  registerBackgroundSync,
  getAppVersion
};
