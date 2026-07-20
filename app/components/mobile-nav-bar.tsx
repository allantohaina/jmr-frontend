"use client";

import Link from "next/link";

const NAV_ITEMS = [
  { href: "/#accueil", icon: "home", label: "Accueil" },
  { href: "/#nos-services", icon: "handyman", label: "Services" },
  { href: "/#a-propos", icon: "info", label: "A propos" },
  { href: "/mon-profil", icon: "person", label: "Espace client" },
] as const;

export function MobileNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-surface-container-high border-t border-white/20 shadow-2xl">
      <div className="grid grid-cols-4 h-16">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center justify-center gap-0.5 text-white/80 hover:text-[#e5ad46] transition-colors"
          >
            <span className="material-symbols-outlined text-2xl leading-none block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
              {item.icon}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold font-label leading-none">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
