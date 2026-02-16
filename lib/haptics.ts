/**
 * @module haptics
 *
 * Haptic (vibration) feedback abstraction.
 *
 * All Capacitor Haptics usage in the app MUST go through this module.
 * Every function is fire-and-forget: never blocks UI, never throws.
 * On web or unsupported platforms, calls silently no-op.
 *
 * Invariants:
 *   - Guards every call with `Capacitor.isNativePlatform()`.
 *   - Every public function is wrapped in try/catch (never throws).
 *   - No sound logic here — this module is vibration only.
 *
 * Allowed callers:
 *   - `lib/feedback.ts` (composite feedback orchestrator)
 *   - Unit tests
 */

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// ---------------------------------------------------------------------------
// Capability detection
// ---------------------------------------------------------------------------

/**
 * Returns `true` only when running on a native platform where the
 * Capacitor Haptics plugin is available.  Pure, synchronous, never throws.
 */
export function isHapticsSupported(): boolean {
  try {
    return Capacitor.isNativePlatform() && typeof Haptics !== "undefined";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Semantic haptic functions
// ---------------------------------------------------------------------------

/** Light tap — used for regular successful habit tracking. */
export function hapticSuccess(): void {
  if (!Capacitor.isNativePlatform()) return;
  try { Haptics.impact({ style: ImpactStyle.Light }); } catch { /* silent */ }
}

/** Medium tap — used when a streak increments. */
export function hapticStreak(): void {
  if (!Capacitor.isNativePlatform()) return;
  try { Haptics.impact({ style: ImpactStyle.Medium }); } catch { /* silent */ }
}

/** Error notification — used for invalid / already-completed actions. */
export function hapticError(): void {
  if (!Capacitor.isNativePlatform()) return;
  try { Haptics.notification({ type: NotificationType.Error }); } catch { /* silent */ }
}

/** Light tap — used for undo actions. */
export function hapticUndo(): void {
  if (!Capacitor.isNativePlatform()) return;
  try { Haptics.impact({ style: ImpactStyle.Light }); } catch { /* silent */ }
}

/** Very light tap — generic button press acknowledgement. */
export function hapticButtonPress(): void {
  if (!Capacitor.isNativePlatform()) return;
  try { Haptics.impact({ style: ImpactStyle.Light }); } catch { /* silent */ }
}
