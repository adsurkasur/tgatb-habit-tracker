package com.tgatb.habittracker;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Ensure status bar doesn't overlay the content
        // This will be handled by Capacitor StatusBar plugin configuration
    }
}
