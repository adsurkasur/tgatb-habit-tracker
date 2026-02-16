/**
 * @module haptics
 *
 * Haptic (vibration) feedback abstraction.
 *
 * All Capacitor Haptics usage in the app MUST go through this module.
 * Every function is fire-and-forget: never blocks UI, never throws.
 * On web or unsupported platforms, calls silently no-op.
 *
 * Pattern design:
 *   - Uses composite impact sequences (Light/Medium + micro-delays)
 *     to create layered, expressive feedback similar to Duolingo.
 *   - Public functions are async internally but callers MUST NOT await them.
 *   - Delays are in the 20–60 ms range — perceptible but never blocking.
 *
 * Invariants:
 *   - Guards every call with `isHapticsSupported()`.
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
// Internal helpers
// ---------------------------------------------------------------------------

/** Micro-delay for separating sequential impacts. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Semantic haptic functions
// ---------------------------------------------------------------------------

/**
 * Confirmed action — Light tap followed by a Medium tap.
 * The two-step ramp-up makes success feel deliberate and satisfying.
 */
export async function hapticSuccess(): Promise<void> {
  if (!isHapticsSupported()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
    await delay(30);
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch { /* silent */ }
}

/**
 * Streak / reward — Light → Medium → Medium triple-tap.
 * The escalating rhythm creates a celebratory "roll" sensation.
 */
export async function hapticStreak(): Promise<void> {
  if (!isHapticsSupported()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
    await delay(25);
    await Haptics.impact({ style: ImpactStyle.Medium });
    await delay(40);
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch { /* silent */ }
}

/**
 * Error / invalid action — single notification-style buzz.
 * Firm but not noisy; no multi-tap to avoid confusion with success patterns.
 */
export async function hapticError(): Promise<void> {
  if (!isHapticsSupported()) return;
  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch { /* silent */ }
}

/**
 * Undo / reversal — two quick Light taps.
 * Feels neutral and "rewind-like", distinctly lighter than success.
 */
export async function hapticUndo(): Promise<void> {
  if (!isHapticsSupported()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
    await delay(20);
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch { /* silent */ }
}

/**
 * Generic button press — single Light tap.
 * Minimal acknowledgement only; must never feel intrusive.
 */
export async function hapticButtonPress(): Promise<void> {
  if (!isHapticsSupported()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch { /* silent */ }
}
