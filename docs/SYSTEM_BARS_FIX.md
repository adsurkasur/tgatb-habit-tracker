# System Bars Implementation Notes (Current)

This document captures the current stable architecture for system bars and fullscreen behavior.

## Current Architecture

- Unified hook: `hooks/use-system-bars-unified.ts`
- Native bridge: `SystemUiPlugin` (`android/app/src/main/java/com/tgatb/habittracker/SystemUiPlugin.java`)
- Activity lifecycle reapply: `MainActivity` (`onCreate`, `onResume`, `onWindowFocusChanged`)

## Behavior Summary

1. Non-fullscreen uses purple bars with light icons.
2. Fullscreen uses immersive hide/show and theme-aware surface colors.
3. Dark surface color is aligned to `#201E24` for seam consistency.
4. Android 15+ path avoids deprecated edge-to-edge control patterns in normal flow.

## Why This Matters

- Prevents conflicting system bar ownership between JS and native layers.
- Keeps icon contrast correct while switching theme/fullscreen.
- Reduces visual seams between header and status bar in dark mode.

## Related Docs

- `docs/STATUS_BAR_IMPLEMENTATION.md`
- `docs/ANDROID_15_COMPATIBILITY.md`
- `docs/ANDROID_CAPACITOR_UPDATES.md`
