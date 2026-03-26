"use client";

import { useEffect } from "react";

export function AppReadyMarker() {
  useEffect(() => {
    document.body.classList.add("app-loaded");
  }, []);

  return null;
}
