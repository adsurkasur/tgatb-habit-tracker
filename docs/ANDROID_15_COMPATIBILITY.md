# Android 15+ System Bars Compatibility

## Overview

Starting with Android 15 (API level 35), directly setting `window.statusBarColor` is deprecated. This implementation provides forward-compatible system bar management using the WindowInsets API while maintaining backward compatibility.

## Implementation Strategy

### 1. **Dual API Approach**
- **Android 15+**: Uses WindowInsets API with view background colors
- **Android 14 and below**: Uses legacy `window.statusBarColor` method

### 2. **Temporary Opt-Out Fallback**
Added `android:windowOptOutEdgeToEdgeEnforcement="true"` in AndroidManifest.xml as a safety net:
- Provides immediate compatibility if WindowInsets approach fails
- Marked as temporary solution (will be deprecated in future Android versions)
- Should be removed once WindowInsets implementation is fully tested

## Code Structure

### SystemUiPlugin.java Changes

```java
// Android 15+ (API 35+)
if (Build.VERSION.SDK_INT >= 35) {
    // Use WindowInsets API
    decorView.setOnApplyWindowInsetsListener((view, insets) -> {
        view.setBackgroundColor(purple);
        Insets statusBarInsets = insets.getInsets(WindowInsetsCompat.Type.statusBars());
        view.setPadding(0, statusBarInsets.top, 0, 0);
        return insets;
    });
} else {
    // Legacy method for Android 14 and below
    window.setStatusBarColor(purple);
}
```

### AndroidManifest.xml Fallback

```xml
<application
    android:windowOptOutEdgeToEdgeEnforcement="true"
    ...>
    <activity
        android:windowOptOutEdgeToEdgeEnforcement="true"
        ...>
```

## Benefits

1. **Future-Proof**: Compatible with Android 15+ deprecation changes
2. **Backward Compatible**: Still works on older Android versions
3. **Graceful Degradation**: Fallback mechanisms prevent breaking changes
4. **Performance**: Uses modern WindowInsets API for better performance on new devices

## Migration Path

1. **Phase 1** (Current): Dual API with opt-out fallback
2. **Phase 2** (Future): Remove opt-out once WindowInsets is proven stable
3. **Phase 3** (Long-term): Remove legacy API support for older Android versions

## Testing Checklist

- [ ] Test on Android 14 and below (legacy API)
- [ ] Test on Android 15+ (WindowInsets API)
- [ ] Verify purple status bar color consistency
- [ ] Check fullscreen mode transitions
- [ ] Validate edge-to-edge layout behavior
- [ ] Test with/without opt-out enforcement

## Known Issues & Limitations

1. **WindowInsets Complexity**: More complex than simple color setting
2. **Performance Impact**: Additional view background operations
3. **Testing Requirements**: Need devices/emulators with Android 15+
4. **Temporary Opt-Out**: Will be deprecated in future Android releases

## Future Considerations

- Monitor Android 16+ changes for further API evolution
- Consider using Jetpack Compose approaches for modern UI
- Evaluate community plugin updates for automated handling
- Plan for removal of legacy API support timeline
