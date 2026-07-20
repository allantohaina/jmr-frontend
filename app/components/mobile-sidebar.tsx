"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  {
    label: "Accueil",
    href: "/#accueil",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 21V9l8-6 8 6v12"/><path d="M9 21v-8h6v8"/></svg>,
  },
  {
    label: "Nos services",
    href: "/#nos-services",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 9l1-5h16l1 5"/><path d="M3 9a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0"/><path d="M5 9v10h14V9"/></svg>,
  },
  {
    label: "A propos",
    href: "/#a-propos",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2 1.7-2 3.5"/><circle cx="12" cy="16.5" r=".3"/></svg>,
  },
  {
    label: "Espace client",
    href: "/mon-profil",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>,
  },
  {
    label: "Francais",
    href: "#",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z"/></svg>,
  },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const dragging = useRef(false);

  const openSidebar = useCallback(() => setOpen(true), []);
  const closeSidebar = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, closeSidebar]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const EDGE_ZONE = 30;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      if (touchStartX.current <= EDGE_ZONE || open) {
        dragging.current = true;
        el.style.transition = "none";
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      touchCurrentX.current = e.touches[0].clientX;
      const delta = touchCurrentX.current - touchStartX.current;
      const w = Math.min(el.offsetWidth, 300);

      if (open) {
        el.style.transform = `translateX(${Math.min(0, delta)}px)`;
      } else {
        el.style.transform = `translateX(${Math.min(0, delta - w)}px)`;
      }
    };

    const onTouchEnd = () => {
      if (!dragging.current) return;
      dragging.current = false;
      el.style.transition = "";
      const delta = touchCurrentX.current - touchStartX.current;
      if (open && delta < -60) setOpen(false);
      else if (!open && delta > 60) setOpen(true);
      touchStartX.current = 0;
      touchCurrentX.current = 0;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [open]);

  return (
    <>
      {/* Edge grip */}
      <div className="md:hidden fixed top-1/2 -translate-y-1/2 left-0 w-[5px] h-16 rounded-r-md z-30 pointer-events-none" style={{ background: "rgba(232,168,56,.35)" }} />

      {/* Overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/45" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "78%", maxWidth: "300px", background: "#26323f", borderRadius: "0 26px 26px 0", padding: "26px 22px" }}
      >
        {/* Brand + close */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-[22px] tracking-wide" style={{ fontFamily: "'Impact','Arial Black',sans-serif", color: "#e8a838" }}>
            JMR TEXTILE
          </span>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0 text-base"
            style={{ background: "rgba(255,255,255,.06)", color: "#e8a838" }}
            onClick={closeSidebar}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={closeSidebar}
              className="flex items-center gap-3.5 px-[14px] py-[13px] rounded-xl text-sm font-semibold no-underline text-[#b9c1cb] hover:bg-white/5 active:bg-white/5"
            >
              <span className="w-[18px] h-[18px] shrink-0">{item.svg}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="mt-4 rounded-2xl p-4" style={{ background: "linear-gradient(160deg,#e8a838,#c68522)" }}>
          <b className="block text-[13px] mb-1" style={{ color: "#1c2733" }}>Demander un devis</b>
          <p className="text-[11px] opacity-85 mb-2.5 leading-relaxed" style={{ color: "#1c2733" }}>
            Prototype ou petite serie, obtenez une reponse sous 24h.
          </p>
          <Link
            href="/demande-devis"
            onClick={closeSidebar}
            className="block w-full text-center py-[9px] rounded-lg text-[11.5px] font-bold tracking-wide cursor-pointer no-underline"
            style={{ background: "#1c2733", color: "#e8a838" }}
          >
            Demander un devis
          </Link>
        </div>
      </div>

      {/* Burger button */}
      <div className="md:hidden fixed top-4 right-5 z-30">
        <button
          className="w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer border-0"
          style={{ background: "#26323f" }}
          onClick={openSidebar}
          aria-label="Ouvrir le menu"
        >
          <span className="block w-[18px] h-[2px] rounded-sm" style={{ background: "#e8a838" }} />
          <span className="block w-[18px] h-[2px] rounded-sm" style={{ background: "#e8a838" }} />
          <span className="block w-[18px] h-[2px] rounded-sm" style={{ background: "#e8a838" }} />
        </button>
      </div>
    </>
  );
}
