"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/app/components/locale-provider";
import { readBrowserCookie, writeBrowserCookie } from "@/app/lib";
import { parseThemeValue, THEME_COOKIE_NAME, type ThemeName } from "@/app/lib/theme";

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getPreferredTheme(): ThemeName {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = parseThemeValue(window.localStorage.getItem(THEME_COOKIE_NAME) ?? undefined);
  if (savedTheme) {
    return savedTheme;
  }

  const cookieTheme = parseThemeValue(readBrowserCookie(THEME_COOKIE_NAME));
  if (cookieTheme) {
    return cookieTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function persistTheme(theme: ThemeName) {
  window.localStorage.setItem(THEME_COOKIE_NAME, theme);
  writeBrowserCookie(THEME_COOKIE_NAME, theme, {
    maxAge: THEME_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "Lax",
  });
}

export function ThemeToggle({
  initialTheme,
  compact = false,
  onChangeExplicit,
}: {
  initialTheme: ThemeName;
  compact?: boolean;
  onChangeExplicit?: (next: ThemeName) => void;
}) {
  const { messages } = useLocale();
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);
    applyTheme(preferredTheme);
    persistTheme(preferredTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function handleToggle() {
    const nextTheme: ThemeName = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    persistTheme(nextTheme);
    onChangeExplicit?.(nextTheme);
  }

  const isLight = theme === "light";
  const className = compact ? "theme-toggle theme-toggle--compact" : "theme-toggle";

  if (!mounted) {
    return (
      <button
        type="button"
        className={className}
        aria-label={messages.theme.switchToLight}
        aria-pressed={false}
        title={messages.theme.lightMode}
        suppressHydrationWarning
      >
        <Sun className="theme-toggle__icon" aria-hidden="true" />
        {!compact ? <span className="theme-toggle__label">{messages.theme.lightShort}</span> : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={isLight ? messages.theme.switchToDark : messages.theme.switchToLight}
      aria-pressed={isLight}
      onClick={handleToggle}
      title={isLight ? messages.theme.darkMode : messages.theme.lightMode}
    >
      {isLight ? (
        <Moon className="theme-toggle__icon" aria-hidden="true" />
      ) : (
        <Sun className="theme-toggle__icon" aria-hidden="true" />
      )}
      {!compact ? (
        <span className="theme-toggle__label">
          {isLight ? messages.theme.darkShort : messages.theme.lightShort}
        </span>
      ) : null}
    </button>
  );
}
