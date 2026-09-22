"use client";

import { useEffect, useState } from "react";
import { getBackendApiUrls } from "@/app/lib/api";

const PRELOAD_ASSETS = ["/human_images/08_salle_machines_coudre.webp", "/navbar/logo-dark.svg"];
// Perf : splash de marque très court, JAMAIS bloqué par le réseau.
// Le préchargement CMS continue en fond (best-effort) mais la page
// s'affiche sans l'attendre.
const MAX_WAIT_MS = 900;

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function isImageValue(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.startsWith("data:")) return false;
  return (
    /uploads\//.test(value) ||
    /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(value)
  );
}

// Charge les visuels du CMS (site-contents) pour que les EditableImage
// affichent directement la bonne image, sans flash fallback -> override.
async function preloadSiteContentImages(): Promise<void> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3000);
    const response = await fetch(
      `${getBackendApiUrls()[0]}/site-contents?locale=fr`,
      { headers: { Accept: "application/json" }, signal: controller.signal },
    );
    window.clearTimeout(timer);
    if (!response.ok) return;
    const data: unknown = await response.json();
    const map =
      data && typeof data === "object" && "data" in (data as Record<string, unknown>)
        ? (data as { data?: unknown }).data
        : data;
    if (!map || typeof map !== "object") return;
    const urls = Object.values(map as Record<string, unknown>).filter(isImageValue);
    await Promise.all(urls.map(preloadImage));
  } catch {
    // Best-effort : le timeout global prend le relais.
  }
}

export function SitePreloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setFading(true);
      window.setTimeout(() => setVisible(false), 400);
    };
    // Le splash disparaît vite dans tous les cas ; les assets continuent
    // de charger en fond sans bloquer l'affichage.
    const timer = window.setTimeout(finish, MAX_WAIT_MS);
    preloadSiteContentImages();
    Promise.all(PRELOAD_ASSETS.map(preloadImage)).then(() => {
      window.clearTimeout(timer);
      finish();
    });
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-[#1e2a38] transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <img
        src="/navbar/logo-dark.svg"
        alt=""
        className="h-12 w-auto"
        draggable={false}
      />
      <div className="h-10 w-10 rounded-full border-2 border-[#EAA100]/25 border-t-[#EAA100] animate-spin" />
      <p className="text-sm tracking-widest uppercase text-[#EAA100]/80">
        Chargement…
      </p>
    </div>
  );
}
