import { MotivatorPersonality, HabitType } from "@shared/schema";
import { motivatorMessages, type MotivatorContext } from "./motivator-messages";

/** State of a habit used to determine the motivator context. */
export interface HabitState {
  /** Whether the habit was just completed (true) or missed (false). */
  completed: boolean;
  /** The habit type — affects success/failure inversion for "bad" habits. */
  habitType: HabitType;
  /** Current streak length (after the action). */
  streak: number;
  /** Previous streak length before today's action (0 if none). */
  previousStreak?: number;
  /** How many consecutive days were missed before today (0 if none). */
  daysMissed?: number;
  /** Whether this is the very first completion ever recorded for this habit. */
  isFirstCompletion?: boolean;
}

const MILESTONE_DAYS = [7, 14, 30, 60, 100];

/**
 * Determine the motivational context from habit state.
 * For "bad" habits, the success/failure semantics are inverted:
 * marking a bad habit as completed means you did the bad thing (failure),
 * NOT completing it means you resisted (success).
 */
function detectContext(state: HabitState): MotivatorContext {
  const actualSuccess =
    state.habitType === "bad" ? !state.completed : state.completed;

  if (actualSuccess) {
    // Positive path
    if (state.isFirstCompletion) return "firstDay";
    if (MILESTONE_DAYS.includes(state.streak)) return "milestone";
    if ((state.daysMissed ?? 0) >= 2) return "comeback";
    if (state.streak >= 3) return "streak";
    return "completed";
  }

  // Negative path
  if ((state.previousStreak ?? 0) >= 3) return "relapse";
  return "missed";
}

function pickRandom(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

export class Motivator {
  /**
   * Get a context-aware motivational message.
   * This is the preferred API — it uses full habit state to choose the right context.
   */
  static getContextMessage(
    personality: MotivatorPersonality,
    state: HabitState
  ): string {
    const context = detectContext(state);
    const pool = motivatorMessages[personality]?.[context];

    // Fallback: if pool somehow empty, use completed/missed
    const actualSuccess =
      state.habitType === "bad" ? !state.completed : state.completed;
    const fallbackContext: MotivatorContext = actualSuccess
      ? "completed"
      : "missed";
    const messages =
      pool && pool.length > 0
        ? pool
        : motivatorMessages[personality][fallbackContext];

    let message = pickRandom(messages);

    // Append streak info on positive outcomes with a streak
    if (actualSuccess && state.streak > 1) {
      message += ` (${state.streak} day streak!)`;
    }

    return message;
  }

  /**
   * Legacy API — preserved for backward compatibility.
   * Delegates to getContextMessage with minimal state.
   */
  static getMessage(
    personality: MotivatorPersonality,
    success: boolean,
    habitType: HabitType,
    streak: number
  ): string {
    return Motivator.getContextMessage(personality, {
      completed: success,
      habitType,
      streak,
    });
  }

  static getPersonalityDescription(personality: MotivatorPersonality): string {
    switch (personality) {
      case "positive":
        return "Encouraging and supportive";
      case "adaptive":
        return "Balanced and realistic";
      case "harsh":
        return "Direct and challenging";
    }
  }
}
