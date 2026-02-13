/**
 * Platform-abstracted daily reminder notification scheduling.
 *
 * - Android (Capacitor): Uses @capacitor/local-notifications for reliable OS-level alarms.
 * - Web: Uses the Notification API as best-effort (only fires when browser/PWA is active).
 *
 * No server, no FCM, no Service Worker timers.
 */

const REMINDER_NOTIFICATION_ID = 42001;

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

async function scheduleAndroidReminder(timeStr: string): Promise<void> {
  const { LocalNotifications } = await import(
    "@capacitor/local-notifications"
  );
  // Cancel any existing reminder first
  await cancelAndroidReminder();

  const [hours, minutes] = timeStr.split(":").map(Number);

  // Calculate next occurrence
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
        body: "Time to check in! How are your habits today?",
        schedule: {
          at: next,
          repeats: true,
          every: "day",
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

function scheduleWebReminder(timeStr: string): void {
  cancelWebReminder();

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
      body: "Time to check in! How are your habits today?",
      icon: "/icons/icon-192x192.svg",
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
 */
export async function scheduleReminder(timeStr: string): Promise<void> {
  if (await isNativePlatform()) {
    return scheduleAndroidReminder(timeStr);
  }
  scheduleWebReminder(timeStr);
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
