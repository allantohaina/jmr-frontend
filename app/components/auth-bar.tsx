"use client";

import { useLocale } from "./locale-provider";
import { writeBrowserCookie } from "@/app/lib";
import { LOCALE_COOKIE_NAME } from "@/app/lib/locale";
import type { Locale } from "@/app/lib/locale";

export function AuthBar() {
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
          border: "1px solid rgba(245, 166, 35,0.25)",
          background: "rgba(245, 166, 35,0.08)",
          color: "#F5A623",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: 1,
        }}
      >
        {locale === "fr" ? "EN" : "FR"}
      </button>
    </div>
  );
}
