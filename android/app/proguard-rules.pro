# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# ---- Project specific additions (Capacitor / WebView / Reflection) ----

# Keep Capacitor bridge & plugin classes (reflection-based discovery)
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }

# Keep webview JS interface methods if any added dynamically
-keepclassmembers class * {
	@android.webkit.JavascriptInterface <methods>;
}

# Keep names for serialization (if using JSON to map model classes)
-keepclassmembers class ** implements java.io.Serializable { *; }

# Avoid stripping enums used via name()
-keepclassmembers enum * { *; }

# (Optional) Remove logging in release to reduce size (uncomment if desired)
# --- Facebook Android SDK ProGuard rules ---
# Official rules from https://developers.facebook.com/docs/android/getting-started/#proguard-keep-rules
-keep class com.facebook.** { *; }
-keep class com.facebook.internal.** { *; }
-keep class com.facebook.login.** { *; }
-keep class com.facebook.CallbackManager { *; }
-keep class com.facebook.FacebookCallback { *; }
-keep class com.facebook.login.widget.LoginButton { *; }
#-assumenosideeffects class android.util.Log { *; }

# ---- End additions ----
