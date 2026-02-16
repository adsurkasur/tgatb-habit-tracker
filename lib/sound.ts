/**
 * @module sound
 *
 * Procedural sound effects via Web Audio API.
 *
 * All sound in the app MUST go through this module.
 * Every function is fire-and-forget: never blocks UI, never throws.
 * On platforms without AudioContext the calls silently no-op.
 *
 * Invariants:
 *   - NO external audio files  every sound is synthesised at runtime.
 *   - AudioContext is created lazily on first use.
 *   - All public functions are wrapped in try/catch (never throw).
 *   - No haptic logic here  this module is sound only.
 *
 * Allowed callers:
 *   - `lib/feedback.ts` (composite feedback orchestrator)
 *   - Unit tests
 */

// ---------------------------------------------------------------------------
// Audio context singleton (lazy)
// ---------------------------------------------------------------------------

let _audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!_audioCtx) {
      _audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    return _audioCtx;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Internal tone helper (short, subtle, <300 ms)
// ---------------------------------------------------------------------------

function playTone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = "sine",
  volume = 0.15,
): void {
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
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + durationMs / 1000,
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Silent failure
  }
}

// ---------------------------------------------------------------------------
// Public semantic sound functions
// ---------------------------------------------------------------------------

/** Two-tone ascending chime  regular successful habit tracking. */
export function playSuccessSound(): void {
  playTone(523.25, 120, "sine", 0.12); // C5
  setTimeout(() => playTone(659.25, 180, "sine", 0.12), 100); // E5
}

/** Three-tone ascending sparkle  streak increment. */
export function playStreakSound(): void {
  playTone(523.25, 100, "sine", 0.1); // C5
  setTimeout(() => playTone(659.25, 100, "sine", 0.1), 80); // E5
  setTimeout(() => playTone(783.99, 150, "sine", 0.12), 160); // G5
}

/** Single descending tone  habit marked as failed / not done. */
export function playFailureSound(): void {
  playTone(330, 200, "triangle", 0.1); // E4
}

/** Low buzz  invalid action or already-completed. */
export function playErrorSound(): void {
  playTone(220, 150, "square", 0.08); // A3
}

/** Brief neutral pip  undo action. */
export function playUndoSound(): void {
  playTone(440, 100, "sine", 0.08); // A4
}

/** Ultra-subtle tick — generic button press acknowledgement. */
export function playButtonPressSound(): void {
  playTone(800, 50, "sine", 0.04);
}
