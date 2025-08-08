"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { HabitStorage } from "@/lib/habit-storage";

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
        const darkMode = settings.darkMode;
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

  // Additional effect to ensure rendering is complete
  useEffect(() => {
    if (!isLoading) {
      // Mark rendering as complete
      document.body.classList.add('app-loaded');
    }
  }, [isLoading]);

  const setIsDark = (darkMode: boolean) => {
    setIsDarkState(darkMode);
    
    // Apply theme immediately
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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
