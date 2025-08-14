"use client";

import { useEffect } from "react";

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
    if ('serviceWorker' in navigator) {
      // Try Workbox registration first
      if (window.workbox) {
  // ...existing code...
        registerServiceWorkerWorkbox(window.workbox);
      } else {
        // Fallback: register /sw.js directly
  // ...existing code...
        navigator.serviceWorker.register('/sw.js')
          .then(reg => {
            // ...existing code...
            reg.addEventListener('updatefound', () => {
              // ...existing code...
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // ...existing code...
                  }
                });
              }
            });
          })
          .catch(() => {
            // ...existing code...
          });
      }
    } else {
  // ...existing code...
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
