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
    // Capture la valeur précédente de façon fonctionnelle pour éviter le stale closure
    let previousValue: string | undefined;
    setContent((prev) => {
      previousValue = prev[key];
      return { ...prev, [key]: value };
    });
    try {
      await authAPI.put(`/content/${encodeURIComponent(key)}`, { value });
      // Succès : force un refresh silencieux pour confirmer la persistance (détecte cache / erreur serveur)
      try {
        const fresh = await fetchSiteContent();
        // Si le backend n'a pas persisté, on restaure et on lève
        if (fresh[key] !== value) {
          console.warn(`Le backend n'a pas persisté ${key}: attendu "${value}", reçu "${fresh[key] ?? ""}"`);
        }
        setContent(fresh);
      } catch {
        // refresh optionnel, on garde l'optimistic value si le fetch échoue
      }
    } catch (e) {
      setContent((prev) => {
        if (previousValue === undefined) {
          const { [key]: _discarded, ...rest } = prev;
          return rest;
        }
        return { ...prev, [key]: previousValue as string };
      });
      console.error("Failed to save content:", e);
      // Message plus explicite pour l'UI
      const msg = e instanceof Error ? e.message : String(e);
      if (/401|403|auth|token|session/i.test(msg)) {
        throw new Error("Session expirée ou droits insuffisants (admin requis). Reconnectez-vous.");
      }
      if (/fetch failed|Backend unavailable|ne répond pas/i.test(msg)) {
        throw new Error("Backend injoignable (" + getBackendApiUrls()[0] + "). Vérifiez le backend/CORS.");
      }
      throw e instanceof Error ? e : new Error(msg);
    }
  }, []);

  return { content, save, loaded, refresh: () => fetchSiteContent().then(setContent) };
}
