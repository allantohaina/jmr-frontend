"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/app/lib/auth";
import { authAPI } from "@/app/lib/api";

export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(getUser()?.role === "admin");
  }, []);
  return isAdmin;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Fichier non supporté : choisissez une image.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image trop lourde (max 5 Mo).";
  }
  return null;
}

/** Nom de fichier dans uploads/site/ ou null si image par défaut / externe. */
export function siteUploadFilename(url: string): string | null {
  const marker = "uploads/site/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const filename = url.slice(idx + marker.length).split(/[?#]/)[0];
  if (!filename || filename.includes("/") || filename.includes("\\")) return null;
  return filename;
}

/**
 * Suppression best-effort de l'ancien média remplacé, via l'API
 * authentifiée (le fetch direct sans token échouait en 401).
 */
export async function deleteOldSiteMedia(url: string): Promise<void> {
  const filename = siteUploadFilename(url);
  if (!filename) return;
  try {
    await authAPI.post("/admin/media/delete", { filename });
  } catch {
    // Best-effort : l'upload a déjà réussi, on ne bloque pas l'UI.
  }
}
