# System Bar Implementation (Current)

This document describes current status/navigation bar behavior for the Android Capacitor app.

## Source of Truth

- JS orchestrator: `hooks/use-system-bars-unified.ts`
- Native plugin: `android/app/src/main/java/com/tgatb/habittracker/SystemUiPlugin.java`
- Activity lifecycle and IME insets: `android/app/src/main/java/com/tgatb/habittracker/MainActivity.java`

## Runtime Behavior

### Non-Fullscreen Mode

- Status and navigation bars are shown.
- Bar color uses app brand purple (`#6750A4`).
- Icon appearance is light for contrast.

### Fullscreen Mode

- System bars are hidden with immersive behavior.
- When bars are shown transiently, color policy is theme-aware:
  - Light theme surface: `#FFFFFF` with dark icons
  - Dark theme surface: `#201E24` with light icons

## Android 15 Compatibility

- Android 15+ path avoids deprecated direct system-window fit control during normal flow.
- Insets/controller policy handles visibility and appearance transitions.
- Pre-15 compatibility branch remains active for legacy behavior.

## Keyboard Stability Integration

`MainActivity` applies IME insets to WebView padding. This prevents keyboard slab artifacts when edge-to-edge and fullscreen states change.

## Validation Checklist

- Toggle fullscreen repeatedly and confirm no color/icon mismatch.
- Switch dark/light mode while fullscreen is on and off.
- Open keyboard in dialogs and verify no persistent blank slab remains.
- Resume app from background and confirm bars are reapplied correctly.
