
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<
  ThemeContextValue | undefined
>(undefined);

const STORAGE_KEY = "lionplan-theme";

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>("light");

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(
      STORAGE_KEY
    );

    const initialTheme: Theme =
      saved === "dark" ? "dark" : "light";

    // Initialize theme from the saved preference.
    // The default remains light.
    document.documentElement.classList.toggle(
      "dark",
      initialTheme === "dark"
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initialTheme);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );

    window.localStorage.setItem(
      STORAGE_KEY,
      nextTheme
    );
  }

  function toggleTheme() {
    setTheme(
      theme === "light" ? "dark" : "light"
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider"
    );
  }

  return context;
}
