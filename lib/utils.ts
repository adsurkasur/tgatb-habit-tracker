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
    try {
      try {
        const { SecureStorage } = await import('./secure-storage');
        const v = await SecureStorage.getItem('googleAccessToken');
        console.debug('[TokenStorage] getAccessToken via SecureStorage ->', v);
        return v;
      } catch {
        try {
          const alt = './secure-storage.ts';
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const { SecureStorage } = await import(/* webpackIgnore: true */ alt);
          const v = await SecureStorage.getItem('googleAccessToken');
          console.debug('[TokenStorage] getAccessToken via SecureStorage (ts) ->', v);
          return v;
        } catch {
          // final fallback
        }
      }
    } catch (e) {
      console.debug('[TokenStorage] getAccessToken secure error', e);
      // fallback
      try { const { PlatformStorage } = await import('./platform-storage'); const v = await PlatformStorage.getItem('googleAccessToken'); console.debug('[TokenStorage] getAccessToken via PlatformStorage ->', v); return v; } catch { return null; }
    }
  },
  async setAccessToken(token: string): Promise<void> {
    try {
      try {
        const { SecureStorage } = await import('./secure-storage');
        await SecureStorage.setItem('googleAccessToken', token);
        return;
      } catch {
        try {
          const alt = './secure-storage.ts';
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const { SecureStorage } = await import(/* webpackIgnore: true */ alt);
          await SecureStorage.setItem('googleAccessToken', token);
          return;
        } catch {
          // final fallback
        }
      }
    } catch {
      try { const { PlatformStorage } = await import('./platform-storage'); await PlatformStorage.setItem('googleAccessToken', token); } catch { /* ignore */ }
    }
  },
  async removeAccessToken(): Promise<void> {
    try {
      try {
        const { SecureStorage } = await import('./secure-storage');
        await SecureStorage.removeItem('googleAccessToken');
        return;
      } catch {
        try {
          const alt = './secure-storage.ts';
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const { SecureStorage } = await import(/* webpackIgnore: true */ alt);
          await SecureStorage.removeItem('googleAccessToken');
          return;
        } catch {
          // final fallback
        }
      }
    } catch {
      try { const { PlatformStorage } = await import('./platform-storage'); await PlatformStorage.removeItem('googleAccessToken'); } catch { /* ignore */ }
    }
  }
};
