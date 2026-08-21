"use client";

import { useState, useEffect, useCallback } from "react";
import { authAPI, getBackendApiUrls } from "./api";

export type SiteContent = Record<string, string>;

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
    fetchSiteContent()
      .then(setContent)
      .catch(() => {})
      .finally(() => setLoaded(true));
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
