"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authAPI, getBackendApiUrls } from "@/app/lib/api";
import { useLocale } from "@/app/components/locale-provider";

type SiteContentMap = Record<string, string>;

type SiteContentContextValue = {
  get: (key: string, fallback: string) => string;
  save: (key: string, value: string, type?: "text" | "image") => Promise<void>;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [overrides, setOverrides] = useState<SiteContentMap>({});

  useEffect(() => {
    let cancelled = false;
    fetch(`${getBackendApiUrls()[0]}/site-contents?locale=${locale}`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : {}))
      .then((data: unknown) => {
        if (cancelled || !data || typeof data !== "object") return;
        const map = (data as { data?: unknown }).data ?? data;
        if (map && typeof map === "object") {
          setOverrides(map as SiteContentMap);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const save = useCallback(
    async (key: string, value: string, type: "text" | "image" = "text") => {
      await authAPI.put("/site-contents", { key, value, locale, type });
      setOverrides((prev) => ({ ...prev, [key]: value }));
    },
    [locale],
  );

  const get = useCallback(
    (key: string, fallback: string) => overrides[key] ?? fallback,
    [overrides],
  );

  const value = useMemo(() => ({ get, save }), [get, save]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContentContextValue {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return context;
}
