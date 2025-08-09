package com.tgatb.habittracker;

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
        if (SystemUiPlugin.isFullscreenEnabled()) {
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        } else {
            WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
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
        if (SystemUiPlugin.isFullscreenEnabled()) {
            // Perform WebView back navigation directly without exiting immersive first
            if (getBridge() != null && getBridge().getWebView().canGoBack()) {
                getBridge().getWebView().goBack();
            } else {
                // Mimic existing JS logic: exit app if no back stack
                moveTaskToBack(true);
            }
            SystemUiPlugin.reapply(this);
            return; // consume
        }
        super.onBackPressed();
    }
}
