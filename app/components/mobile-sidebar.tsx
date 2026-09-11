"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, WandSparkles, Info, User, Settings, ExternalLink, FileText } from "lucide-react";
import { scrollToSection } from "@/app/lib/scroll";

const NAV_LINKS = [
  { href: "/", sectionId: "accueil", label: "Accueil", icon: Home },
  { href: "/", sectionId: "nos-services", label: "Nos services", icon: WandSparkles },
  { href: "/", sectionId: "a-propos", label: "À propos", icon: Info },
  { href: "/mon-profil", label: "Espace client", icon: User },
];

const SECONDARY_LINKS = [
  { href: "/demande-devis", label: "Demander un devis", icon: FileText },
];

interface MobileDrawerProps {
  isStaff?: boolean;
  userFirstName?: string;
}

export function MobileSidebar({ isStaff, userFirstName }: MobileDrawerProps) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, closeDrawer]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => {
    if (href === "/" && pathname !== "/") return false;
    return pathname === href || pathname?.startsWith(href.split("#")[0]);
  };

  return (
    <>
      <button
        onClick={openDrawer}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-[#FFB42D]/10 md:hidden"
        aria-label="Ouvrir le menu"
      >
        {open ? (
          <X className="h-5 w-5 text-[#FFB42D]" />
        ) : (
          <Menu className="h-5 w-5 text-[#FFB42D]" />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeDrawer}
        />
      )}

      <div
        ref={drawerRef}
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-[85vw] max-w-sm flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "#1e2a38" }}
      >
        <div className="flex items-center justify-between border-b border-[#FFB42D]/10 px-6 py-5">
          <span className="font-headline text-lg font-bold tracking-wide text-[#FFB42D]">
            JMR Textile
          </span>
          <button
            onClick={closeDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-[#FFB42D]/10"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5 text-[#FFB42D]" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon, sectionId }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={(e) => {
                      closeDrawer();
                      if (sectionId) {
                        e.preventDefault();
                        scrollToSection(sectionId);
                      }
                    }}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest transition-all ${
                      active
                        ? "bg-[#FFB42D]/10 text-[#FFB42D]"
                        : "text-[#FFB42D]/70 hover:bg-[#FFB42D]/5 hover:text-[#FFB42D]"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-[#FFB42D]" : "text-[#FFB42D]/40"}`} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {(isStaff || userFirstName) && (
            <>
              <div className="my-6 border-t border-[#FFB42D]/10" />
              <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-widest text-[#FFB42D]/40">
                Administration
              </p>
              <ul className="space-y-1">
                {isStaff && (
                  <li>
                    <Link
                      href="/backoffice"
                      onClick={closeDrawer}
                      className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-[#FFB42D]/70 transition-all hover:bg-[#FFB42D]/5 hover:text-[#FFB42D]"
                    >
                      <Settings className="h-5 w-5 text-[#FFB42D]/40" />
                      Backoffice
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/mon-profil"
                    onClick={closeDrawer}
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-[#FFB42D]/70 transition-all hover:bg-[#FFB42D]/5 hover:text-[#FFB42D]"
                  >
                    <User className="h-5 w-5 text-[#FFB42D]/40" />
                    {userFirstName ? `Mon compte (${userFirstName})` : "Mon compte"}
                  </Link>
                </li>
              </ul>
            </>
          )}
        </nav>

        <div className="border-t border-[#FFB42D]/10 px-4 py-6">
          <div className="space-y-3">
            {SECONDARY_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeDrawer}
                className="flex items-center justify-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest transition-all"
                style={{ background: "#FFB42D", color: "#1e2a38" }}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-center text-[10px] text-[#FFB42D]/30">
            JMR Textile &mdash; Tous droits réservés
          </p>
        </div>
      </div>
    </>
  );
}
