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

    // Revert webview background to default (transparent -> white via CSS) so content background is unchanged
    getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);

    // Respect system bars by default; plugin will adjust after JS preference
    WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
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
