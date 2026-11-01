
"use client";

import { Moon, Sun } from "lucide-react";

import {
  useTheme,
} from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const {
    theme,
    toggleTheme,
    mounted,
  } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label={
        theme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
      title={
        theme === "light"
          ? "Dark mode"
          : "Light mode"
      }
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted disabled:opacity-50"
    >
      {!mounted ? (
        <span className="h-4 w-4" />
      ) : theme === "light" ? (
        <Moon size={17} />
      ) : (
        <Sun size={17} />
      )}
    </button>
  );
}
