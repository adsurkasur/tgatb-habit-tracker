import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { GlobalLoadingOverlay } from "@/components/global-loading-overlay";
import { FirebaseInitializer } from "@/components/firebase-initializer";
import { CapacitorInit } from "@/components/capacitor-init";
import { MasterLoadingScreen } from "@/components/master-loading-screen";
import { AppReadyMarker } from "@/components/app-ready-marker";

export const metadata: Metadata = {
  title: "TGATB Habit Tracker",
  description: "The Good and The Bad: A minimalist habit tracking application",
  keywords: ["habits", "tracker", "productivity", "self-improvement", "goals"],
  authors: [{ name: "TGATB Team" }],
  creator: "TGATB Team",
  publisher: "TGATB Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { rel: "mask-icon", url: "/favicon.svg", color: "#6750a4" }
    ]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TGATB" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#6750a4" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#6750a4" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                // CRITICAL: Apply theme synchronously BEFORE React hydration
                // This ensures .dark class is set before first CSS paint, preventing flash
                try {
                  // Get active account from localStorage (defaults to "anonymous")
                  var activeAccount = localStorage.getItem("tgatb_active_account") || "anonymous";
                  
                  // Build scoped settings key: "user_settings::<accountId>"
                  var scopedSettingsKey = "user_settings::" + activeAccount;
                  
                  // Try scoped key first, fall back to legacy key for migration
                  var rawSettings = localStorage.getItem(scopedSettingsKey);
                  if (!rawSettings) {
                    rawSettings = localStorage.getItem("user_settings");
                  }
                  
                  // Parse and apply theme if darkMode is true
                  if (rawSettings) {
                    try {
                      var settings = JSON.parse(rawSettings);
                      if (settings && settings.darkMode === true) {
                        document.documentElement.classList.add("dark");
                      }
                      if (settings && typeof settings.language === "string" && settings.language.length > 0) {
                        document.documentElement.lang = settings.language;
                      }
                    } catch (_e) {
                      // Silent fail: if JSON parsing fails, just skip theme application
                    }
                  }
                } catch (_) {
                  // Silent fail: any error in bootstrap doesn't break the app
                }

              })();
            `,
          }}
        />
      </head>
      <body>
        <MasterLoadingScreen />
        <div id="app-shell" className="app-shell">
          <CapacitorInit />
          {/* <ServiceWorkerRegistration /> */}
          <FirebaseInitializer>
            <Providers>
              <AppReadyMarker strategy="data-ready" />
              <GlobalLoadingOverlay />
              {children}
            </Providers>
          </FirebaseInitializer>
        </div>
        {/* <OfflineToast /> */}
        {/* <AnalyticsNotice /> */}
        {/* {process.env.NODE_ENV === 'production' && <Analytics />} */}
      </body>

    </html>
  );
}
