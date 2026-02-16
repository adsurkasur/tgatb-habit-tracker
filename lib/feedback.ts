/**
 * @module feedback
 *
 * Sound and haptic feedback helpers.
 *
 * Wraps Web Audio API for sound and delegates haptics to `lib/haptics.ts`.
 * All feedback is fire-and-forget: never blocks UI, never throws.
 *
 * Invariants:
 *   - No external sound files — tones generated via Web Audio API.
 *   - All functions degrade silently if unavailable.
 *   - Feedback respects `soundEnabled` and `hapticEnabled` settings
 *     passed by the caller.
 *   - Haptics calls MUST go through `lib/haptics.ts` — never import
 *     `@capacitor/haptics` directly in this file.
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

// ---------------------------------------------------------------------------
// Audio context singleton (lazy)
// ---------------------------------------------------------------------------

let _audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!_audioCtx) {
      _audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return _audioCtx;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Tone helpers (short, subtle, <300 ms)
// ---------------------------------------------------------------------------

function playTone(frequency: number, durationMs: number, type: OscillatorType = "sine", volume = 0.15): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume if suspended (autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    // Fade out to avoid click
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Silent failure
  }
}

// ---------------------------------------------------------------------------
// Sound presets
// ---------------------------------------------------------------------------

function playSuccessSound(): void {
  // Two-tone ascending chime
  playTone(523.25, 120, "sine", 0.12); // C5
  setTimeout(() => playTone(659.25, 180, "sine", 0.12), 100); // E5
}

function playFailureSound(): void {
  // Single descending tone
  playTone(330, 200, "triangle", 0.1); // E4
}

function playStreakSound(): void {
  // Three-tone ascending sparkle
  playTone(523.25, 100, "sine", 0.1);  // C5
  setTimeout(() => playTone(659.25, 100, "sine", 0.1), 80);  // E5
  setTimeout(() => playTone(783.99, 150, "sine", 0.12), 160); // G5
}

function playErrorSound(): void {
  // Low buzz
  playTone(220, 150, "square", 0.08); // A3
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
  if (opts.soundEnabled) playTone(440, 100, "sine", 0.08);
}
