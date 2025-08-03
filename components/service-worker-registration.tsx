"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    workbox?: any;
  }
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!isServiceWorkerSupported()) {
      return;
    }

    registerServiceWorker();
  }, []);

  return null;
}

function isServiceWorkerSupported(): boolean {
  const isClient = typeof window !== 'undefined';
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasWorkbox = window.workbox !== undefined;

  return isClient && hasServiceWorker && hasWorkbox;
}

function registerServiceWorker(): void {
  const wb = window.workbox;
  
  const promptNewVersionAvailable = () => {
    const shouldUpdate = confirm("A newer version of this web app is available, reload to update?");
    if (shouldUpdate) {
      handleServiceWorkerUpdate(wb);
    }
  };
  
  wb.addEventListener('waiting', promptNewVersionAvailable);
  wb.addEventListener('externalwaiting', promptNewVersionAvailable);

  // Register the service worker
  wb.register();
}

function handleServiceWorkerUpdate(workbox: any): void {
  workbox.addEventListener('controlling', () => {
    window.location.reload();
  });
  
  // Send a message to the waiting service worker to skip waiting
  workbox.messageSkipWaiting();
}

export default ServiceWorkerRegistration;
