/**
 * @module storage-sync-utils
 *
 * Standardized patterns for critical save/load operations.
 *
 * This module provides utilities for operations that must be both:
 * - SYNCHRONOUS on startup (before React hydrates) to prevent UI flashing
 * - ASYNC during normal operation (for full validation and error handling)
 *
 * Use cases:
 * - Theme loading (must apply before first paint)
 * - Language/locale setting (should apply before i18n initialization)
 * - Other critical startup values
 *
 * Design principles:
 * 1. Synchronous read from localStorage for early bootstrap (used in <head> scripts)
 * 2. Async read from full storage layer for proper initialization (used in React effects)
 * 3. Automatic fallback to legacy keys for migration compatibility
 * 4. Silent errors on bootstrap to prevent app crashes
 * 5. Verbose errors in React components for debugging
 */

import { scopedKey } from './account-scope';

/**
 * Get the scoped key for a base key, handling both current and legacy formats.
 * This is identical to scopedKey() but can be used in documentation.
 */
export function buildScopedKey(baseKey: string): string {
  return scopedKey(baseKey);
}

/**
 * Synchronous localStorage read for critical startup values.
 * 
 * IMPORTANT: This is meant to be called from <head> scripts BEFORE React hydrates.
 * It reads directly from localStorage only, with NO async calls.
 *
 * @param baseKey - Base key name (e.g., "user_settings")
 * @param fallbackValue - Default if key not found or parsing fails
 * @returns Parsed value from localStorage, or fallbackValue
 *
 * @example
 * const settings = syncReadLocalStorage("user_settings", { darkMode: false });
 * if (settings.darkMode) {
 *   document.documentElement.classList.add("dark");
 * }
 */
export function syncReadLocalStorage<T>(
  baseKey: string,
  fallbackValue: T,
): T {
  if (typeof window === 'undefined') {
    return fallbackValue;
  }

  try {
    // Get active account to build scoped key
    const activeAccount = localStorage.getItem('tgatb_active_account') || 'anonymous';
    const scopedKey_ = `${baseKey}::${activeAccount}`;

    // Try scoped key first
    let rawValue = localStorage.getItem(scopedKey_);

    // Fall back to legacy unscoped key for migration
    if (!rawValue) {
      rawValue = localStorage.getItem(baseKey);
    }

    if (rawValue) {
      return JSON.parse(rawValue) as T;
    }

    return fallbackValue;
  } catch {
    // Silent fail: any error returns fallback value
    // This is intentional — startup must not crash
    return fallbackValue;
  }
}

/**
 * Get critical values synchronously during bootstrap.
 * 
 * This is a convenience wrapper for reading multiple values from localStorage
 * in the <head> script context.
 *
 * @returns Object with isDarkMode and isInitialized flags
 *
 * @example
 * const { isDarkMode } = bootstrapGetTheme();
 * if (isDarkMode) {
 *   document.documentElement.classList.add("dark");
 * }
 */
export function bootstrapGetTheme(): { isDarkMode: boolean; isInitialized: boolean } {
  try {
    if (typeof window === 'undefined') {
      return { isDarkMode: false, isInitialized: false };
    }

    const settings = syncReadLocalStorage('user_settings', {
      darkMode: false,
      language: 'en',
      motivatorPersonality: 'positive',
      fullscreenMode: false,
    });

    return {
      isDarkMode: settings.darkMode === true,
      isInitialized: true,
    };
  } catch {
    return { isDarkMode: false, isInitialized: false };
  }
}

/**
 * Bootstrap an HTML element with critical attributes before React hydration.
 * 
 * This applies data attributes and classes needed before JavaScript runs.
 *
 * @param elementSelector - CSS selector for element to update (e.g., "html", "body")
 * @param attributes - Object of attributes to set
 * @param classes - Array of classes to add
 *
 * @example
 * bootstrapSetHtml("html", {}, ["dark"]);
 * bootstrapSetHtml("html", { "data-theme": "dark" });
 */
export function bootstrapSetHtml(
  elementSelector: string,
  attributes: Record<string, string> = {},
  classes: string[] = [],
): void {
  if (typeof window === 'undefined') return;

  try {
    const element = document.querySelector(elementSelector);
    if (!element) return;

    // Set attributes
    Object.entries(attributes).forEach(([attr, value]) => {
      element.setAttribute(attr, value);
    });

    // Add classes
    classes.forEach(cls => {
      element.classList.add(cls);
    });
  } catch {
    // Silent fail during bootstrap
  }
}

/**
 * Async initialization of critical values after React mounts.
 * 
 * Use this in React useEffect to properly load and validate values
 * after the component tree is initialized. This uses the full async
 * storage layer (Capacitor Preferences, etc.).
 *
 * @param baseKey - Base key name
 * @param asyncLoader - Function that loads value from full storage layer
 * @param validator - Optional function to validate loaded value
 * @returns Loaded value or undefined if validation fails
 */
export async function asyncLoadCriticalValue<T>(
  baseKey: string,
  asyncLoader: (key: string) => Promise<T | null>,
  validator?: (value: unknown) => value is T,
): Promise<T | null> {
  try {
    const key = scopedKey(baseKey);
    const value = await asyncLoader(key);

    // Validate if validator provided
    if (validator && value !== null && !validator(value)) {
      console.warn(`[StorageSync] Validation failed for ${baseKey}`);
      return null;
    }

    return value;
  } catch (error) {
    console.warn(`[StorageSync] Failed to load ${baseKey}:`, error);
    return null;
  }
}

/**
 * Save a critical value with proper error handling.
 *
 * @param baseKey - Base key name
 * @param value - Value to save
 * @param asyncSaver - Function that saves to storage layer
 * @returns true if save successful, false otherwise
 */
export async function saveCriticalValue<T>(
  baseKey: string,
  value: T,
  asyncSaver: (key: string, value: string) => Promise<void>,
): Promise<boolean> {
  try {
    const key = scopedKey(baseKey);
    await asyncSaver(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[StorageSync] Failed to save ${baseKey}:`, error);
    return false;
  }
}

/**
 * Pattern for reading with both sync and async paths.
 *
 * Reads synchronously from localStorage immediately (for bootstrap),
 * then reads asynchronously from full storage layer when React mounts.
 *
 * Use this pattern for:
 * - Theme (needs sync read before paint, async for full validation)
 * - Language (needs sync read before i18n init, async for updates)
 * - Other critical startup values
 *
 * @example
 * // In <head> script:
 * const syncTheme = syncReadLocalStorage("user_settings", defaultSettings);
 * if (syncTheme.darkMode) document.documentElement.classList.add("dark");
 *
 * // In React useEffect:
 * const asyncTheme = await HabitStorage.getSettings();
 * if (asyncTheme.darkMode !== syncTheme.darkMode) {
 *   // User's preference changed, update state
 *   setIsDark(asyncTheme.darkMode);
 * }
 */
export const DualPathStoragePattern = {
  sync: syncReadLocalStorage,
  bootstrap: bootstrapGetTheme,
  async: asyncLoadCriticalValue,
  save: saveCriticalValue,
};

/**
 * Metadata about save/load operations for standardization.
 *
 * Use this to document and standardize how different values are persisted.
 */
export const STORAGE_OPERATIONS = {
  theme: {
    key: 'user_settings',
    scope: 'account',
    critical: true,
    bootstrap: true,
    fallback: { darkMode: false },
    description: 'Theme preference (dark/light mode)',
  },
  language: {
    key: 'user_settings',
    scope: 'account',
    critical: true,
    bootstrap: true,
    fallback: { language: 'en' },
    description: 'User language/locale preference',
  },
  fullscreenMode: {
    key: 'user_settings',
    scope: 'account',
    critical: false,
    bootstrap: false,
    fallback: { fullscreenMode: false },
    description: 'Fullscreen/immersive mode preference',
  },
  userHabits: {
    key: 'habits',
    scope: 'account',
    critical: true,
    bootstrap: false,
    fallback: [],
    description: 'User habit definitions and metadata',
  },
  habitLogs: {
    key: 'habit_logs',
    scope: 'account',
    critical: true,
    bootstrap: false,
    fallback: [],
    description: 'User habit completion logs',
  },
} as const;
