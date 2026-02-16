/**
 * @module account-scope
 *
 * Account scope management for data isolation.
 *
 * Every storage key is namespaced with the active account's ID so
 * data from different Google accounts (or anonymous usage) never
 * overlaps.
 *
 *   scopedKey("habits") → "habits::abc123"   (logged-in)
 *   scopedKey("habits") → "habits::anonymous" (anonymous)
 *
 * Responsibilities:
 *   - Maintain the active accountId in memory and localStorage.
 *   - Provide `scopedKey()` for deterministic key namespacing.
 *   - Migrate legacy un-scoped keys to the current account's namespace.
 *
 * Invariants:
 *   - `getActiveAccountId()` MUST NEVER return an empty string, null,
 *     or undefined. The sentinel value `"anonymous"` is used when no
 *     account is set.
 *   - `scopedKey()` MUST produce a non-empty string containing the
 *     delimiter `"::"` — callers rely on this format.
 *   - Legacy migration is idempotent — safe to call multiple times.
 *   - This module MUST NOT import from `habit-storage`, `platform-storage`,
 *     or any React hook to avoid circular dependencies.
 *
 * Allowed callers:
 *   - `habit-storage.ts`, `platform-storage.ts` (via `scopedKey`).
 *   - `use-auth.ts` (via `setActiveAccountId`).
 *   - `use-habits.ts` (via `migrateLegacyStorage` / `migrateLegacyPlatformStorage`).
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
 *
 * @throws {Error} If the resolved ID is somehow empty (should never happen).
 */
export function getActiveAccountId(): string {
  if (_activeAccountId) return _activeAccountId;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(ACCOUNT_KEY);
    if (stored && stored.trim().length > 0) {
      _activeAccountId = stored;
      return stored;
    }
  }

  return "anonymous";
}

/**
 * Set the active account ID and persist it.
 * Pass `"anonymous"` to switch back to the anonymous namespace.
 *
 * @throws {Error} If `id` is empty or null/undefined.
 */
export function setActiveAccountId(id: string): void {
  if (!id || id.trim().length === 0) {
    throw new Error(
      "[account-scope] setActiveAccountId called with empty id. " +
      "Use 'anonymous' for the anonymous namespace.",
    );
  }
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
 *
 * @throws {Error} If `baseKey` is empty.
 */
export function scopedKey(baseKey: string): string {
  if (!baseKey || baseKey.trim().length === 0) {
    throw new Error("[account-scope] scopedKey called with empty baseKey.");
  }
  const key = `${baseKey}::${getActiveAccountId()}`;
  if (process.env.NODE_ENV !== "production") {
    // Sanity-check: the key must contain the delimiter
    if (!key.includes("::")) {
      throw new Error(`[account-scope] scopedKey produced invalid key: ${key}`);
    }
  }
  return key;
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
