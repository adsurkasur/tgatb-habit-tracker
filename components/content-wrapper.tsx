"use client";

import { useTheme } from "./theme-provider";
import { ReactNode, useSyncExternalStore } from "react";

interface ContentWrapperProps {
  children: ReactNode;
}

export function ContentWrapper({ children }: ContentWrapperProps) {
  const { isLoading } = useTheme();
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const hideDuringThemeLoading = hasHydrated && isLoading;

  return (
    <div className={`min-h-screen transition-all duration-200 ease-out ${
      hideDuringThemeLoading
        ? 'opacity-0 pointer-events-none' 
        : 'opacity-100'
    }`}>
      {children}
    </div>
  );
}
