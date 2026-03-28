"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { HabitStorage } from "@/lib/habit-storage";
import { UserSettings } from "@shared/schema";

interface ThemeContextType {
  isDark: boolean;
  isLoading: boolean;
  setIsDark: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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

  // Load theme from localStorage immediately on mount
  useEffect(() => {
    (async () => {
      try {
        const settings = await HabitStorage.getSettings();
        // Merge loaded settings with defaults to ensure all fields exist
        const defaults: UserSettings = {
          darkMode: false,
          language: "en",
          motivatorPersonality: "positive",
          fullscreenMode: false,
          autoSync: false,
          soundEnabled: true,
          hapticEnabled: true,
          hapticProfile: "balanced",
        };
        const mergedSettings = { ...defaults, ...settings };
        const darkMode = mergedSettings.darkMode;
        setIsDarkState(darkMode);
        // Apply theme immediately to prevent flash
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

  // Handle loading state - wait for initialization and a brief moment for smooth transition
  useEffect(() => {
    if (isInitialized) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  const setIsDark = (darkMode: boolean) => {
    setIsDarkState(darkMode);
    
    // Apply theme immediately
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Save to localStorage with defaults merged
    (async () => {
      try {
        const currentSettings = await HabitStorage.getSettings();
        // Merge with defaults to ensure all fields are preserved
        const defaults: UserSettings = {
          darkMode: false,
          language: "en",
          motivatorPersonality: "positive",
          fullscreenMode: false,
          autoSync: false,
          soundEnabled: true,
          hapticEnabled: true,
          hapticProfile: "balanced",
        };
        const mergedSettings = { ...defaults, ...currentSettings };
        await HabitStorage.saveSettings({ ...mergedSettings, darkMode });
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
