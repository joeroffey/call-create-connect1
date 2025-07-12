package com.eezybuild.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.view.WindowManager;
import android.graphics.Color;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register additional plugins if needed
        registerPlugin(NativeOptimizationPlugin.class);
        
        // Native Android optimizations
        setupNativeOptimizations();
    }
    
    private void setupNativeOptimizations() {
        // Enable hardware acceleration
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );
        
        // Set status bar color to match app theme
        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(Color.BLACK);
        
        // Optimize WebView for performance
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            // Enable DOM storage
            webView.getSettings().setDomStorageEnabled(true);
            
            // Enable database storage
            webView.getSettings().setDatabaseEnabled(true);
            
            // Enable app cache
            webView.getSettings().setAppCacheEnabled(true);
            
            // Set cache mode for better performance
            webView.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_DEFAULT);
            
            // Enable mixed content for HTTPS
            webView.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
            
            // Optimize for mobile
            webView.getSettings().setUseWideViewPort(true);
            webView.getSettings().setLoadWithOverviewMode(true);
            
            // Enable zoom controls
            webView.getSettings().setBuiltInZoomControls(true);
            webView.getSettings().setDisplayZoomControls(false);
            
            // Enable JavaScript interface optimizations
            webView.getSettings().setJavaScriptEnabled(true);
            webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
            
            // Set user agent for better compatibility
            String userAgent = webView.getSettings().getUserAgentString();
            webView.getSettings().setUserAgentString(userAgent + " EezyBuild/1.0 Android");
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // Handle app resume optimizations
        handleAppResume();
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        // Handle app pause optimizations
        handleAppPause();
    }
    
    private void handleAppResume() {
        // Clear any background restrictions
        // Optimize for foreground performance
    }
    
    private void handleAppPause() {
        // Optimize for background mode
        // Reduce resource usage
    }
}