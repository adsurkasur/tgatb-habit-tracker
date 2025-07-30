"use client";

import { useTheme } from "./theme-provider";
import { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
}

export function ContentWrapper({ children }: ContentWrapperProps) {
  const { isLoading } = useTheme();

  return (
    <div className={`min-h-screen transition-opacity duration-500 ease-out ${
      isLoading 
        ? 'opacity-0 pointer-events-none' 
        : 'opacity-100'
    }`}>
      {children}
    </div>
  );
}
