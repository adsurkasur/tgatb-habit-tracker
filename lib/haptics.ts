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

export type HapticProfile = "subtle" | "balanced" | "punchy";
export type HapticEvent =
  | "button"
  | "selection"
  | "navigation"
  | "success"
  | "streak"
  | "undo"
  | "failure"
  | "warning"
  | "error";

type SequenceStep =
  | { type: "impact"; style: ImpactStyle; waitAfterMs?: number }
  | { type: "notification"; tone: NotificationType; waitAfterMs?: number }
  | { type: "selection"; waitAfterMs?: number };

const profileSequences: Record<HapticProfile, Record<HapticEvent, SequenceStep[]>> = {
  subtle: {
    button: [{ type: "impact", style: ImpactStyle.Light }],
    selection: [{ type: "selection" }],
    navigation: [{ type: "selection" }, { type: "impact", style: ImpactStyle.Light, waitAfterMs: 10 }],
    success: [{ type: "impact", style: ImpactStyle.Light }],
    streak: [
      { type: "impact", style: ImpactStyle.Light, waitAfterMs: 18 },
      { type: "impact", style: ImpactStyle.Medium },
    ],
    undo: [
      { type: "impact", style: ImpactStyle.Light, waitAfterMs: 14 },
      { type: "impact", style: ImpactStyle.Light },
    ],
    failure: [{ type: "notification", tone: NotificationType.Warning }],
    warning: [{ type: "notification", tone: NotificationType.Warning }],
    error: [{ type: "notification", tone: NotificationType.Error }],
  },
  balanced: {
    button: [{ type: "impact", style: ImpactStyle.Light }],
    selection: [{ type: "selection" }],
    navigation: [{ type: "selection" }, { type: "impact", style: ImpactStyle.Medium, waitAfterMs: 12 }],
    success: [
      { type: "impact", style: ImpactStyle.Light, waitAfterMs: 20 },
      { type: "impact", style: ImpactStyle.Medium },
    ],
    streak: [
      { type: "impact", style: ImpactStyle.Light, waitAfterMs: 18 },
      { type: "impact", style: ImpactStyle.Medium, waitAfterMs: 24 },
      { type: "impact", style: ImpactStyle.Medium },
    ],
    undo: [
      { type: "impact", style: ImpactStyle.Light, waitAfterMs: 14 },
      { type: "impact", style: ImpactStyle.Light },
    ],
    failure: [{ type: "notification", tone: NotificationType.Warning }],
    warning: [{ type: "notification", tone: NotificationType.Warning }],
    error: [{ type: "notification", tone: NotificationType.Error }],
  },
  punchy: {
    button: [{ type: "impact", style: ImpactStyle.Medium }],
    selection: [{ type: "selection" }, { type: "impact", style: ImpactStyle.Light, waitAfterMs: 8 }],
    navigation: [{ type: "selection" }, { type: "impact", style: ImpactStyle.Medium, waitAfterMs: 10 }],
    success: [
      { type: "impact", style: ImpactStyle.Medium, waitAfterMs: 18 },
      { type: "impact", style: ImpactStyle.Medium },
    ],
    streak: [
      { type: "impact", style: ImpactStyle.Medium, waitAfterMs: 14 },
      { type: "impact", style: ImpactStyle.Medium, waitAfterMs: 20 },
      { type: "impact", style: ImpactStyle.Medium },
    ],
    undo: [
      { type: "impact", style: ImpactStyle.Light, waitAfterMs: 10 },
      { type: "impact", style: ImpactStyle.Medium },
    ],
    failure: [{ type: "notification", tone: NotificationType.Warning }],
    warning: [{ type: "notification", tone: NotificationType.Warning }],
    error: [{ type: "notification", tone: NotificationType.Error }],
  },
};

const webVibrationPatterns: Partial<Record<HapticEvent, number[]>> = {
  button: [8],
  selection: [6],
  navigation: [8, 10, 10],
  success: [10, 14, 12],
  streak: [12, 16, 12, 20, 18],
  undo: [8, 10, 8],
  failure: [16],
  warning: [18],
  error: [20, 20, 20],
};

const EVENT_MIN_GAP_MS = 28;

let _profile: HapticProfile = "balanced";
let _lastEventAt = 0;

// ---------------------------------------------------------------------------
// Capability detection
// ---------------------------------------------------------------------------

/**
 * Returns `true` only when running on a native platform where the
 * Capacitor Haptics plugin is available.  Pure, synchronous, never throws.
 */
export function isHapticsSupported(): boolean {
  try {
    return isNativeHapticsSupported() || isWebVibrationSupported();
  } catch {
    return false;
  }
}

function isNativeHapticsSupported(): boolean {
  return Capacitor.isNativePlatform() && typeof Haptics !== "undefined";
}

function isWebVibrationSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function setHapticProfile(profile: HapticProfile): void {
  _profile = profile;
}

export function getHapticProfile(): HapticProfile {
  return _profile;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Micro-delay for separating sequential impacts. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeStep(step: SequenceStep): Promise<void> {
  if (step.type === "impact") {
    await Haptics.impact({ style: step.style });
  } else if (step.type === "notification") {
    await Haptics.notification({ type: step.tone });
  } else {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  }

  if (step.waitAfterMs && step.waitAfterMs > 0) {
    await delay(step.waitAfterMs);
  }
}

function isEventThrottled(): boolean {
  const now = Date.now();
  if (now - _lastEventAt < EVENT_MIN_GAP_MS) {
    return true;
  }
  _lastEventAt = now;
  return false;
}

async function runNativeSequence(event: HapticEvent): Promise<void> {
  const sequence = profileSequences[_profile][event];
  for (const step of sequence) {
    await executeStep(step);
  }
}

function runWebVibration(event: HapticEvent): void {
  const pattern = webVibrationPatterns[event];
  if (!pattern || !isWebVibrationSupported()) return;
  navigator.vibrate(pattern);
}

export async function hapticEvent(event: HapticEvent): Promise<void> {
  if (!isHapticsSupported()) return;
  if (isEventThrottled()) return;

  try {
    if (isNativeHapticsSupported()) {
      await runNativeSequence(event);
      return;
    }
    runWebVibration(event);
  } catch {
    // silent
  }
}

// ---------------------------------------------------------------------------
// Semantic haptic functions
// ---------------------------------------------------------------------------

/**
 * Confirmed action — Light tap followed by a Medium tap.
 * The two-step ramp-up makes success feel deliberate and satisfying.
 */
export async function hapticSuccess(): Promise<void> {
  await hapticEvent("success");
}

/**
 * Streak / reward — Light → Medium → Medium triple-tap.
 * The escalating rhythm creates a celebratory "roll" sensation.
 */
export async function hapticStreak(): Promise<void> {
  await hapticEvent("streak");
}

/**
 * Error / invalid action — single notification-style buzz.
 * Firm but not noisy; no multi-tap to avoid confusion with success patterns.
 */
export async function hapticError(): Promise<void> {
  await hapticEvent("error");
}

/**
 * Undo / reversal — two quick Light taps.
 * Feels neutral and "rewind-like", distinctly lighter than success.
 */
export async function hapticUndo(): Promise<void> {
  await hapticEvent("undo");
}

/**
 * Generic button press — single Light tap.
 * Minimal acknowledgement only; must never feel intrusive.
 */
export async function hapticButtonPress(): Promise<void> {
  await hapticEvent("button");
}

export async function hapticFailure(): Promise<void> {
  await hapticEvent("failure");
}

export async function hapticSelection(): Promise<void> {
  await hapticEvent("selection");
}

export async function hapticNavigation(): Promise<void> {
  await hapticEvent("navigation");
}
