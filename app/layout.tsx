import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import "../global.d";
import "./globals.css";
import { Providers } from "./providers";
import { GlobalLoadingOverlay } from "@/components/global-loading-overlay";
import { FirebaseInitializer } from "@/components/firebase-initializer";
import { CapacitorInit } from "@/components/capacitor-init";

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
        <meta name="theme-color" content="#6750a4" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.svg" />
        {/* <script dangerouslySetInnerHTML={{__html:`window.onerror = ...`}} /> */}
      </head>
      <body>
        <CapacitorInit />
        {/* <ServiceWorkerRegistration /> */}
        <FirebaseInitializer>
          <Providers>
            <GlobalLoadingOverlay />
            {children}
          </Providers>
        </FirebaseInitializer>
        {/* <OfflineToast /> */}
        {/* <AnalyticsNotice /> */}
        {/* {process.env.NODE_ENV === 'production' && <Analytics />} */}
      </body>

    </html>
  );
}
