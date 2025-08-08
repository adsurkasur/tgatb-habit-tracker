package com.tgatb.habittracker;

import android.os.Bundle;
import android.graphics.Color;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Set the web view's background color to solid white
        getBridge().getWebView().setBackgroundColor(Color.WHITE);
        
        // Only hide navigation bar, keep status bar visible
        hideNavigationBarOnly();
    }
    
    @Override
    public void onResume() {
        super.onResume();
        // Re-hide navigation bar when app resumes
        hideNavigationBarOnly();
    }
    
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            // Re-hide navigation bar when window gains focus
            hideNavigationBarOnly();
        }
    }
    
    private void hideNavigationBarOnly() {
        Window window = getWindow();
        if (window != null) {
            View decorView = window.getDecorView();
            
            // Set system UI flags to ONLY hide navigation bar, keep status bar visible
            int uiOptions = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
                    // Removed SYSTEM_UI_FLAG_FULLSCREEN to keep status bar visible
                    
            decorView.setSystemUiVisibility(uiOptions);
            
            // Don't set fullscreen flags - let Capacitor plugins handle status bar
            window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
            window.clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN);
        }
    }
}
