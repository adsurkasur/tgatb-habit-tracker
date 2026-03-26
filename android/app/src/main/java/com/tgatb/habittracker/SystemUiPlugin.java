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
    private static String themeColor = "#FFFFFF"; // Light mode default
    private static boolean isDarkTheme = false;
    private static final String PURPLE = "#6750A4"; // Legacy fallback

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
    public void setThemeColor(PluginCall call) {
        String color = call.getString("color", "#FFFFFF");
        boolean isDark = call.getBoolean("isDark", false);
        themeColor = color;
        isDarkTheme = isDark;
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> applySystemUi(activity));
        }
        JSObject ret = new JSObject();
        ret.put("color", themeColor);
        ret.put("isDark", isDarkTheme);
        call.resolve(ret);
    }

    @PluginMethod
    public void getFullscreen(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("enabled", fullscreenEnabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void getThemeColor(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("color", themeColor);
        ret.put("isDark", isDarkTheme);
        call.resolve(ret);
    }

    public static void reapply(Activity activity) {
        if (activity == null) return;
        activity.runOnUiThread(() -> applySystemUi(activity));
    }

    public static boolean isFullscreenEnabled() { return fullscreenEnabled; }

    public static String getThemeColor() { return themeColor; }

    public static boolean isDarkTheme() { return isDarkTheme; }

    private static void applySystemUi(Activity activity) {
        final Window window = activity.getWindow();
        final View decor = window.getDecorView();
        final WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decor);

        configureEdgeToEdge(window);
        installStatusBarHeightCssVarBridge(activity, decor);
        applyColorsAndAppearance(window, controller); // recolor first
        configureControllerBehavior(controller);

        if (fullscreenEnabled) {
            enterFullscreen(decor, controller);
        } else {
            exitFullscreen(decor, controller);
        }
    }

    private static void configureEdgeToEdge(Window window) {
        if (Build.VERSION.SDK_INT < 35) {
            WindowCompat.setDecorFitsSystemWindows(window, !fullscreenEnabled);
        } else {
            // Android 15+ defaults to edge-to-edge; avoid using deprecated setDecorFitsSystemWindows.
            // Keep fullscreen semantics via insets and controller behavior.
        }
    }

    private static void installStatusBarHeightCssVarBridge(Activity activity, View decor) {
        ViewCompat.setOnApplyWindowInsetsListener(decor, (v, insets) -> {
            Insets sb = insets.getInsets(WindowInsetsCompat.Type.statusBars());
            int top = sb.top;
            try {
                if (activity instanceof com.getcapacitor.BridgeActivity) {
                    ((com.getcapacitor.BridgeActivity) activity).getBridge().getWebView().post(() ->
                        ((com.getcapacitor.BridgeActivity) activity).getBridge().getWebView()
                            .evaluateJavascript("document.documentElement.style.setProperty('--status-bar-height', '" + top + "px')", null)
                    );
                }
            } catch (Throwable ignored) {}
            return insets;
        });
    }

    private static void configureControllerBehavior(WindowInsetsControllerCompat controller) {
        if (controller != null) {
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        }
    }

    private static void enterFullscreen(View decor, WindowInsetsControllerCompat controller) {
        if (controller != null) {
            controller.hide(WindowInsetsCompat.Type.statusBars());
            controller.hide(WindowInsetsCompat.Type.navigationBars());
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
            decor.setSystemUiVisibility(flags);
        }
        addRehideListener(decor, controller);
    }

    private static void addRehideListener(View decor, WindowInsetsControllerCompat controller) {
        decor.setOnSystemUiVisibilityChangeListener(visibility -> {
            if (!fullscreenEnabled) return;
            boolean statusVisible = (visibility & View.SYSTEM_UI_FLAG_FULLSCREEN) == 0;
            boolean navVisible = (visibility & View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) == 0;
            boolean needsRehide = (statusVisible || navVisible) && controller != null;
            if (needsRehide) {
                decor.postDelayed(() -> {
                    if (fullscreenEnabled) {
                        controller.hide(WindowInsetsCompat.Type.statusBars());
                        controller.hide(WindowInsetsCompat.Type.navigationBars());
                    }
                }, 1000);
            }
        });
    }

    private static void exitFullscreen(View decor, WindowInsetsControllerCompat controller) {
        if (controller != null) {
            controller.show(WindowInsetsCompat.Type.statusBars());
            controller.show(WindowInsetsCompat.Type.navigationBars());
        }
        decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        decor.setOnSystemUiVisibilityChangeListener(null);
    }

    private static void applyColorsAndAppearance(Window window, WindowInsetsControllerCompat controller) {
        // Don't apply colors in fullscreen mode
        if (fullscreenEnabled) return;

        int barColor = parseThemeColor();
        applyBarColors(window, barColor);
        applyIconAppearance(controller, isDarkTheme);
        clearLegacyLightFlags(window);
    }

    private static int parseThemeColor() {
        try { return Color.parseColor(themeColor); } catch (Exception e) { return Color.parseColor(PURPLE); }
    }

    private static void applyBarColors(Window window, int barColor) {
        try {
            if (Build.VERSION.SDK_INT >= 35) { // Android 15+
                applyColorsAndroid15Plus(window, barColor);
            } else {
                applyColorsLegacy(window, barColor);
            }
        } catch (Throwable ignored) {}
    }

    private static void applyColorsAndroid15Plus(Window window, int barColor) {
        View decorView = window.getDecorView();
        decorView.setOnApplyWindowInsetsListener((view, insets) -> {
            // Android 15+ recommends drawing behind status/navigation bars instead of directly setting their colors.
            view.setBackgroundColor(barColor);
            return insets;
        });

        // Keep appearance policy but avoid deprecated direct color APIs on 35+.
        // Legacy colors are handled in applyColorsLegacy below for older Android versions.
    }

    private static void applyColorsLegacy(Window window, int barColor) {
        window.setStatusBarColor(barColor);
        tintNavBars(window, barColor, false);
    }

    private static void tintNavBars(Window window, int barColor, boolean enforceContrast) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setNavigationBarColor(barColor);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                window.setNavigationBarDividerColor(barColor);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                try { window.setNavigationBarContrastEnforced(enforceContrast); } catch (Throwable ignored) {}
            }
        }
    }

    /**
     * Apply icon appearance based on theme
     * isDark = true: light icons for dark bars
     * isDark = false: dark icons for light bars
     */
    private static void applyIconAppearance(WindowInsetsControllerCompat controller, boolean isDark) {
        if (controller == null) return;
        // setAppearanceLightStatusBars(true) = show dark icons (for light background)
        // setAppearanceLightStatusBars(false) = show light icons (for dark background)
        controller.setAppearanceLightStatusBars(!isDark);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            controller.setAppearanceLightNavigationBars(!isDark);
        }
    }

    private static void clearLegacyLightFlags(Window window) {
        View decor = window.getDecorView();
        int vis = decor.getSystemUiVisibility();
        vis &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vis &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        decor.setSystemUiVisibility(vis);
    }
}
