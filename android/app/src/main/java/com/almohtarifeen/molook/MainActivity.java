package com.almohtarifeen.molook;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView web;
    private static final String UI_URL = "https://raw.githubusercontent.com/yzano86-a11y/almohtarifeen/main/index.html";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setWebViewClient(new WebViewClient());
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        web.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        setContentView(web);
        web.loadUrl(UI_URL);
    }
    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
