"use client";

import { useEffect, useState } from "react";

const PRELOAD_ASSETS = ["/sunset.jpg", "/navbar/logo-light.svg"];
const MAX_WAIT_MS = 4000;

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
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
      window.setTimeout(() => setVisible(false), 500);
    };
    const timer = window.setTimeout(finish, MAX_WAIT_MS);
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
        src="/navbar/logo-light.svg"
        alt=""
        className="h-12 w-auto"
        draggable={false}
      />
      <div className="h-10 w-10 rounded-full border-2 border-[#FFB42D]/25 border-t-[#FFB42D] animate-spin" />
      <p className="text-sm tracking-widest uppercase text-[#FFB42D]/80">
        Chargement…
      </p>
    </div>
  );
}
