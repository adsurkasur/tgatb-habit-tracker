import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export const SETTINGS_KEY = 'user_settings';

export async function getSettings(): Promise<any> {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key: SETTINGS_KEY });
    if (!value) {
      return {
        darkMode: false,
        language: 'en',
        motivatorPersonality: 'positive',
        fullscreenMode: false,
      };
    }
    return JSON.parse(value);
  } else {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return {
        darkMode: false,
        language: 'en',
        motivatorPersonality: 'positive',
        fullscreenMode: false,
      };
    }
    return JSON.parse(data);
  }
}

export async function saveSettings(settings: any): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: SETTINGS_KEY, value: JSON.stringify(settings) });
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}
