package com.tgatb.habittracker;

import android.os.Bundle;
import android.graphics.Color;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Set the web view's background color to solid white
        getBridge().getWebView().setBackgroundColor(Color.WHITE);
    }
}
