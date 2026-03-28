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
  type HapticProfile,
  setHapticProfile,
  hapticGoodDone,
  hapticGoodNotDone,
  hapticBadAvoided,
  hapticBadDone,
  hapticSuccess,
  hapticStreak,
  hapticFailure,
  hapticSelection,
  hapticNavigation,
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
let _globalHapticProfile: HapticProfile = "balanced";

/**
 * One-way setter called from `use-habits.ts` whenever user settings change.
 * This is the ONLY way to update the cache — no other caller is allowed.
 */
export function setGlobalFeedbackSettings(opts: {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  hapticProfile?: HapticProfile;
}): void {
  _globalSoundEnabled = opts.soundEnabled;
  _globalHapticEnabled = opts.hapticEnabled;
  _globalHapticProfile = opts.hapticProfile ?? "balanced";
  setHapticProfile(_globalHapticProfile);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FeedbackOptions {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  hapticProfile?: HapticProfile;
}

export type HabitOutcomeFeedback = "goodDone" | "goodNotDone" | "badAvoided" | "badDone";

function applyHapticProfile(profile?: HapticProfile): void {
  setHapticProfile(profile ?? _globalHapticProfile);
}

/** Feedback for successfully marking a habit done. */
export function feedbackTrackSuccess(opts: FeedbackOptions, streakIncremented: boolean): void {
  if (opts.hapticEnabled) {
    applyHapticProfile(opts.hapticProfile);
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
  if (opts.hapticEnabled) {
    applyHapticProfile(opts.hapticProfile);
    hapticFailure();
  }
  if (opts.soundEnabled) playFailureSound();
}

/** Emotion-aware feedback for habit outcomes (good/bad + done/not done). */
export function feedbackHabitOutcome(
  opts: FeedbackOptions,
  outcome: HabitOutcomeFeedback,
  streakIncremented: boolean,
): void {
  if (opts.hapticEnabled) {
    applyHapticProfile(opts.hapticProfile);

    if ((outcome === "goodDone" || outcome === "badAvoided") && streakIncremented) {
      hapticStreak();
    } else if (outcome === "goodDone") {
      hapticGoodDone();
    } else if (outcome === "goodNotDone") {
      hapticGoodNotDone();
    } else if (outcome === "badAvoided") {
      hapticBadAvoided();
    } else {
      hapticBadDone();
    }
  }

  if (opts.soundEnabled) {
    if ((outcome === "goodDone" || outcome === "badAvoided") && streakIncremented) {
      playStreakSound();
    } else if (outcome === "goodDone" || outcome === "badAvoided") {
      playSuccessSound();
    } else {
      playFailureSound();
    }
  }
}

/** Feedback for invalid / error action. */
export function feedbackError(opts: FeedbackOptions): void {
  if (opts.hapticEnabled) {
    applyHapticProfile(opts.hapticProfile);
    hapticErrorFn();
  }
  if (opts.soundEnabled) playErrorSound();
}

/** Feedback for undo action. */
export function feedbackUndo(opts: FeedbackOptions): void {
  if (opts.hapticEnabled) {
    applyHapticProfile(opts.hapticProfile);
    hapticUndoFn();
  }
  if (opts.soundEnabled) playUndoSound();
}

/** Selection-change feedback for pickers/tabs/toggles. */
export function feedbackSelection(): void {
  try {
    if (_globalHapticEnabled) {
      setHapticProfile(_globalHapticProfile);
      hapticSelection();
    }
  } catch {
    // Silent
  }
}

/** Navigation feedback for previous/next style interactions. */
export function feedbackNavigation(): void {
  try {
    if (_globalHapticEnabled) {
      setHapticProfile(_globalHapticProfile);
      hapticNavigation();
    }
  } catch {
    // Silent
  }
}

/** Celebration feedback for milestone overlays. */
export function feedbackCelebration(opts: FeedbackOptions): void {
  if (opts.hapticEnabled) {
    applyHapticProfile(opts.hapticProfile);
    hapticStreak();
  }
  if (opts.soundEnabled) {
    playStreakSound();
  }
}

// ---------------------------------------------------------------------------
// Global button press feedback (reads from module-level cache)
// ---------------------------------------------------------------------------

/** Ultra-subtle acknowledgement for any button press. Fire-and-forget. */
export function feedbackButtonPress(): void {
  try {
    if (_globalHapticEnabled) {
      setHapticProfile(_globalHapticProfile);
      hapticButtonPressFn();
    }
    if (_globalSoundEnabled) playButtonPressSound();
  } catch {
    // Silent — feedback must never break UI
  }
}
