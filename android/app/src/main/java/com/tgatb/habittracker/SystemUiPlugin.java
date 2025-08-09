package com.tgatb.habittracker;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

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

        // Always apply our brand colors & icon styles first so any transient reveal is themed.
        applyColorsAndAppearance(window, controller);

        if (fullscreenEnabled) {
            WindowCompat.setDecorFitsSystemWindows(window, false);
            if (controller != null) {
                // Use modern API for immersive when available
                controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                controller.hide(WindowInsetsCompat.Type.systemBars());
            }

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
                // Fallback legacy flags for older devices
                int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
                decor.setSystemUiVisibility(flags);
            } else {
                // Clear legacy flags that could conflict
                decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
            }

            // Listener (legacy APIs) to keep immersive after system attempts to reveal on BACK.
            decor.setOnSystemUiVisibilityChangeListener(visibility -> {
                if (!fullscreenEnabled) return;
                // If either status or nav bar became visible (flags cleared) re-hide via controller
                boolean statusVisible = (visibility & View.SYSTEM_UI_FLAG_FULLSCREEN) == 0;
                boolean navVisible = (visibility & View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) == 0;
                if ((statusVisible || navVisible) && controller != null) {
                    controller.hide(WindowInsetsCompat.Type.systemBars());
                }
            });
        } else {
            if (controller != null) {
                controller.show(WindowInsetsCompat.Type.systemBars());
            }
            WindowCompat.setDecorFitsSystemWindows(window, true);
            // Ensure no stale legacy immersive flags remain
            decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
            decor.setOnSystemUiVisibilityChangeListener(null);
        }
    }

    private static void applyColorsAndAppearance(Window window, WindowInsetsControllerCompat controller) {
        try {
            int purple = Color.parseColor(PURPLE);
            window.setStatusBarColor(purple);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                window.setNavigationBarColor(purple);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    // Optional: unify divider
                    window.setNavigationBarDividerColor(purple);
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    try { window.setNavigationBarContrastEnforced(false); } catch (Throwable ignored) {}
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
