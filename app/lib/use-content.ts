"use client";

import { useState, useEffect, useCallback } from "react";
import { authAPI } from "./api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.jmrtextile.com/api";

export function useContent() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/content`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") setContent(data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const save = useCallback(async (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    try {
      await authAPI.put(`/content/${encodeURIComponent(key)}`, { value });
    } catch (e) {
      console.error("Failed to save content:", e);
    }
  }, []);

  return { content, save, loaded };
}
