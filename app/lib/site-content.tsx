"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authAPI, getBackendApiUrls } from "@/app/lib/api";
import { useLocale } from "@/app/components/locale-provider";

type SiteContentMap = Record<string, string>;

type SiteContentContextValue = {
  get: (key: string, fallback: string) => string;
  save: (key: string, value: string, type?: "text" | "image") => Promise<void>;
  ready: boolean;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

// Perf : 1 seule requête API / visiteur / heure au lieu d'1 par page vue.
// Avec 1000 visiteurs simultanés, ça divise la charge API par ~100.
const CACHE_TTL_MS = 60 * 60 * 1000;

function cacheKey(locale: string) {
  return `jmr_site_contents_${locale}`;
}

function readCache(locale: string): SiteContentMap | null {
  try {
    const raw = window.localStorage.getItem(cacheKey(locale));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts?: number; map?: SiteContentMap };
    if (!parsed || typeof parsed.ts !== "number" || !parsed.map) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.map;
  } catch {
    return null;
  }
}

function writeCache(locale: string, map: SiteContentMap) {
  try {
    window.localStorage.setItem(cacheKey(locale), JSON.stringify({ ts: Date.now(), map }));
  } catch {
    // Stockage plein ou indisponible : pas bloquant.
  }
}

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [overrides, setOverrides] = useState<SiteContentMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Cache local d'abord : affichage immédiat sans attendre le réseau.
    const cached = readCache(locale);
    if (cached) {
      setOverrides(cached);
      setReady(true);
    }
    // Filet de sécurité : ne jamais bloquer l'affichage si l'API traîne.
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 2500);
    fetch(`${getBackendApiUrls()[0]}/site-contents?locale=${locale}`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : {}))
      .then((data: unknown) => {
        if (cancelled || !data || typeof data !== "object") return;
        const map = (data as { data?: unknown }).data ?? data;
        if (map && typeof map === "object") {
          setOverrides(map as SiteContentMap);
          writeCache(locale, map as SiteContentMap);
        }
      })
      .catch(() => {})
      .finally(() => {
        window.clearTimeout(fallbackTimer);
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, [locale]);

  const save = useCallback(
    async (key: string, value: string, type: "text" | "image" = "text") => {
      await authAPI.put("/site-contents", { key, value, locale, type });
      setOverrides((prev) => {
        const next = { ...prev, [key]: value };
        writeCache(locale, next);
        return next;
      });
    },
    [locale],
  );

  const get = useCallback(
    (key: string, fallback: string) => overrides[key] ?? fallback,
    [overrides],
  );

  const value = useMemo(() => ({ get, save, ready }), [get, save, ready]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContentContextValue {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return context;
}
