"use client";

import { useState, useEffect, useCallback } from "react";
import { authAPI, getBackendApiUrls } from "./api";

export type SiteContent = Record<string, string>;
export const SITE_CONTENT_PREVIEW_KEY = "jmr_site_content_preview";

export async function fetchSiteContent(): Promise<SiteContent> {
  const response = await fetch(`${getBackendApiUrls()[0]}/content`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Impossible de charger le contenu du site.");
  const data: unknown = await response.json();
  return data && typeof data === "object" ? data as SiteContent : {};
}

export function useContent() {
  const [content, setContent] = useState<SiteContent>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).has("contentPreview");
    const readPreview = () => {
      try {
        const raw = window.localStorage.getItem(SITE_CONTENT_PREVIEW_KEY);
        return raw ? JSON.parse(raw) as SiteContent : {};
      } catch { return {}; }
    };
    const apply = (saved: SiteContent) => setContent(preview ? { ...saved, ...readPreview() } : saved);
    fetchSiteContent()
      .then(apply)
      .catch(() => {})
      .finally(() => setLoaded(true));
    if (preview) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === SITE_CONTENT_PREVIEW_KEY) setContent((saved) => ({ ...saved, ...readPreview() }));
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
  }, []);

  const save = useCallback(async (key: string, value: string) => {
    const previousValue = content[key];
    setContent((prev) => ({ ...prev, [key]: value }));
    try {
      await authAPI.put(`/content/${encodeURIComponent(key)}`, { value });
    } catch (e) {
      setContent((prev) => {
        if (previousValue === undefined) {
          const { [key]: _discarded, ...rest } = prev;
          return rest;
        }
        return { ...prev, [key]: previousValue };
      });
      console.error("Failed to save content:", e);
      throw e;
    }
  }, [content]);

  return { content, save, loaded, refresh: () => fetchSiteContent().then(setContent) };
}
