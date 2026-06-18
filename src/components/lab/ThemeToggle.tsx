"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "lab:theme";
const THEME_CHANGE_EVENT = "lab:theme-change";

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeToThemeUpdates(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToThemeUpdates,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;
  const label = `Switch to ${nextTheme} mode`;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        applyTheme(nextTheme);
      }}
      className="inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
