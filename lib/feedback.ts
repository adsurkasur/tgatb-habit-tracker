/**
 * @module feedback
 *
 * Composite feedback orchestrator — delegates to `lib/haptics.ts` (vibration)
 * and `lib/sound.ts` (procedural Web Audio).
 *
 * All feedback is fire-and-forget: never blocks UI, never throws.
 *
 * Invariants:
 *   - Haptics calls go through `lib/haptics.ts` only.
 *   - Sound calls go through `lib/sound.ts` only.
 *   - This file MUST NOT import `@capacitor/haptics` or create AudioContext.
 *   - Feedback respects `soundEnabled` and `hapticEnabled` settings
 *     passed by the caller (habit actions) or the module-level cache
 *     (global button press).
 *
 * Allowed callers:
 *   - `use-habits.ts` (after tracking / undo actions)
 *   - `components/ui/button.tsx` (global button press feedback)
 *   - Unit tests
 */

import {
  hapticSuccess,
  hapticStreak,
  hapticError as hapticErrorFn,
  hapticUndo as hapticUndoFn,
  hapticButtonPress as hapticButtonPressFn,
} from "@/lib/haptics";

import {
  playSuccessSound,
  playStreakSound,
  playFailureSound,
  playErrorSound,
  playUndoSound,
  playButtonPressSound,
} from "@/lib/sound";

// ---------------------------------------------------------------------------
// Global settings cache (written by use-habits.ts via setGlobalFeedbackSettings)
// ---------------------------------------------------------------------------

let _globalSoundEnabled = true;
let _globalHapticEnabled = true;

/**
 * One-way setter called from `use-habits.ts` whenever user settings change.
 * This is the ONLY way to update the cache — no other caller is allowed.
 */
export function setGlobalFeedbackSettings(opts: {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}): void {
  _globalSoundEnabled = opts.soundEnabled;
  _globalHapticEnabled = opts.hapticEnabled;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FeedbackOptions {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

/** Feedback for successfully marking a habit done. */
export function feedbackTrackSuccess(opts: FeedbackOptions, streakIncremented: boolean): void {
  if (opts.hapticEnabled) {
    if (streakIncremented) {
      hapticStreak();
    } else {
      hapticSuccess();
    }
  }
  if (opts.soundEnabled) {
    if (streakIncremented) {
      playStreakSound();
    } else {
      playSuccessSound();
    }
  }
}

/** Feedback for marking a habit as not done / failed. */
export function feedbackTrackFailure(opts: FeedbackOptions): void {
  if (opts.hapticEnabled) hapticSuccess();
  if (opts.soundEnabled) playFailureSound();
}

/** Feedback for invalid / error action. */
export function feedbackError(opts: FeedbackOptions): void {
  if (opts.hapticEnabled) hapticErrorFn();
  if (opts.soundEnabled) playErrorSound();
}

/** Feedback for undo action. */
export function feedbackUndo(opts: FeedbackOptions): void {
  if (opts.hapticEnabled) hapticUndoFn();
  if (opts.soundEnabled) playUndoSound();
}

// ---------------------------------------------------------------------------
// Global button press feedback (reads from module-level cache)
// ---------------------------------------------------------------------------

/** Ultra-subtle acknowledgement for any button press. Fire-and-forget. */
export function feedbackButtonPress(): void {
  try {
    if (_globalHapticEnabled) hapticButtonPressFn();
    if (_globalSoundEnabled) playButtonPressSound();
  } catch {
    // Silent — feedback must never break UI
  }
}
