/**
 * @module platform-storage
 *
 * Thin abstraction over Capacitor Preferences (native) and
 * localStorage (web) for key-value persistence.
 *
 * Responsibilities:
 *   - Provide a unified async `getItem` / `setItem` / `removeItem` API.
 *   - Read/write user settings with account-scoped keys.
 *
 * Invariants:
 *   - All settings keys MUST go through `scopedKey()` from
 *     `account-scope.ts` — hard-coded key strings are prohibited.
 *   - The `PlatformStorage` object MUST remain stateless (no caching)
 *     to avoid stale reads after account switches.
 *   - This module MUST NOT import from `habit-storage` to avoid
 *     circular dependencies.
 *
 * Allowed callers:
 *   - `habit-storage.ts` (settings delegation).
 *   - `offline-storage.ts` (localStorage fallback for IndexedDB).
 *   - `use-habits.ts`, `use-auth.ts`, settings UI components.
 */

import type { UserSettings } from "@shared/schema";
import { scopedKey } from "./account-scope";

function settingsKey(): string {
  return scopedKey('user_settings');
}

const SETTINGS_MIRROR_KEY = 'user_settings';

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
      if (res.value != null) {
        return res.value;
      }
      // Bootstrap compatibility: fall back to localStorage mirror when Preferences has no value yet.
      return localStorage.getItem(key);
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
      // Keep a synchronous mirror for early bootstrap scripts (theme, locale).
      localStorage.setItem(key, value);
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
      localStorage.removeItem(key);
      return;
    }
    localStorage.removeItem(key);
  }
};

export async function getSettings(): Promise<UserSettings> {
  const scoped = await PlatformStorage.getItem(settingsKey());
  const raw = scoped ?? (typeof window !== 'undefined' ? localStorage.getItem(SETTINGS_MIRROR_KEY) : null);
  if (!raw) return defaultSettings();
  try {
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return {
      ...defaultSettings(),
      ...parsed,
    };
  } catch {
    return defaultSettings();
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const normalized: UserSettings = {
    ...defaultSettings(),
    ...settings,
  };
  const payload = JSON.stringify(normalized);
  await PlatformStorage.setItem(settingsKey(), payload);
  // Canonical synchronous mirror for bootstrap code paths.
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_MIRROR_KEY, payload);
  }
}
