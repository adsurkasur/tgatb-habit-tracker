/**
 * @module sound
 *
 * Procedural sound effects via Web Audio API.
 *
 * All sound in the app MUST go through this module.
 * Every function is fire-and-forget: never blocks UI, never throws.
 * On platforms without AudioContext the calls silently no-op.
 *
 * Timing:
 *   - All multi-tone sequencing uses `AudioContext.currentTime` offsets,
 *     NOT `setTimeout` / `setInterval`.  This guarantees sample-accurate,
 *     deterministic playback regardless of JS event-loop pressure.
 *
 * Invariants:
 *   - NO external audio files — every sound is synthesised at runtime.
 *   - AudioContext is created lazily on first use.
 *   - All public functions are wrapped in try/catch (never throw).
 *   - No haptic logic here — this module is sound only.
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
    // Resume if suspended (autoplay policy)
    if (_audioCtx.state === "suspended") {
      _audioCtx.resume().catch(() => {});
    }
    return _audioCtx;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Internal tone helper — audio-clock scheduled, never uses JS timers
// ---------------------------------------------------------------------------

/**
 * Schedule a single tone at a precise audio-clock time.
 *
 * @param ctx        - Active AudioContext
 * @param startTime  - Absolute `ctx.currentTime`-based start (seconds)
 * @param frequency  - Tone frequency in Hz
 * @param durationMs - Tone duration in milliseconds
 * @param type       - OscillatorType waveform
 * @param volume     - Peak gain (0–1)
 */
function playToneAt(
  ctx: AudioContext,
  startTime: number,
  frequency: number,
  durationMs: number,
  type: OscillatorType = "sine",
  volume = 0.15,
): void {
  try {
    const dur = durationMs / 1000;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    // Exponential ramp to near-zero avoids audible clicks on stop
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + dur);
  } catch {
    // Silent failure
  }
}

// ---------------------------------------------------------------------------
// Public semantic sound functions
// ---------------------------------------------------------------------------

/** Two-tone ascending chime — regular successful habit tracking. */
export function playSuccessSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    playToneAt(ctx, t + 0.000, 523.25, 120, "sine", 0.12); // C5
    playToneAt(ctx, t + 0.100, 659.25, 180, "sine", 0.12); // E5
  } catch { /* silent */ }
}

/** Three-tone ascending sparkle — streak increment. */
export function playStreakSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    playToneAt(ctx, t + 0.000, 523.25, 100, "sine", 0.10); // C5
    playToneAt(ctx, t + 0.080, 659.25, 100, "sine", 0.10); // E5
    playToneAt(ctx, t + 0.160, 783.99, 150, "sine", 0.12); // G5
  } catch { /* silent */ }
}

/** Single descending tone — habit marked as failed / not done. */
export function playFailureSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    playToneAt(ctx, ctx.currentTime, 330, 200, "triangle", 0.1); // E4
  } catch { /* silent */ }
}

/** Low buzz — invalid action or already-completed. */
export function playErrorSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    playToneAt(ctx, ctx.currentTime, 220, 150, "square", 0.08); // A3
  } catch { /* silent */ }
}

/** Brief neutral pip — undo action. */
export function playUndoSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    playToneAt(ctx, ctx.currentTime, 440, 100, "sine", 0.08); // A4
  } catch { /* silent */ }
}

/** Ultra-subtle tick — generic button press acknowledgement. */
export function playButtonPressSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    playToneAt(ctx, ctx.currentTime, 800, 50, "sine", 0.04);
  } catch { /* silent */ }
}
