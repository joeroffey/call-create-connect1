package com.lovable.callcreateconnect;

import android.os.Bundle;
import android.view.Window;
import androidx.core.content.ContextCompat;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Keyboard;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable edge-to-edge so content can draw under the status bar
        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // Match status-bar color to primaryDark for a native look
        window.setStatusBarColor(ContextCompat.getColor(this, R.color.colorPrimaryDark));

        // Ensure navigation bar also matches brand color (optional)
        window.setNavigationBarColor(ContextCompat.getColor(this, R.color.colorPrimaryDark));

        // Dynamically apply bottom padding equal to keyboard height
        Keyboard kb = getBridge().getKeyboard();
        kb.setKeyboardResizeListener((height, isOpen) -> {
            String js = "document.body.style.paddingBottom='" + (isOpen ? height : 0) + "px'";
            getBridge().executeJavaScript(js);
        });
    }
}