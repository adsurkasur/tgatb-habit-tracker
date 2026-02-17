/**
 * @module notifications
 *
 * Platform-abstracted daily reminder notification scheduling.
 *
 * - Android (Capacitor): Uses @capacitor/local-notifications for reliable OS-level alarms.
 * - Web: Uses the Notification API as best-effort (only fires when browser/PWA is active).
 *
 * Notification messages are sourced from the "reminder" context in the
 * motivator personality system so tone matches the user's chosen personality.
 *
 * No server, no FCM, no Service Worker timers.
 *
 * Responsibilities:
 *   - Schedule / cancel / re-establish daily reminders.
 *   - Manage notification permissions on both platforms.
 *   - Rotate motivator messages on each (re-)schedule.
 *
 * Invariants:
 *   - Notification scheduling MUST NOT access or modify habit data.
 *   - Android notification ID (`REMINDER_NOTIFICATION_ID`) is constant
 *     to ensure only one reminder exists at a time.
 *   - `scheduleReminder` is idempotent — always cancels before scheduling.
 *   - Icon references MUST use PNG assets (not SVG) for Android compatibility.
 *
 * Allowed callers:
 *   - `settings-dialog.tsx` / `settings-screen.tsx` (user toggles).
 *   - `use-habits.ts` (via `reestablishReminder` on mount / visibility).
 */

import type { MotivatorPersonality } from "@shared/schema";
import { motivatorMessages } from "./motivator-messages";

const REMINDER_NOTIFICATION_ID = 42001;
const DEFAULT_PERSONALITY: MotivatorPersonality = "positive";

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

async function isNativePlatform(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Android (Capacitor)  local notifications via OS alarm
// ---------------------------------------------------------------------------

async function requestAndroidPermission(): Promise<boolean> {
  const { LocalNotifications } = await import(
    "@capacitor/local-notifications"
  );
  const perm = await LocalNotifications.requestPermissions();
  return perm.display === "granted";
}

async function checkAndroidPermission(): Promise<boolean> {
  const { LocalNotifications } = await import(
    "@capacitor/local-notifications"
  );
  const perm = await LocalNotifications.checkPermissions();
  return perm.display === "granted";
}

/** Currently stored Android reminder config for re-scheduling with rotated messages. */
let androidReminderConfig: { timeStr: string; personality: MotivatorPersonality } | null = null;



/**
 * Schedule a single notification for the next reminder time.
 * No repeats: notification will only fire once at the scheduled time.
 */
async function scheduleAndroidReminder(
  timeStr: string,
  personality: MotivatorPersonality = DEFAULT_PERSONALITY,
): Promise<void> {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  // Cancel any existing reminder first (by ID)
  await cancelAndroidReminder();

  // Store config so we can re-schedule with a fresh message
  androidReminderConfig = { timeStr, personality };

  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_NOTIFICATION_ID,
        title: "TGATB Habit Tracker",
        body: pickReminderMessage(personality),
        schedule: {
          at: next,
          // CRITICAL: no repeats, only one fire
          allowWhileIdle: true,
        },
        sound: undefined, // default system sound
        smallIcon: "ic_notification",
        largeIcon: "ic_launcher",
        actionTypeId: "OPEN_APP",
      },
    ],
  });
}

/**
 * Re-schedule the Android reminder with a fresh rotated message.
 * Call this on app resume / visibility change so the notification body
 * isn't frozen from the original schedule time.
 */
export async function refreshAndroidReminder(): Promise<void> {
  if (!androidReminderConfig) return;
  if (!(await isNativePlatform())) return;
  const { timeStr, personality } = androidReminderConfig;
  await scheduleAndroidReminder(timeStr, personality);
}

async function cancelAndroidReminder(): Promise<void> {
  const { LocalNotifications } = await import(
    "@capacitor/local-notifications"
  );
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: REMINDER_NOTIFICATION_ID }],
    });
  } catch {
    // Ignore if nothing was scheduled
  }
}

// ---------------------------------------------------------------------------
// Web  Notification API (best-effort)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Shared helper — pick a random reminder message for a personality
// ---------------------------------------------------------------------------

function pickReminderMessage(personality: MotivatorPersonality): string {
  const pool = motivatorMessages[personality]?.reminder;
  if (pool && pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return "Time to check in! How are your habits today?";
}

let webReminderTimer: ReturnType<typeof setTimeout> | null = null;

function requestWebPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve(false);
  }
  if (Notification.permission === "granted") return Promise.resolve(true);
  if (Notification.permission === "denied") return Promise.resolve(false);
  return Notification.requestPermission().then((p) => p === "granted");
}

function checkWebPermission(): boolean {
  if (typeof window === "undefined" || !("Notification" in window))
    return false;
  return Notification.permission === "granted";
}

/** Currently active personality — stored so re-tick uses the right voice. */
let activePersonality: MotivatorPersonality = DEFAULT_PERSONALITY;

function scheduleWebReminder(
  timeStr: string,
  personality: MotivatorPersonality = DEFAULT_PERSONALITY,
): void {
  cancelWebReminder();
  activePersonality = personality;

  const [hours, minutes] = timeStr.split(":").map(Number);

  const tick = () => {
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    let delay = target.getTime() - now.getTime();
    if (delay <= 0) {
      // If time already passed today, show it now if within 60s window,
      // otherwise schedule for tomorrow
      if (delay > -60_000) {
        fireWebNotification();
        // Schedule again for tomorrow
        delay += 24 * 60 * 60 * 1000;
      } else {
        delay += 24 * 60 * 60 * 1000;
      }
    }

    webReminderTimer = setTimeout(() => {
      fireWebNotification();
      // Re-schedule for next day
      tick();
    }, delay);
  };

  tick();
}

function cancelWebReminder(): void {
  if (webReminderTimer !== null) {
    clearTimeout(webReminderTimer);
    webReminderTimer = null;
  }
}

function fireWebNotification(): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    new Notification("TGATB Habit Tracker", {
      body: pickReminderMessage(activePersonality),
      icon: "/icons/icon-192x192-notification.png",
      tag: "tgatb-daily-reminder",
    });
  } catch {
    // Notification constructor may fail in some environments
  }
}

// ---------------------------------------------------------------------------
// Public API  platform-agnostic
// ---------------------------------------------------------------------------

/**
 * Request notification permission on the current platform.
 * Returns true if permission was granted.
 */
export async function requestReminderPermission(): Promise<boolean> {
  if (await isNativePlatform()) {
    return requestAndroidPermission();
  }
  return requestWebPermission();
}

/**
 * Check if notification permission is currently granted.
 */
export async function checkReminderPermission(): Promise<boolean> {
  if (await isNativePlatform()) {
    return checkAndroidPermission();
  }
  return checkWebPermission();
}

/**
 * Schedule a daily reminder at the given time (HH:mm).
 * On Android this uses OS-level alarms. On web it uses setTimeout (best-effort).
 * The notification message is sourced from the motivator "reminder" context
 * matching the user's chosen personality.
 */
export async function scheduleReminder(
  timeStr: string,
  personality: MotivatorPersonality = DEFAULT_PERSONALITY,
): Promise<void> {
  if (await isNativePlatform()) {
    return scheduleAndroidReminder(timeStr, personality);
  }
  scheduleWebReminder(timeStr, personality);
}

/**
 * Cancel any scheduled daily reminder.
 */
export async function cancelReminder(): Promise<void> {
  if (await isNativePlatform()) {
    return cancelAndroidReminder();
  }
  cancelWebReminder();
}

/**
 * Re-establish the reminder timer from persisted settings.
 * Should be called on app mount and visibility-change → visible
 * so that web reminders survive page reloads and Android reminders
 * get a rotated message body.
 */
export async function reestablishReminder(
  enabled: boolean,
  timeStr: string | null | undefined,
  personality: MotivatorPersonality = DEFAULT_PERSONALITY,
): Promise<void> {
  if (!enabled || !timeStr) return;

  if (await isNativePlatform()) {
    // Re-schedule with fresh rotated message
    await refreshAndroidReminder();
  } else {
    // On web, scheduleWebReminder is idempotent (cancels old timer first)
    scheduleWebReminder(timeStr, personality);
  }
}
