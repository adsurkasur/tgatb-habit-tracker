/**
 * @module account-registry
 *
 * Local registry of known accounts for the account selector modal.
 *
 * Stored in a global (non-scoped) localStorage key so the registry
 * is accessible regardless of which account is currently active.
 *
 * Invariants:
 *   - NOT synced to cloud  local-only convenience data.
 *   - Safe to delete and rebuild (accounts re-appear on next login).
 *   - Anonymous account is always implicit (not stored in registry).
 *   - This module MUST NOT import from `habit-storage`, `use-auth`,
 *     or any React hook to avoid circular dependencies.
 *
 * Allowed callers:
 *   - `use-auth.ts` (register on login)
 *   - `account-selector-modal.tsx` (display list)
 */

const REGISTRY_KEY = "tgatb_known_accounts";

export interface KnownAccount {
  accountId: string;
  displayName: string;
  avatarUrl?: string;
}

/**
 * Get all known (previously logged-in) accounts.
 * Does NOT include the anonymous account.
 */
export function getKnownAccounts(): KnownAccount[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a: unknown): a is KnownAccount =>
        typeof a === "object" &&
        a !== null &&
        typeof (a as KnownAccount).accountId === "string" &&
        typeof (a as KnownAccount).displayName === "string"
    );
  } catch {
    return [];
  }
}

/**
 * Add or update an account in the registry.
 * If the account already exists (by accountId), its display info is updated.
 */
export function addKnownAccount(account: KnownAccount): void {
  const accounts = getKnownAccounts();
  const idx = accounts.findIndex((a) => a.accountId === account.accountId);
  if (idx >= 0) {
    accounts[idx] = account;
  } else {
    accounts.push(account);
  }
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(accounts));
}

/**
 * Remove an account from the registry by accountId.
 */
export function removeKnownAccount(accountId: string): void {
  const accounts = getKnownAccounts().filter((a) => a.accountId !== accountId);
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(accounts));
}
