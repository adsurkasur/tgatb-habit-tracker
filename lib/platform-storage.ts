import type { UserSettings } from "@shared/schema";

export const SETTINGS_KEY = 'user_settings';

const defaultSettings = (): UserSettings => ({
  darkMode: false,
  language: 'en',
  motivatorPersonality: 'positive',
  fullscreenMode: false,
});

// Generic platform storage helper (Preferences on native, localStorage on web)
const _inMemory = new Map<string, string>();
export const PlatformStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      // Server-side/testing fallback to in-memory store
      return _inMemory.get(key) ?? null;
    }
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      const res = await Preferences.get({ key });
      return res.value ?? null;
    }
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') {
      _inMemory.set(key, value);
      return;
    }
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value });
      return;
    }
    localStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') {
      _inMemory.delete(key);
      return;
    }
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
      return;
    }
    localStorage.removeItem(key);
  }
};

export async function getSettings(): Promise<UserSettings> {
  const raw = await PlatformStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings();
  try {
    return JSON.parse(raw) as UserSettings;
  } catch {
    return defaultSettings();
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await PlatformStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
