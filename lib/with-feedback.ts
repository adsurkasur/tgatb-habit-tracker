/**
 * @module with-feedback
 *
 * Utility wrapper that fires global button-press feedback before a handler.
 *
 * Designed for non-Button interactive elements (close buttons, switches,
 * select items, tabs, clickable divs) that need the same subtle haptic/sound
 * acknowledgement without importing settings or React.
 *
 * Invariants:
 *   - Imports ONLY `feedbackButtonPress` from `lib/feedback.ts`.
 *   - No React, no hooks, no schemas.
 *   - Never throws, never blocks.
 *
 * Allowed callers:
 *   - Any UI primitive component that wraps a user-interaction callback.
 *   - Unit tests.
 */

import { feedbackButtonPress } from "@/lib/feedback";

/**
 * Returns a function that fires `feedbackButtonPress()` then calls `handler`.
 *
 * @param handler  - Optional callback to run after feedback.
 * @param options  - `{ disabled }` — when `true`, skips feedback AND handler.
 */
export function withFeedback<Args extends unknown[]>(
  handler?: (...args: Args) => void,
  options?: { disabled?: boolean },
): (...args: Args) => void {
  return (...args: Args) => {
    if (options?.disabled) return;
    try {
      feedbackButtonPress();
    } catch {
      // feedback must never break UI
    }
    handler?.(...args);
  };
}
