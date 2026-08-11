"use client";

import { useLocale } from "./locale-provider";
import { ThemeToggle } from "./theme-toggle";
import { writeBrowserCookie } from "@/app/lib";
import { LOCALE_COOKIE_NAME } from "@/app/lib/locale";
import type { Locale } from "@/app/lib/locale";

export function AuthBar({ initialTheme }: { initialTheme: string }) {
  const { locale, setLocale } = useLocale();

  function toggleLocale() {
    const next: Locale = locale === "fr" ? "en" : "fr";
    setLocale(next);
    writeBrowserCookie(LOCALE_COOKIE_NAME, next, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "Lax",
    });
  }

  return (
    <div style={{
      position: "fixed",
      top: 16,
      right: 16,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      <button
        onClick={toggleLocale}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid rgba(229,173,70,0.25)",
          background: "rgba(229,173,70,0.08)",
          color: "#e5ad46",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: 1,
        }}
      >
        {locale === "fr" ? "EN" : "FR"}
      </button>
      <ThemeToggle initialTheme={initialTheme as any} compact />
    </div>
  );
}
