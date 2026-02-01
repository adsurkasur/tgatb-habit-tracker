import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a UUID v4 compatible with all environments
 * Falls back to a crypto-random implementation if crypto.randomUUID is not available
 */
export function generateId(): string {
  // Use native crypto.randomUUID if available (modern browsers with HTTPS)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (typeof crypto !== 'undefined' && crypto.getRandomValues) 
      ? crypto.getRandomValues(new Uint8Array(1))[0] % 16
      : Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Formats a date to YYYY-MM-DD string using local timezone
 * This ensures consistent date formatting across the app using client's timezone
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Token storage abstraction to centralize where access tokens are stored.
export const TokenStorage = {
  async getAccessToken(): Promise<string | null> {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      const res = await Preferences.get({ key: 'googleAccessToken' });
      return res.value ?? null;
    }
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('googleAccessToken');
  },
  async setAccessToken(token: string): Promise<void> {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: 'googleAccessToken', value: token });
      return;
    }
    if (typeof window === 'undefined') return;
    localStorage.setItem('googleAccessToken', token);
  },
  async removeAccessToken(): Promise<void> {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: 'googleAccessToken' });
      return;
    }
    if (typeof window === 'undefined') return;
    localStorage.removeItem('googleAccessToken');
  }
};
