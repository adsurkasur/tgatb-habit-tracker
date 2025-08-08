import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { UserSettings } from "@shared/schema";

export const SETTINGS_KEY = 'user_settings';

const defaultSettings = (): UserSettings => ({
  darkMode: false,
  language: 'en',
  motivatorPersonality: 'positive',
  fullscreenMode: false,
});

export async function getSettings(): Promise<UserSettings> {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key: SETTINGS_KEY });
  if (!value) return defaultSettings();
    return JSON.parse(value);
  } else {
    const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) return defaultSettings();
    return JSON.parse(data) as UserSettings;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: SETTINGS_KEY, value: JSON.stringify(settings) });
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}
