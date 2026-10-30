
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-9 w-9"
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() =>
        setTheme(isDark ? "light" : "dark")
      }
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        isDark ? "Light mode" : "Dark mode"
      }
      className="
        flex h-9 w-9 items-center justify-center
        border border-border bg-surface
        text-foreground transition-colors
        duration-200 hover:bg-surface-muted
      "
    >
      {isDark ? (
        <Sun size={17} strokeWidth={1.6} />
      ) : (
        <Moon size={17} strokeWidth={1.6} />
      )}
    </button>
  );
}
