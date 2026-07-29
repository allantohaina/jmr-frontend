"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const DRAWER_LINKS = [
  { href: "#", icon: "dashboard", label: "Dashboard" },
  { href: "#", icon: "grid_view", label: "New collections" },
  { href: "#", icon: "chat_bubble", label: "Comments" },
  { href: "#", icon: "calendar_month", label: "Calendar" },
  { href: "#", icon: "star", label: "Editor's picks" },
];

export function SideDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClose?.(); } }} aria-label="Fermer" />
      <div
        ref={drawerRef}
        className={`relative w-4/5 max-w-sm h-full bg-surface-container-low shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4 text-on-surface-variant"
          onClick={onClose}
          aria-label="Fermer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="p-8 pt-12 flex flex-col gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary bg-surface-variant">
            <Image
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCImqOMFkBcqvKnIShyfjJNDUf5eWmsQfKQjbt026nIxaazgS05BuYg5QUQCg1tPjPwVSsOYnD8ByPsOb1F4zaFGAUWFzX5Xlo_glhVY7QbQCw9MPAS0nZVq6ZkWJReqlGfmSY4UsZuJQpl7zmigOI-Kg3dkbFkZWQEUWIy40Vl3u4p2AnicZJPlM0X-ZoOa_hkMjGVbKx5xRUEq4mwA_vW2PdidxlRmt9v0LaM6AYE4kH9oOpBBOvjFSaJqmosJpIe4g"
              alt=""
              width={64}
              height={64}
            />
          </div>
          <div>
            <h2 className="font-headline text-xl text-primary">Jane Anderson</h2>
            <p className="text-on-surface-variant text-sm">jane.anderson@email.com</p>
          </div>
        </div>
        <nav className="flex-grow px-4 py-6 space-y-2">
          {DRAWER_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-variant/50 transition-colors"
            >
              <span className="material-symbols-outlined text-primary">{item.icon}</span>
              <span className="font-body-md">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-outline-variant">
          <Link
            href="#"
            onClick={onClose}
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-variant/50 transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            <span className="font-body-md">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
