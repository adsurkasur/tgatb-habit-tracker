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
    private static boolean darkMode = false;

    // Theme-aware defaults — NO purple anywhere
    private static final String LIGHT_COLOR = "#ffffff";
    private static final String DARK_COLOR  = "#1b1a1e";

    private static String currentStatusBarColor = LIGHT_COLOR;
    private static String currentNavBarColor    = LIGHT_COLOR;

    @PluginMethod
    public void setFullscreen(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", false);
        fullscreenEnabled = enabled;

        // Accept optional theme parameters from JS
        if (call.hasOption("darkMode")) {
            darkMode = call.getBoolean("darkMode", false);
        }
        if (call.hasOption("statusBarColor")) {
            currentStatusBarColor = call.getString("statusBarColor", getDefaultColor());
        } else {
            currentStatusBarColor = getDefaultColor();
        }
        if (call.hasOption("navigationBarColor")) {
            currentNavBarColor = call.getString("navigationBarColor", getDefaultColor());
        } else {
            currentNavBarColor = getDefaultColor();
        }

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

    private static String getDefaultColor() {
        return darkMode ? DARK_COLOR : LIGHT_COLOR;
    }

    private static void applySystemUi(Activity activity) {
        final Window window = activity.getWindow();
        final View decor = window.getDecorView();
        final WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decor);

        configureEdgeToEdge(window);
        installStatusBarHeightCssVarBridge(activity, decor);
        applyColorsAndAppearance(window, controller);
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
        int statusColor = parseColor(currentStatusBarColor);
        int navColor    = parseColor(currentNavBarColor);
        applyBarColors(window, statusColor, navColor);
        applyIconAppearance(controller);
        applyLegacyIconAppearance(window);
    }

    private static int parseColor(String hex) {
        try { return Color.parseColor(hex); } catch (Exception e) { return Color.WHITE; }
    }

    private static void applyBarColors(Window window, int statusColor, int navColor) {
        try {
            if (Build.VERSION.SDK_INT >= 35) {
                // Android 15+: draw behind bars, set decor background to status bar color
                View decorView = window.getDecorView();
                decorView.setOnApplyWindowInsetsListener((view, insets) -> {
                    view.setBackgroundColor(statusColor);
                    return insets;
                });
            } else {
                window.setStatusBarColor(statusColor);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    window.setNavigationBarColor(navColor);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        window.setNavigationBarDividerColor(navColor);
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        try { window.setNavigationBarContrastEnforced(false); } catch (Throwable ignored) {}
                    }
                }
            }
        } catch (Throwable ignored) {}
    }

    private static void applyIconAppearance(WindowInsetsControllerCompat controller) {
        if (controller == null) return;
        // Dark mode = light (white) icons; Light mode = dark icons
        controller.setAppearanceLightStatusBars(!darkMode);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            controller.setAppearanceLightNavigationBars(!darkMode);
        }
    }

    private static void applyLegacyIconAppearance(Window window) {
        View decor = window.getDecorView();
        int vis = decor.getSystemUiVisibility();
        if (darkMode) {
            // Dark mode: clear light flags (white icons)
            vis &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vis &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
        } else {
            // Light mode: set light flags (dark icons)
            vis |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vis |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
        }
        decor.setSystemUiVisibility(vis);
    }
}
