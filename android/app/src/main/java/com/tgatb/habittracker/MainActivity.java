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

        // Set the web view's background color to solid white
        getBridge().getWebView().setBackgroundColor(Color.WHITE);

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

 @Override
 public void onBackPressed() {
     super.onBackPressed();
     // Reapply immersive after back navigation to avoid bars sticking
     SystemUiPlugin.reapply(this);
    }
}
