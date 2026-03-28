# Standardized Save/Load Pattern for Critical Startup Values

**Date**: 2026-03-28  
**Purpose**: Document and standardize how critical values (theme, language, etc.) are saved and loaded  
**Related Modules**: `lib/storage-sync-utils.ts`, `app/layout.tsx`

---

## Problem This Solves

When critical values depend on async storage reads, you get UI flashing:

```
1. User sets dark mode → saved to localStorage ✓
2. App cold starts → HTML renders with light mode CSS
3. React hydrates → loads theme async
4. Theme applies → browser repaints dark mode
5. Result: visible flash ❌
```

The standardized pattern fixes this by:
- Reading values **synchronously** in `<head>` before any rendering
- Applying them **before first paint**
- Then loading **asynchronously** for full validation during React initialization

---

## The Dual-Path Pattern

All critical startup values follow this flow:

### **Path 1: Synchronous Bootstrap (in `<head>`)**

```typescript
// Runs BEFORE React, BEFORE first paint
const settings = syncReadLocalStorage("user_settings", { darkMode: false });
if (settings.darkMode) {
  document.documentElement.classList.add("dark");
}
```

**Constraints**:
- Must be **synchronous** (no async/await)
- Must run in **`<head>` script** before body renders
- Must handle **scoped keys** (account namespacing)
- Must have **silent failures** (don't crash if storage fails)
- Must handle **legacy keys** (for data migration)

### **Path 2: Async React Initialization (in useEffect)**

```typescript
// Runs AFTER React mounts
useEffect(() => {
  (async () => {
    const settings = await HabitStorage.getSettings();
    setIsDark(settings.darkMode);
    // Full validation, error logging, etc.
  })();
}, []);
```

**Advantages**:
- Access to async storage (Capacitor Preferences, IndexedDB, etc.)
- Proper error handling and logging
- Can validate against schema
- Can trigger additional initialization

---

## Implementation Checklist

### For Theme (Already Implemented)

✅ **1. Bootstrap Script in `app/layout.tsx`**
```typescript
syncReadLocalStorage("user_settings", { darkMode: false });
// Apply to DOM before React renders
document.documentElement.classList.add("dark");
```

✅ **2. React Initialization in `ThemeProvider`**
```typescript
useEffect(() => {
  const settings = await HabitStorage.getSettings();
  setIsDark(settings.darkMode);
}, []);
```

✅ **3. Saving in `AppearanceSettings`**
```typescript
await HabitStorage.saveSettings({ ...settings, darkMode });
```

---

## How to Apply This Pattern to Other Values

### **Example: Language/Locale Setting**

If language needs to be applied before i18n initialization:

#### **Step 1: Add Bootstrap Read**

In `app/layout.tsx` head script:
```typescript
const settings = syncReadLocalStorage("user_settings", { language: "en" });
document.documentElement.setAttribute("lang", settings.language);
```

#### **Step 2: Add Async Validation**

In i18n initialization or React hook:
```typescript
const settings = await HabitStorage.getSettings();
if (settings.language !== syncLanguage) {
  // Language was updated, reinitialize i18n
  await initializeI18n(settings.language);
}
```

#### **Step 3: Add Saving**

In `LanguageSettings` or `AppearanceSettings`:
```typescript
await HabitStorage.saveSettings({ ...settings, language: nextLanguage });
```

---

## Key Design Principles

### **1. Silent Failures on Bootstrap**
```typescript
try {
  const value = syncReadLocalStorage("key", fallback);
  // If error: returns fallback, doesn't crash
} catch (_) {
  // Don't log errors in bootstrap — they're expected and handled
}
```

**Why?** Bootstrap runs before console/debugging are available. Errors must not break startup.

### **2. Scoped Keys**
```typescript
// ✅ CORRECT: Uses account scope
const key = `user_settings::${getActiveAccountId()}`;

// ❌ WRONG: Hard-coded key, loses user isolation
const key = "user_settings";
```

**Why?** Each account should have separate settings. Scoped keys prevent mixing data.

### **3. Legacy Key Fallback**
```typescript
// Try scoped key first
let rawValue = localStorage.getItem(scopedKey);
// Fall back to legacy key if not found
if (!rawValue) {
  rawValue = localStorage.getItem("user_settings");
}
```

**Why?** Old data might use unscoped keys. Fallback ensures migration compatibility.

### **4. Type Safety**
```typescript
// ✅ CORRECT: Typed generic
export function syncReadLocalStorage<T>(
  baseKey: string,
  fallbackValue: T,
): T {
  // Type-safe returns T
}

// ❌ WRONG: Any type, no validation
function readStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
```

**Why?** TypeScript catches missing fields at compile time, not runtime.

---

## Complete Example: Adding a New Critical Value

Let's say we want to add "reducedMotion" preference:

### **Step 1: Define in Schema**
```typescript
// shared/schema.ts
export interface UserSettings {
  // ... existing fields ...
  reducedMotion?: boolean; // New field
}

export const defaultSettings = (): UserSettings => ({
  // ... existing defaults ...
  reducedMotion: false,
});
```

### **Step 2: Add Bootstrap Script**
```typescript
// app/layout.tsx <head> script
const settings = syncReadLocalStorage("user_settings", { reducedMotion: false });
if (settings.reducedMotion) {
  document.documentElement.classList.add("reduced-motion");
}
```

### **Step 3: Update CSS**
```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  html {
    --motion-duration: 0.01ms;
  }
}

html.reduced-motion {
  --motion-duration: 0.01ms;
}

/* All transitions use this variable */
.fade-in {
  animation: fadeIn var(--motion-duration) ease-in;
}
```

### **Step 4: Add React Validation**
```typescript
// In a useEffect that validates startup values
useEffect(() => {
  (async () => {
    const settings = await HabitStorage.getSettings();
    
    // Update if different from bootstrap value
    const bootstrapValue = syncReadLocalStorage("user_settings", {}).reducedMotion;
    if (settings.reducedMotion !== bootstrapValue) {
      document.documentElement.classList.toggle("reduced-motion", settings.reducedMotion);
    }
  })();
}, []);
```

### **Step 5: Add Settings UI**
```typescript
// components/settings/appearance-settings.tsx
<SwitchToggle
  label="Reduce Motion"
  checked={settings.reducedMotion}
  onCheckedChange={(checked) => {
    onUpdateSettings({ reducedMotion: checked });
    // Saving handled by parent
  }}
/>
```

### **Step 6: Add to STORAGE_OPERATIONS**
```typescript
// lib/storage-sync-utils.ts
export const STORAGE_OPERATIONS = {
  // ... existing ...
  reducedMotion: {
    key: 'user_settings',
    scope: 'account',
    critical: true,
    bootstrap: true,
    fallback: { reducedMotion: false },
    description: 'Reduced motion / accessibility preference',
  },
};
```

---

## Testing the Pattern

### **Test 1: Cold Start with Dark Mode**
1. Set dark mode in app settings
2. Force quit app (kill process)
3. Reopen app
4. **Expected**: App should start dark with no flash
5. **Verify**: `.dark` class on `<html>` before React paints

### **Test 2: Cold Start with Light Mode**
1. Set light mode in app settings
2. Force quit app
3. Reopen app
4. **Expected**: App should start light with no flash

### **Test 3: Account Switch**
1. Log in as User A (dark mode)
2. Log out
3. Log in as User B (light mode)
4. **Expected**: Each user's theme applies immediately

### **Test 4: Cache Clearing**
1. Clear app cache/localStorage
2. Reopen app
3. **Expected**: Defaults to light mode (no crash)

---

## Files Using This Pattern

| File | Purpose | Pattern |
| --- | --- | --- |
| `app/layout.tsx` | Bootstrap script | Sync read + DOM application |
| `components/theme-provider.tsx` | React initialization | Async validation |
| `components/settings/appearance-settings.tsx` | User preferences | Saving with validation |
| `lib/storage-sync-utils.ts` | Utilities | Reusable sync/async functions |

---

## Anti-Patterns to Avoid

### ❌ **Hard-Coded Keys (No Scoping)**
```typescript
// WRONG: Loses account isolation
localStorage.getItem("user_settings");
```

### ❌ **Async on Startup**
```typescript
// WRONG: Waits for async, causes flash
const settings = await HabitStorage.getSettings(); // In <head>
```

### ❌ **No Error Handling**
```typescript
// WRONG: Crashes if JSON is invalid
const settings = JSON.parse(localStorage.getItem("key"));
```

### ❌ **No Legacy Support**
```typescript
// WRONG: Loses data during migration
const settings = localStorage.getItem(scopedKey); // No fallback
```

### ❌ **Mixing Sync and Async**
```typescript
// WRONG: Confusing dual initialization
const sync = syncRead();
const async = await asyncRead();
// Which one to use?
```

---

## Future Standardization Opportunities

These values could use the same pattern:

- [ ] **Language/Locale** — Apply before i18n initialization
- [ ] **Reduced Motion** — Apply before animations render
- [ ] **Color Scheme Override** — Apply before color loading
- [ ] **Font Size** — Apply before layout calculation
- [ ] **Notification Settings** — Apply before requesting permissions

---

## Troubleshooting

### **Theme Still Flashing?**
1. Verify bootstrap script runs before `</head>`
2. Check that `.dark` class is added to `document.documentElement`, not just `document.body`
3. Ensure localStorage key matches actual key being used
4. Check browser DevTools → Elements → `<html>` should have `class="dark"` on startup

### **Wrong Theme on Account Switch?**
1. Verify `getActiveAccountId()` returns new account ID
2. Check that `settingsKey()` creates scoped key with new account
3. Verify localStorage contains settings under new scoped key
4. Clear browser cache if keys don't match

### **Errors Not Showing?**
1. Bootstrap script intentionally swallows errors (check console for warnings only)
2. Check React useEffect for proper error logging
3. Use DevTools → Network tab to verify storage calls complete

---

## Summary

The standardized pattern ensures:

✅ **No UI Flash** — Theme applied before first paint  
✅ **Account Isolation** — Scoped keys prevent data mixing  
✅ **Graceful Fallbacks** — Defaults to sensible values on error  
✅ **Type Safety** — TypeScript validates all values  
✅ **Reusability** — Same pattern applies to any critical value  
✅ **Backward Compatibility** — Supports legacy data migration  

**Apply this pattern whenever a value needs to be:**
- Applied before React renders (critical timing)
- Loaded from persistent storage (critical data)
- Updated via user preferences (critical behavior)

---

**End of Documentation**
