# Add project specific ProGuard rules here.
# For more details, see http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# ---- Recommended additions for Android WebView ----
-keep public class android.webkit.WebView
-keep public class android.webkit.WebSettings
-keep public class android.webkit.ConsoleMessage
-keep public class android.webkit.GeolocationPermissions
-keep public class android.webkit.JsResult
-keep public class android.webkit.PermissionRequest
-keep public class android.webkit.WebChromeClient
-keep public class android.webkit.WebResourceRequest
-keep public class android.webkit.WebResourceResponse
-keep public class android.webkit.WebViewClient

# ---- Your existing rules (these are great!) ----

# Keep Capacitor bridge & plugin classes
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }

# Keep webview JS interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep names for serialization and enums
-keepclassmembers class ** implements java.io.Serializable { *; }
-keepclassmembers enum * { *; }

# --- Facebook Android SDK ProGuard rules ---
-keep class com.facebook.** { *; }
-keep class com.facebook.internal.** { *; }
-keep class com.facebook.login.** { *; }
-keep class com.facebook.CallbackManager { *; }
-keep class com.facebook.FacebookCallback { *; }
-keep class com.facebook.login.widget.LoginButton { *; }

# ---- End of file ----