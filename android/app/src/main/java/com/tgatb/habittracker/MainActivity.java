package com.tgatb.habittracker;

import android.os.Build;
import android.os.Bundle;
import android.graphics.Color;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String PREFS_NAME = "tgatb_boot_state";
    private static final String PREF_LAST_VERSION_CODE = "last_version_code";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register custom plugin before super so bridge picks it up
        registerPlugin(SystemUiPlugin.class);
        registerPlugin(PremiumHapticsPlugin.class);
        super.onCreate(savedInstanceState);

        // FIXED: Revert WebView background to default transparent/white
        getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);
        clearWebViewCacheOnAppUpgrade();

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

        // Force pan mode to avoid WebView resize gaps/slabs above IME on some OEM builds.
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
        SystemUiPlugin.reapply(this);
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
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
     if (hasFocus) SystemUiPlugin.reapply(this);
 }

 // Let back press navigate directly; immersive sticky prevents bars from intercepting

    @Override
    public void onBackPressed() {
        // FIXED: Always delegate to Capacitor's back button handling
        // This ensures the JS-side "press again to exit" logic works in all modes
        super.onBackPressed();
    }
}
