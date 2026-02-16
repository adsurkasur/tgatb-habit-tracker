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
 *     passed by the caller.
 *
 * Allowed callers:
 *   - `use-habits.ts` (after tracking / undo actions)
 *   - Unit tests
 */

import {
  hapticSuccess,
  hapticStreak,
  hapticError as hapticErrorFn,
  hapticUndo as hapticUndoFn,
} from "@/lib/haptics";

import {
  playSuccessSound,
  playStreakSound,
  playFailureSound,
  playErrorSound,
  playUndoSound,
} from "@/lib/sound";

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
