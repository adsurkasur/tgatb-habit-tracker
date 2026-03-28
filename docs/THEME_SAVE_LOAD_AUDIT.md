# Theme Save & Load Audit Report

**Date**: 2026-03-28  
**Audit Focus**: Why theme is not saving and loading correctly on cold start  
**Status**: Critical issue identified

---

## 🎯 Problem Statement

Theme setting is not persisting or loading correctly on cold start:
- App always starts in light mode
- Previously saved dark mode setting is not applied before first render
- Theme flashing (white-to-dark transition) visible on cold start even if user's setting is dark

---

## 📊 Complete Flow Analysis

### 1. SAVING FLOW (User toggles dark mode)

```
User toggles dark mode toggle in AppearanceSettings
    ↓
onUpdateSettings({ darkMode: true }) called
    ↓
home-page.tsx: updateSettings(newSettings)
    ↓
hooks/use-habits.ts:updateSettings()
    ├─ setSettings(updatedSettings) — updates React state
    ├─ HabitStorage.saveSettings(updatedSettings) — ASYNC call
    │  ├─ lib/habit-storage.ts:saveSettings()
    │  │  └─ platform-storage.ts:saveSettings()
    │  │     └─ PlatformStorage.setItem(settingsKey(), JSON.stringify(settings))
    │  │        ├─ On native: @capacitor/preferences.set({ key, value })
    │  │        └─ On web: localStorage.setItem(key, value)
    │  │           └─ Key is: "user_settings::<activeAccountId>"
    │  │           └─ Value is: '{"darkMode":true,"language":"en",...}'
    └─ DOM class update
       └─ document.documentElement.classList.add("dark") ✓

✅ SAVE WORKS CORRECTLY — Settings are persisted to storage with scoped key
```

---

### 2. LOADING FLOW (On cold start)

#### **Phase 1: HTML Document Loads (BEFORE React Hydrates)**

```
<html> tag loads
    ↓
app/layout.tsx <head>:
    ├─ Basic meta tags, favicons
    ├─ 🚨 Missing: Synchronous theme bootstrap script
    │  (No script reading localStorage and applying .dark class)
    │
    └─ <script dangerouslySetInnerHTML>
       ├─ Adds DOMContentLoaded listener
       ├─ Waits for DOMContentLoaded (app already rendered by then)
       └─ Adds document.body.app-loaded class
       └─ 🚨 Does NOT read or apply theme

Result: HTML renders with <html> (NO .dark class), light mode CSS applies
```

#### **Phase 2: React Hydrates (FIRST RENDER)**

```
Providers component loads
    ↓
ThemeProvider mounts:
    ├─ useState(isDark: false) ← INITIAL STATE
    │
    └─ useEffect runs:
       ├─ Calls HabitStorage.getSettings() ← ASYNC
       │  ├─ lib/habit-storage.ts:getSettings()
       │  │  └─ platform-storage.ts:getSettings()
       │  │     └─ PlatformStorage.getItem(settingsKey()) ← ASYNC
       │  │        ├─ Resolves scoped key: "user_settings::<activeAccountId>"
       │  │        ├─ Reads from localStorage (or Preferences on native)
       │  │        └─ Returns '{"darkMode":true,...}'
       │  │
       │  └─ Result received (after 0-50ms typically)
       │
       ├─ setIsDarkState(true) ← Updates state
       │
       └─ document.documentElement.classList.add("dark") ← TRIES to apply
          │
          └─ 🚨 TOO LATE: Browser already rendered CSS for light mode
             in Phase 1. Applying .dark now causes a FLASH.

home-page.tsx runs:
    ├─ useHabits() loads settings
    │  └─ Eventually calls setSettings(loadedSettings)
    │
    └─ setIsDark(settings.darkMode) ← Another state update

content-wrapper.tsx:
    ├─ Applies opacity transition
    └─ 🚨 User sees white content flickering to dark

Result: VISIBLE FLASH OF LIGHT MODE before dark mode applies (~50-300ms delay)
```

---

## 🔍 Root Causes Identified

### **Cause 1: Missing Synchronous Bootstrap Script**
**Severity**: HIGH  
**Location**: `app/layout.tsx` (lines 60-69)

**Current Code**:
```typescript
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function () {
        document.addEventListener("DOMContentLoaded", function () {
          try {
            if (document.body && !document.body.classList.contains("app-loaded")) {
              document.body.classList.add("app-loaded");
            }
          } catch (_) {}
        });
      })();
    `,
  }}
/>
```

**Problem**:
- Only adds `app-loaded` class AFTER DOMContentLoaded
- Does NOT read or apply theme from localStorage BEFORE React renders
- Waits for async storage, but should read synchronously from localStorage instead

**Impact**:
- Theme class not applied before first render
- HTML renders as `<html>` (light mode) instead of `<html class="dark">` (dark mode)
- Browser paints light mode, then JavaScript adds dark mode → visible flash

---

### **Cause 2: Async Theme Loading in ThemeProvider**
**Severity**: HIGH  
**Location**: `components/theme-provider.tsx` (lines 32-43)

**Current Code**:
```typescript
useEffect(() => {
  (async () => {
    try {
      const settings = await HabitStorage.getSettings();
      const darkMode = settings.darkMode;
      setIsDarkState(darkMode);
      // Apply theme immediately to prevent flash
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading theme settings:", error);
      setIsInitialized(true);
    }
  })();
}, []);
```

**Problem**:
- `HabitStorage.getSettings()` is async (awaits PlatformStorage.getItem)
- But React has already rendered by the time this effect runs
- Applying `.dark` class here is redundant after initial render

**Impact**:
- Doesn't prevent initial light-mode render
- ThemeProvider state flashes from false → true after async load

---

### **Cause 3: Race Between Bootstrap and Settings Key Generation**
**Severity**: MEDIUM  
**Location**: `lib/account-scope.ts` (getActiveAccountId logic)

**Flow**:
```
Cold start:
  1. HTML loads, bootstrap script tries to read local storage
  2. getActiveAccountId() called: checks localStorage.getItem("tgatb_active_account")
  3. If not found, returns "anonymous"
  4. settingsKey() = "user_settings::anonymous"
  5. Reads localStorage["user_settings::anonymous"]
  6. ✓ Should work if user was previously "anonymous"
  
But if user logs in:
  1. accountId from auth not yet available in bootstrap script
  2. Bootstrap uses "anonymous" scope
  3. Reads wrong settings (anonymous instead of user's account)
  4. 🚨 Loads wrong theme!
```

**Impact**:
- Bootstrap script (if added) might read settings from wrong account scope
- Authenticated users might see anonymous user's theme

---

## ✅ Verification Checklist

| Check | Status | Evidence |
| --- | --- | --- |
| Settings save to localStorage? | ✅ WORKS | `updateSettings()` calls `HabitStorage.saveSettings()` async |
| Settings use scoped keys? | ✅ WORKS | `settingsKey()` returns `"user_settings::accountId"` |
| Scoped key logic correct? | ✅ WORKS | Calls `scopedKey()` which uses `getActiveAccountId()` |
| Theme applies on React render? | ❌ FAILS | `ThemeProvider` useEffect is async, applies after first render |
| Bootstrap script reads theme? | ❌ MISSING | No synchronous theme read before React hydration |
| Bootstrap script applies .dark? | ❌ MISSING | Would need to read localStorage and apply class |
| Theme persists across navigation? | ✅ WORKS | Settings object passed through Redux/state |
| Theme saved when toggled? | ✅ WORKS | `updateSettings()` triggers async save |

---

## 🔧 Why the Old "Failing" Approach Broke

The previous attempt to fix this added a bootstrap script that tried to:
1. Read localStorage synchronously ✓
2. Parse JSON ✓
3. Apply `.dark` class ✓
4. Call `Capacitor.Plugins.SystemUi.setSystemUiState()` — **This was the problem!**

**Why it failed**:
- Capacitor plugins are not available until AFTER `CapacitorInit` component loads
- Bootstrap runs in `<head>`, BEFORE CapacitorInit in `<body>`
- Plugin call throws error → breaks entire bootstrap
- With unhandled error, `.dark` class never gets applied
- With error, native system bar code tries to run but plugin unavailable

---

## 🎯 Recommended Fix (No Breaking Changes)

### **Option 1: Minimal Synchronous Bootstrap (Recommended)**

Add a **simple, synchronous** bootstrap script that:
1. Runs IMMEDIATELY (not waiting for DOMContentLoaded)
2. Reads localStorage synchronously
3. Parses scoped key format
4. Applies `.dark` class if darkMode is true
5. Does NOT call any Capacitor plugins

**Advantages**:
- No plugins involved, zero dependency on Capacitor timing
- Runs in `<head>` before React hydrates
- Instantly applies correct theme class before first render
- Theme is correct by first paint, no flash

**Disadvantages**:
- Must read entire localStorage to find correct scoped key
- Must handle both "user_settings" (legacy) and "user_settings::accountId" formats
- Won't update if account changes without page reload (but page reloads on auth anyway)

---

### **Option 2: Server-Side Rendering (Complex)**

Use Next.js cookies or headers to determine theme server-side:
1. Store theme in HTTP-only cookie (in addition to localStorage)
2. Read cookie in layout Metadata or SSR
3. Set data attribute on HTML element during RSC render
4. CSS reads data attribute for theme

**Advantages**:
- Cleanest solution, no bootstrap script
- Works across page reloads
- Works before JavaScript loads

**Disadvantages**:
- Requires cookie management
- Requires server-side code
- More complex implementation
- Adds latency to read cookies on every request

---

## 📋 Implementation Plan

**Phase 1: Add Synchronous Bootstrap** (15 min, low risk)
1. Enhance `app/layout.tsx` bootstrap script
2. Add synchronous localStorage read before React hydrates
3. Parse scoped key format (handle both "user_settings" and "user_settings::accountId")
4. Apply `.dark` class if darkMode is true
5. Wrap in try-catch to prevent breaking app

**Phase 2: Verify No Regressions** (10 min)
1. TypeScript check: `npm run check`
2. Lint check: `npm run lint`
3. Build: `npm run android:build`
4. Compile: `android/gradlew.bat assembleDebug`

**Phase 3: Test on Device** (manual)
1. Clear app data
2. Toggle dark mode
3. Force-quit app
4. Reopen app → should start in correct theme with no flash

---

## 🚨 Key Insights

1. **Settings ARE saving correctly** — verified in storage flow
2. **Problem is loading, not saving** — no bootstrap to read before first render
3. **Account scope works correctly** — scoped keys are deterministic
4. **The old fix broke because** — it tried to call Capacitor plugins too early
5. **The new approach should** — only read localStorage, no plugin calls

---

## Files to Modify

| File | Purpose | Change Type |
| --- | --- | --- |
| `app/layout.tsx` | Bootstrap script | Enhancement (add synchronous read) |
| (No other files need changes) | | |

---

## Expected Outcome

✅ **Before Fix**: Theme flashes from light → dark on cold start  
✅ **After Fix**: Correct theme applied before first render, no flash

---

**End of Audit**
