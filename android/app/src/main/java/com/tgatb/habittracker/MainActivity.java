package com.tgatb.habittracker;

import android.os.Build;
import android.os.Bundle;
import android.graphics.Color;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register custom plugin before super so bridge picks it up
        registerPlugin(SystemUiPlugin.class);
        super.onCreate(savedInstanceState);

        // FIXED: Revert WebView background to default transparent/white
        getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);

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
