package com.tgatb.habittracker;

import android.os.Build;
import android.os.Bundle;
import android.graphics.Color;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String PREFS_NAME = "tgatb_boot_state";
    private static final String PREF_LAST_VERSION_CODE = "last_version_code";
    private int baseWebViewPaddingLeft = 0;
    private int baseWebViewPaddingTop = 0;
    private int baseWebViewPaddingRight = 0;
    private int baseWebViewPaddingBottom = 0;
    private boolean imeInsetsInstalled = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register custom plugin before super so bridge picks it up
        registerPlugin(SystemUiPlugin.class);
        registerPlugin(PremiumHapticsPlugin.class);
        super.onCreate(savedInstanceState);

        // FIXED: Revert WebView background to default transparent/white
        getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);
        clearWebViewCacheOnAppUpgrade();
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        // IMPROVED: Proper window insets handling based on fullscreen state
        if (Build.VERSION.SDK_INT < 35) {
            if (SystemUiPlugin.isFullscreenEnabled()) {
                WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            } else {
                WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
            }
        } else {
            // Android 15+ is edge-to-edge by default; avoid deprecated API call.
        }
        SystemUiPlugin.reapply(this);
        installImeInsetsForWebView();
        refreshImeInsets();
    }

    private void installImeInsetsForWebView() {
        if (getBridge() == null || getBridge().getWebView() == null || imeInsetsInstalled) {
            return;
        }

        final WebView webView = getBridge().getWebView();

        baseWebViewPaddingLeft = webView.getPaddingLeft();
        baseWebViewPaddingTop = webView.getPaddingTop();
        baseWebViewPaddingRight = webView.getPaddingRight();
        baseWebViewPaddingBottom = webView.getPaddingBottom();

        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, insets) -> {
            final Insets imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime());
            final Insets systemBarInsets = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            final boolean imeVisible = insets.isVisible(WindowInsetsCompat.Type.ime());

            final int imeExtraBottom = imeVisible
                    ? Math.max(0, imeInsets.bottom - systemBarInsets.bottom)
                    : 0;

            view.setPadding(
                    baseWebViewPaddingLeft,
                    baseWebViewPaddingTop,
                    baseWebViewPaddingRight,
                    baseWebViewPaddingBottom + imeExtraBottom
            );

            return insets;
        });

        imeInsetsInstalled = true;
        ViewCompat.requestApplyInsets(webView);
    }

    private void refreshImeInsets() {
        if (getBridge() == null || getBridge().getWebView() == null) {
            return;
        }
        ViewCompat.requestApplyInsets(getBridge().getWebView());
    }

    private void clearWebViewCacheOnAppUpgrade() {
        try {
            PackageManager packageManager = getPackageManager();
            PackageInfo packageInfo = packageManager.getPackageInfo(getPackageName(), 0);
            long currentVersionCode = packageInfo.getLongVersionCode();

            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            long lastVersionCode = prefs.getLong(PREF_LAST_VERSION_CODE, -1L);

            if (lastVersionCode != currentVersionCode) {
                getBridge().getWebView().clearCache(true);
                getBridge().getWebView().clearHistory();
                prefs.edit().putLong(PREF_LAST_VERSION_CODE, currentVersionCode).apply();
            }
        } catch (Exception ignored) {
            // Non-fatal: app startup should continue even if cache clear check fails.
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        SystemUiPlugin.reapply(this);
        refreshImeInsets();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            SystemUiPlugin.reapply(this);
            refreshImeInsets();
        }
    }

 // Let back press navigate directly; immersive sticky prevents bars from intercepting

    @Override
    public void onBackPressed() {
        // FIXED: Always delegate to Capacitor's back button handling
        // This ensures the JS-side "press again to exit" logic works in all modes
        super.onBackPressed();
    }
}
