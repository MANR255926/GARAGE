"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * ThemeProvider
 * - Zero-FOUC: an inline blocking script in layout.tsx sets .dark on <html>
 *   before first paint. This component merely keeps React state in sync.
 * - Persists manual overrides to localStorage under key "ag-theme".
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  // On mount, read what the blocking script already applied to <html>
  useEffect(() => {
    const saved = localStorage.getItem("ag-theme") as Theme | null;
    if (saved === "dark" || saved === "light") {
      setThemeState(saved);
    } else {
      // Reflect system preference that the blocking script already applied
      const applied = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
      setThemeState(applied);
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("ag-theme", t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
