export const TOAST_DURATIONS = {
  short: 3000,
  long: 5000,
} as const;

export const AUTH_TOASTS = {
  expired: {
    title: "Logged Out Automatically",
    description: "Your login has expired. Please sign in again to access sync and cloud features.",
    variant: "destructive" as const,
    duration: TOAST_DURATIONS.long,
  },
  signInSuccess: {
    title: "Sign-in Successful",
    description: "You are now signed in with Google.",
    duration: TOAST_DURATIONS.short,
  },
  signInFailed: {
    title: "Sign-in Failed",
    description: "Could not sign in with Google.",
    variant: "destructive" as const,
    duration: TOAST_DURATIONS.short,
  },
  signInNoCredentials: {
    title: "Sign-in Error",
    description: "No Google account found on this device. Please add an account and try again.",
    variant: "destructive" as const,
    duration: TOAST_DURATIONS.short,
  },
  loggedOut: {
    title: "Logged Out",
    description: "You have been logged out of Google.",
    duration: TOAST_DURATIONS.short,
  },
};

export function getAuthActionErrorToast(isLoggedIn: boolean, message: string) {
  return {
    title: isLoggedIn ? "Logout Error" : "Sign-in Error",
    description: message || `An error occurred during ${isLoggedIn ? "logout" : "sign-in"}.`,
    variant: "destructive" as const,
    duration: TOAST_DURATIONS.long,
  };
}
