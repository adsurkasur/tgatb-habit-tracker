package com.tgatb.habittracker;

import android.os.Bundle;
import android.graphics.Color;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set the web view's background color to solid white
        getBridge().getWebView().setBackgroundColor(Color.WHITE);

    // Default: respect system bars; content fits system windows
    WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    // Keep current theme color for navigation bar (styles.xml) or leave as-is
    // getWindow().setNavigationBarColor(Color.TRANSPARENT); // optional; rely on theme
    }

    @Override
    public void onResume() {
        super.onResume();
    // No-op: respect system navigation bar; immersive handled in JS via plugins
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
    // No-op: respect system navigation bar
    }
}
