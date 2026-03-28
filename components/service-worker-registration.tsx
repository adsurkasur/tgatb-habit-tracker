"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

type WorkboxLike = {
  addEventListener: (event: string, cb: (...args: unknown[]) => void) => void;
  register: () => void;
  messageSkipWaiting: () => void;
};

declare global {
  interface Window {
    workbox?: WorkboxLike;
  }
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Native Capacitor should not use web service workers.
    // Stale SW precache can reference old hashed chunks and break startup/hydration.
    if (Capacitor.isNativePlatform()) {
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            void registration.unregister();
          }
        });
      }
      return;
    }

    // In development, stale precache manifests commonly reference deleted chunk hashes.
    // Keep SW disabled in dev to avoid noisy 404/install failures and ensure HMR correctness.
    if (process.env.NODE_ENV !== "production") {
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            void registration.unregister();
          }
        });
      }
      return;
    }

    if ('serviceWorker' in navigator) {
      // Try Workbox registration first
      if (window.workbox) {
        registerServiceWorkerWorkbox(window.workbox);
      } else {
        // Fallback: register /sw.js directly
        navigator.serviceWorker.register('/sw.js')
          .then(reg => {
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  }
                });
              }
            });
          })
          .catch(() => {
          });
      }
    } else {
    }
  }, []);

  return null;
}

function registerServiceWorkerWorkbox(wb: WorkboxLike): void {
  const promptNewVersionAvailable = () => {
    const shouldUpdate = confirm("A newer version of this web app is available, reload to update?");
    if (shouldUpdate) {
      handleServiceWorkerUpdate(wb);
    }
  };
  wb.addEventListener('waiting', promptNewVersionAvailable);
  wb.addEventListener('externalwaiting', promptNewVersionAvailable);
  wb.register();
}

function handleServiceWorkerUpdate(workbox: WorkboxLike): void {
  workbox.addEventListener('controlling', () => {
    window.location.reload();
  });
  workbox.messageSkipWaiting();
}

export default ServiceWorkerRegistration;
