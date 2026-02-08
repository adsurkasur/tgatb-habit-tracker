import { useEffect, useRef } from 'react';
import { useIsMobile } from './use-mobile';

// ─── Global back-navigation stack (singleton) ────────────
// Implements LIFO ordering: the most recently registered active handler
// fires on back press. This ensures stacked modals close one at a time.

interface StackEntry {
  id: string;
  callback: () => void;
}

const backStack: StackEntry[] = [];
let listenerAttached = false;
let handlingBack = false;

function attachListener() {
  if (listenerAttached || typeof window === 'undefined') return;
  listenerAttached = true;

  window.addEventListener('popstate', () => {
    if (handlingBack || backStack.length === 0) return;
    handlingBack = true;

    // Fire only the topmost handler (last in array = most recently registered)
    const top = backStack[backStack.length - 1];
    if (top) top.callback();

    // Re-push state to stay on the current URL
    window.history.pushState(null, '', window.location.href);

    setTimeout(() => {
      handlingBack = false;
    }, 100);
  });
}

function pushBack(id: string, callback: () => void) {
  // Deduplicate: remove any existing entry with the same id
  const idx = backStack.findIndex(e => e.id === id);
  if (idx !== -1) backStack.splice(idx, 1);

  backStack.push({ id, callback });
  window.history.pushState(null, '', window.location.href);
  attachListener();
}

function popBack(id: string) {
  const idx = backStack.findIndex(e => e.id === id);
  if (idx !== -1) backStack.splice(idx, 1);
}

// ─── Public hook ─────────────────────────────────────────

interface UseMobileBackNavigationOptions {
  /** Callback invoked when the back button/gesture is pressed. */
  onBackPressed?: () => void;
  /** Whether this handler is active and on the stack. Default: true */
  isActive?: boolean;
}

/**
 * Register a back-navigation handler on the global modal stack.
 *
 * When multiple handlers are active (stacked modals), only the topmost
 * (most recently activated) handler fires on back press.
 * This enables proper stacked-modal dismissal — one layer at a time.
 */
export function useMobileBackNavigation({
  onBackPressed,
  isActive = true,
}: UseMobileBackNavigationOptions = {}) {
  const isMobile = useIsMobile();

  // Stable unique ID per hook instance
  const stableId = useRef('');
  if (!stableId.current) {
    stableId.current = `mbk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Always ref the latest callback so the stack closure calls the current one
  const callbackRef = useRef(onBackPressed);
  callbackRef.current = onBackPressed;

  useEffect(() => {
    if (!isMobile || !isActive) return;

    const id = stableId.current;
    pushBack(id, () => callbackRef.current?.());

    return () => {
      popBack(id);
    };
  }, [isMobile, isActive]);
}

// ─── Imperative helpers for native back button (Capacitor) ───
// These allow page.tsx to query/close the topmost modal from
// the Capacitor `backButton` event (which does NOT trigger popstate).

/** Returns true if any modal is registered on the back stack. */
export function hasOpenModals(): boolean {
  return backStack.length > 0;
}

/** Close the topmost modal on the stack. Returns true if one was closed. */
export function closeTopModal(): boolean {
  if (backStack.length === 0) return false;
  const top = backStack[backStack.length - 1];
  if (top) top.callback();
  return true;
}
