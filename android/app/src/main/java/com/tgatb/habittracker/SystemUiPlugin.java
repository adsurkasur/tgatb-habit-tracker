package com.tgatb.habittracker;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.core.view.ViewCompat;
import androidx.core.graphics.Insets;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name = "SystemUi")
public class SystemUiPlugin extends Plugin {
    private static boolean fullscreenEnabled = false;
    private static final String PURPLE = "#6750A4"; // match web constant

    @PluginMethod
    public void setFullscreen(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", false);
        fullscreenEnabled = enabled;
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> applySystemUi(activity));
        }
        JSObject ret = new JSObject();
        ret.put("enabled", fullscreenEnabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void getFullscreen(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("enabled", fullscreenEnabled);
        call.resolve(ret);
    }

    public static void reapply(Activity activity) {
        if (activity == null) return;
        activity.runOnUiThread(() -> applySystemUi(activity));
    }

    public static boolean isFullscreenEnabled() { return fullscreenEnabled; }

    private static void applySystemUi(Activity activity) {
        final Window window = activity.getWindow();
        final View decor = window.getDecorView();
        final WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decor);

        // CRITICAL FIX: Use proper window insets handling instead of edge-to-edge conflicts
        if (fullscreenEnabled) {
            // For fullscreen, allow edge-to-edge layout
            WindowCompat.setDecorFitsSystemWindows(window, false);
        } else {
            // For normal mode, let system handle window insets properly
            WindowCompat.setDecorFitsSystemWindows(window, true);
        }

        // Capture insets and expose status bar height to web via CSS var
        ViewCompat.setOnApplyWindowInsetsListener(decor, (v, insets) -> {
            Insets sb = insets.getInsets(WindowInsetsCompat.Type.statusBars());
            int top = sb.top;
            try {
                if (activity instanceof com.getcapacitor.BridgeActivity) {
                    ((com.getcapacitor.BridgeActivity) activity).getBridge().getWebView()
                        .post(() -> ((com.getcapacitor.BridgeActivity) activity).getBridge().getWebView()
                            .evaluateJavascript("document.documentElement.style.setProperty('--status-bar-height', '"+top+"px')", null));
                }
            } catch (Throwable ignored) {}
            return insets;
        });

        // Always recolor bars & icons BEFORE showing/hiding
        applyColorsAndAppearance(window, controller);

        if (controller != null) {
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        }

        if (fullscreenEnabled) {
            // IMPROVED: Hide both status and navigation bars with proper behavior
            if (controller != null) {
                controller.hide(WindowInsetsCompat.Type.statusBars());
                // Also hide navigation bar for true fullscreen experience
                controller.hide(WindowInsetsCompat.Type.navigationBars());
            }
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
                // Legacy fullscreen for older Android versions
                int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                        View.SYSTEM_UI_FLAG_FULLSCREEN |
                        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                        View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
                decor.setSystemUiVisibility(flags);
            }
            // Add listener to re-hide bars if they appear during fullscreen
            decor.setOnSystemUiVisibilityChangeListener(visibility -> {
                if (!fullscreenEnabled) return;
                boolean statusVisible = (visibility & View.SYSTEM_UI_FLAG_FULLSCREEN) == 0;
                boolean navVisible = (visibility & View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) == 0;
                if ((statusVisible || navVisible) && controller != null) {
                    // Re-hide with delay to prevent fight with system
                    decor.postDelayed(() -> {
                        if (fullscreenEnabled && controller != null) {
                            controller.hide(WindowInsetsCompat.Type.statusBars());
                            controller.hide(WindowInsetsCompat.Type.navigationBars());
                        }
                    }, 1000);
                }
            });
        } else {
            // Show both status and navigation bars
            if (controller != null) {
                controller.show(WindowInsetsCompat.Type.statusBars());
                controller.show(WindowInsetsCompat.Type.navigationBars());
            }
            decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
            decor.setOnSystemUiVisibilityChangeListener(null);
        }
    }

    private static void applyColorsAndAppearance(Window window, WindowInsetsControllerCompat controller) {
        try {
            int purple = Color.parseColor(PURPLE);
            
            // ANDROID 15+ COMPATIBILITY: Use WindowInsets API instead of deprecated window.statusBarColor
            if (Build.VERSION.SDK_INT >= 35) { // Android 15+ (API 35)
                // RESTORE: Use an insets listener ONLY to paint background (no padding)
                // This reliably gives us a solid purple status bar without doubling height.
                View decorView = window.getDecorView();
                decorView.setOnApplyWindowInsetsListener((view, insets) -> {
                    view.setBackgroundColor(purple); // paint full root background
                    return insets; // do NOT modify or add padding
                });

                try { window.setStatusBarColor(purple); } catch (Throwable ignored) {}
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    window.setNavigationBarColor(purple);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        window.setNavigationBarDividerColor(purple);
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        try { window.setNavigationBarContrastEnforced(false); } catch (Throwable ignored) {}
                    }
                }
            } else {
                // For Android 14 and below - use legacy method
                window.setStatusBarColor(purple);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    window.setNavigationBarColor(purple);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        window.setNavigationBarDividerColor(purple);
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        try { window.setNavigationBarContrastEnforced(false); } catch (Throwable ignored) {}
                    }
                }
            }
        } catch (Exception ignored) {}
        
        if (controller != null) {
            // Force white icons (light content) by disabling light appearance flags
            controller.setAppearanceLightStatusBars(false);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                controller.setAppearanceLightNavigationBars(false);
            }
        }

        // Also clear legacy LIGHT flags directly on decor view where applicable (< API 30 effect)
        View decor = window.getDecorView();
        int vis = decor.getSystemUiVisibility();
        vis &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR; // ensure dark icons flag removed
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vis &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        decor.setSystemUiVisibility(vis);
    }
}
