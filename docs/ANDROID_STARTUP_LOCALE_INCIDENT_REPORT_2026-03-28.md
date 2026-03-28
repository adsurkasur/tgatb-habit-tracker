# Android Startup Locale Incident Report

## Summary

On Android (Capacitor runtime), the app could enter a startup failure state after first setup and language change, especially after closing and reopening the app. The user-visible result was a persistent loading experience and non-functional startup. The issue was confirmed resolved after applying hydration-safe locale handling and native language-change flow adjustments.

## User Impact

- Cold start could fail after changing language.
- Relaunch could trigger React runtime failure and prevent normal app rendering.
- The failure looked like a loading deadlock to end users.

## Primary Symptoms Observed

- React minified error #418 during app relaunch.
- Repeated locale-related asset requests in logcat.
- Repeated Capacitor asset-open failures for locale page resources.
- Startup UI appeared stuck even though native activity lifecycle was normal.

## Root Cause Analysis

The failure had two interacting causes.

1. Hydration-unsafe locale selection on native startup.
- Locale in the app provider could diverge from the route/SSR locale too early.
- This created text/content mismatches during hydration and triggered React #418.

2. Native language flow induced excessive locale navigation/prefetch behavior.
- Language modal path initiated multi-locale prefetch/navigation pressure.
- Capacitor static asset serving then produced repeated locale resource failures for requests that did not map cleanly to exported locale asset structure.
- This increased instability around startup and locale transitions.

## Why It Was Not Just One Simple Path Mismatch

Path mismatch was part of the runtime noise, but the deterministic crash mechanism was hydration mismatch from locale selection timing. In practice:

- Path-level locale asset errors amplified instability.
- Hydration-unsafe provider locale decision caused the fatal React runtime error.

Both had to be addressed for a durable fix.

## Fixes Implemented

### 1) Hydration-safe locale resolution in providers

File changed:
- app/providers.tsx

What changed:
- Initial render now uses route/default locale for hydration safety.
- Persisted native locale is applied after mount (client-side effect), not during initial render.
- Added locale DOM sync (`document.documentElement.lang`) as locale state changes.
- Added a native custom-event listener for runtime locale updates (`tgatb:locale-change`).

Why this works:
- Ensures SSR/initial client render agreement.
- Prevents React hydration mismatch on relaunch.

### 2) Native language apply no longer depends on route navigation

File changed:
- components/settings/appearance-settings.tsx

What changed:
- On native platform, language apply now dispatches `tgatb:locale-change` and returns.
- Native language update no longer executes route replacement navigation as the primary mechanism.

Why this works:
- Decouples native locale state updates from fragile route transitions during startup-sensitive moments.

### 3) Removed eager all-locales prefetch behavior from language modal

File changed:
- components/settings/appearance-settings.tsx

What changed:
- Removed prefetch fan-out across all locales when opening the language modal.

Why this works:
- Prevents request storms and reduces chances of locale asset churn/race conditions in Capacitor static serving.

## Validation Performed

All checks passed after implementation.

- TypeScript check: passed (`npm run check`)
- Lint: passed (`npm run lint`)
- Web export + Capacitor sync: passed (`npm run android:build`)
- Android native assemble: passed (`android/gradlew.bat assembleDebug`)

User confirmation:
- Issue reproduced previously by user is now resolved on-device.

## Files Modified for Final Fix

- app/providers.tsx
- components/settings/appearance-settings.tsx
- ai-context.md (tracking and evidence log)

## Preventive Best Practices

- Keep locale resolution hydration-safe: route/default for first paint, persisted overrides post-mount.
- Avoid broad prefetch fan-out for all locales in native runtime.
- Keep native locale-change handling event-driven and deterministic.
- Treat route navigation as optional for locale application in native shell contexts.
- Preserve startup path simplicity; avoid coupling loader visibility to risky async route transitions.

## Final Status

Resolved. Android first-setup and relaunch startup behavior is stable with persisted language flow functioning correctly.
