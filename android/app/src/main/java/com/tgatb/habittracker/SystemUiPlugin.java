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
    private static boolean darkModeEnabled = false;
    private static final String PURPLE = "#6750A4"; // match web constant
    private static final String LIGHT_SURFACE = "#FFFFFF";
    private static final String DARK_SURFACE = "#1B1A1E";

    @PluginMethod
    public void setFullscreen(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", false);
        boolean darkMode = call.getBoolean("darkMode", darkModeEnabled);
        fullscreenEnabled = enabled;
        darkModeEnabled = darkMode;
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> applySystemUi(activity));
        }
        JSObject ret = new JSObject();
        ret.put("enabled", fullscreenEnabled);
        ret.put("darkMode", darkModeEnabled);
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
        // Fullscreen with theme, or non-fullscreen with purple
        int barColor;
        boolean useDarkIcons;
        
        if (fullscreenEnabled) {
            // Fullscreen mode: use theme-aware colors
            barColor = darkModeEnabled ? parseColor(DARK_SURFACE) : parseColor(LIGHT_SURFACE);
            useDarkIcons = !darkModeEnabled; // light theme = dark icons, dark theme = light icons
        } else {
            // Non-fullscreen mode: use purple
            barColor = parseColor(PURPLE);
            useDarkIcons = false; // purple background = light icons
        }
        
        applyBarColors(window, barColor);
        applyIconAppearance(controller, useDarkIcons);
        setLegacyLightFlags(window, useDarkIcons);
    }

    private static int parseColor(String color) {
        try { return Color.parseColor(color); } catch (Exception e) { return Color.BLACK; }
    }

    private static void applyBarColors(Window window, int purple) {
        try {
            if (Build.VERSION.SDK_INT >= 35) { // Android 15+
                applyColorsAndroid15Plus(window, purple);
            } else {
                applyColorsLegacy(window, purple);
            }
        } catch (Throwable ignored) {}
    }

    private static void applyColorsAndroid15Plus(Window window, int purple) {
        View decorView = window.getDecorView();
        decorView.setOnApplyWindowInsetsListener((view, insets) -> {
            // Android 15+ recommends drawing behind status/navigation bars instead of directly setting their colors.
            view.setBackgroundColor(purple);
            return insets;
        });

        // Keep appearance policy but avoid deprecated direct color APIs on 35+.
        // Legacy colors are handled in applyColorsLegacy below for older Android versions.
    }

    private static void applyColorsLegacy(Window window, int purple) {
        window.setStatusBarColor(purple);
        tintNavBars(window, purple, false);
    }

    private static void tintNavBars(Window window, int purple, boolean enforceContrast) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setNavigationBarColor(purple);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                window.setNavigationBarDividerColor(purple);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                try { window.setNavigationBarContrastEnforced(enforceContrast); } catch (Throwable ignored) {}
            }
        }
    }

    private static void applyIconAppearance(WindowInsetsControllerCompat controller, boolean useDarkIcons) {
        if (controller == null) return;
        // If useDarkIcons=true: set light appearance (dark icons on light background)
        // If useDarkIcons=false: set dark appearance (light icons on dark background)
        controller.setAppearanceLightStatusBars(useDarkIcons);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            controller.setAppearanceLightNavigationBars(useDarkIcons);
        }
    }

    private static void setLegacyLightFlags(Window window, boolean useDarkIcons) {
        View decor = window.getDecorView();
        int vis = decor.getSystemUiVisibility();
        if (useDarkIcons) {
            vis |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        } else {
            vis &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (useDarkIcons) {
                vis |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            } else {
                vis &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
        }
        decor.setSystemUiVisibility(vis);
    }
}
