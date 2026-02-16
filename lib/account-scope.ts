/**
 * Account scope management for data isolation.
 *
 * Every storage key is namespaced with the active account's ID so
 * data from different Google accounts (or anonymous usage) never
 * overlaps.
 *
 *   scopedKey("habits") → "habits::abc123"   (logged-in)
 *   scopedKey("habits") → "habits::anonymous" (anonymous)
 */

const ACCOUNT_KEY = "tgatb_active_account";

let _activeAccountId: string | null = null;

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Get the current active account ID.
 * Lazy-loads from localStorage on first call.
 * Returns `"anonymous"` when no account is set.
 */
export function getActiveAccountId(): string {
  if (_activeAccountId) return _activeAccountId;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(ACCOUNT_KEY);
    if (stored) {
      _activeAccountId = stored;
      return stored;
    }
  }

  return "anonymous";
}

/**
 * Set the active account ID and persist it.
 * Pass `"anonymous"` to switch back to the anonymous namespace.
 */
export function setActiveAccountId(id: string): void {
  _activeAccountId = id;
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCOUNT_KEY, id);
  }
}

/**
 * Build a storage key scoped to the active account.
 *
 * @example
 *   scopedKey("habits")       → "habits::uid123"
 *   scopedKey("user_settings") → "user_settings::anonymous"
 */
export function scopedKey(baseKey: string): string {
  return `${baseKey}::${getActiveAccountId()}`;
}

// ---------------------------------------------------------------------------
// Legacy data migration
// ---------------------------------------------------------------------------

/**
 * Migrate **localStorage** data from the old un-scoped keys
 * (`"habits"`, `"habit_logs"`, `"user_settings"`) into the current
 * account's namespace.
 *
 * Rules:
 * - Only runs if at least one legacy key exists.
 * - Only copies to the scoped key if the scoped slot is empty
 *   (prevents overwriting data that may already exist).
 * - Deletes legacy keys after migration.
 *
 * This is synchronous and safe to call multiple times (idempotent).
 */
export function migrateLegacyStorage(): void {
  if (typeof window === "undefined") return;

  const LEGACY_KEYS = ["habits", "habit_logs", "user_settings"];

  for (const key of LEGACY_KEYS) {
    const legacyValue = localStorage.getItem(key);
    if (legacyValue === null) continue;

    const target = scopedKey(key);
    if (localStorage.getItem(target) === null) {
      localStorage.setItem(target, legacyValue);
    }
    localStorage.removeItem(key);
  }
}

/**
 * Async migration for Capacitor Preferences (native platform).
 * Handles settings and any habits/logs that were stored in Preferences
 * under un-scoped keys.
 *
 * Also calls `migrateLegacyStorage()` for the localStorage side.
 */
export async function migrateLegacyPlatformStorage(): Promise<void> {
  if (typeof window === "undefined") return;

  // localStorage first (always available)
  migrateLegacyStorage();

  // Capacitor Preferences (native only)
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;

    const { Preferences } = await import("@capacitor/preferences");

    for (const key of ["habits", "habit_logs", "user_settings"]) {
      const legacy = await Preferences.get({ key });
      if (!legacy.value) continue;

      const target = scopedKey(key);
      const existing = await Preferences.get({ key: target });
      if (!existing.value) {
        await Preferences.set({ key: target, value: legacy.value });
      }
      await Preferences.remove({ key });
    }
  } catch {
    // Not on Capacitor or plugin unavailable — localStorage migration is enough.
  }
}
