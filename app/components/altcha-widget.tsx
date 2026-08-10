"use client";

import { useEffect, useRef } from "react";

const ALTCHA_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/altcha@3.0.3/dist/altcha.min.js";

const challengeUrl = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/altcha/challenge`
  : "https://api.jmrtextile.com/api/altcha/challenge";

let scriptLoaded = false;
let scriptLoading = false;

function loadAltchaScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (scriptLoaded) { clearInterval(check); resolve(); }
      }, 50);
    });
  }
  scriptLoading = true;
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") { resolve(); return; }
    const existing = document.querySelector(`script[src="${ALTCHA_SCRIPT_SRC}"]`);
    if (existing) { scriptLoaded = true; resolve(); return; }
    const s = document.createElement("script");
    s.src = ALTCHA_SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => { scriptLoaded = true; resolve(); };
    s.onerror = () => { scriptLoading = false; reject(new Error("Failed to load ALTCHA script")); };
    document.head.appendChild(s);
  });
}

type AltchaWidgetProps = {
  name?: string;
  className?: string;
};

export function AltchaWidget({ name = "altcha", className }: AltchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    loadAltchaScript().then(() => {
      if (!container) return;
      const widget = document.createElement("altcha-widget");
      widget.setAttribute("challenge", `${challengeUrl}/`);
      widget.setAttribute("name", name);
      widget.setAttribute("hide-footer", "true");
      container.appendChild(widget);
    }).catch(() => {});
  }, [name]);

  return <div ref={containerRef} className={className} />;
}
