"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { HabitStorage } from "@/lib/habit-storage";

interface ThemeContextType {
  isDark: boolean;
  isLoading: boolean;
  setIsDark: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Custom event for theme changes.
 * This allows other components/hooks to listen for theme updates
 * without prop-drilling or tight coupling to ThemeProvider.
 */
export class ThemeChangeEvent extends Event {
  public readonly isDark: boolean;

  constructor(isDark: boolean) {
    super("theme-change");
    this.isDark = isDark;
  }
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDarkState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme from settings on mount, then synchronize with DOM and apply immediately
  // This runs BEFORE children are mounted, ensuring system bars have correct theme from the start
  useEffect(() => {
    (async () => {
      try {
        const settings = await HabitStorage.getSettings();
        const darkMode = settings.darkMode;
        setIsDarkState(darkMode);
        // Apply theme immediately to prevent flash (matching boot script)
        if (darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading theme settings:", error);
        setIsInitialized(true);
      }
    })();
  }, []);

  // Handle loading state - set to false when initialized
  // This effect must be called unconditionally (before any conditional returns)
  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  // Only render children (including system bar hooks) after theme is initialized
  // This prevents system bars from applying with stale/default theme
  if (!isInitialized) {
    return null;
  }

  const setIsDark = (darkMode: boolean) => {
    setIsDarkState(darkMode);
    
    // Apply theme immediately
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Dispatch custom event so system bars and other UI can react
    if (typeof window !== "undefined") {
      window.dispatchEvent(new ThemeChangeEvent(darkMode));
    }
    
    // Save to localStorage
    (async () => {
      try {
        const currentSettings = await HabitStorage.getSettings();
        await HabitStorage.saveSettings({ ...currentSettings, darkMode });
      } catch (error) {
        console.error("Error saving theme settings:", error);
      }
    })();
  };

  return (
    <ThemeContext.Provider value={{ isDark, isLoading, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
