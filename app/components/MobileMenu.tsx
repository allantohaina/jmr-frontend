"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { writeBrowserCookie } from "@/app/lib/auth";
import { LOCALE_COOKIE_NAME, type Locale } from "@/app/lib/locale";
import type { ThemeName } from "@/app/lib/theme";
import { scrollToSection } from "@/app/lib/scroll";

const ICON_SIZE = 42;
const GOLD_FILTER = {
  filter:
    "brightness(0) saturate(100%) invert(77%) sepia(37%) saturate(686%) hue-rotate(355deg) brightness(97%) contrast(95%)",
} as const;
const ICON_CLASS = "flex-shrink-0 object-contain";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  initialTheme: ThemeName;
  locale: Locale;
  messages: {
    navbar: {
      home: string;
      services: string;
      about: string;
      clientSpace: string;
      signOut: string;
      signingOut: string;
      languageTitle: string;
    };
    common: {
      french: string;
      english: string;
    };
  };
  onToggleTheme?: (next: ThemeName) => void;
  onLocaleChange?: (next: Locale) => void;
  onSignOut?: () => Promise<void> | void;
  isSignedIn?: boolean;
  isSigningOut?: boolean;
  brandFallbackText?: string;
}

type StaticNavLink = {
  labelKey: "home" | "services" | "about" | "clientSpace";
  href: string;
  sectionId: string;
  icon: string;
};

const STATIC_NAV_LINKS: StaticNavLink[] = [
  { labelKey: "home", href: "/", sectionId: "accueil", icon: "/navbar/navbar-home.svg" },
  { labelKey: "services", href: "/", sectionId: "nos-services", icon: "/navbar/navbar-services.svg" },
  { labelKey: "about", href: "/", sectionId: "a-propos", icon: "/navbar/navbar-about.svg" },
  { labelKey: "clientSpace", href: "/", sectionId: "acces-client", icon: "/navbar/navbar-profile.svg" },
];

export default function MobileMenu({
  isOpen,
  onClose,
  initialTheme,
  locale,
  messages,
  onToggleTheme,
  onLocaleChange,
  onSignOut,
  isSignedIn = false,
  isSigningOut = false,
  brandFallbackText = "JMR TEXTILE",
}: MobileMenuProps) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const aside = asideRef.current;
    if (aside) {
      aside.style.width = isOpen ? "78%" : "0";
    }
    if (isOpen) {
      document.body.classList.add("nav-menu-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("nav-menu-open");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.classList.remove("nav-menu-open");
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SWIPE_THRESHOLD = 50;
    const EDGE_ZONE = 30;
    const MAX_Y_DIFF = 80;

    function handleTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      touchStartX.current = t.clientX;
      touchStartY.current = t.clientY;
      touchCurrentX.current = t.clientX;
    }
    function handleTouchMove(e: TouchEvent) {
      touchCurrentX.current = e.touches[0].clientX;
    }
    function handleTouchEnd(e: TouchEvent) {
      if (touchStartX.current === null || touchStartY.current === null || touchCurrentX.current === null) return;
      const deltaX = touchCurrentX.current - touchStartX.current;
      const deltaY = Math.abs((e.changedTouches[0]?.clientY ?? touchStartY.current) - touchStartY.current);
      if (deltaY > MAX_Y_DIFF || Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (isOpen && deltaX < 0) onClose();
      else if (!isOpen && deltaX > 0 && touchStartX.current <= EDGE_ZONE) {
        if (window.matchMedia("(max-width: 900px)").matches) {
          window.dispatchEvent(new CustomEvent("mobile-menu-swipe-open"));
        }
      }
      touchStartX.current = null; touchStartY.current = null; touchCurrentX.current = null;
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen, onClose]);

  function handleLocaleToggle() {
    const next: Locale = locale === "fr" ? "en" : "fr";
    closeImmediately();
    if (onLocaleChange) return onLocaleChange(next);
    writeBrowserCookie(LOCALE_COOKIE_NAME, next, { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "Lax" });
  }

  function closeImmediately() { document.activeElement instanceof HTMLElement && document.activeElement.blur(); onClose(); }

  return (
    <div className="block max-[900px]:block hidden">
      <div
        aria-hidden={!isOpen}
        onClick={closeImmediately}
        className={`mobile-menu__overlay fixed inset-0 z-[999] transition-opacity duration-500 ease-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        ref={asideRef}
        id="site-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        aria-hidden={!isOpen}
        style={{ width: 0, transition: "width 0.5s ease-out", visibility: isOpen ? "visible" : "hidden" }}
        className="mobile-menu fixed inset-y-0 left-0 z-[1000] flex flex-col h-screen max-w-[85vw] shadow-2xl overflow-x-hidden"
      >
        {/* HEADER */}
        <header className="mobile-menu__header w-full flex items-center justify-between px-5 pt-5 pb-3">
          <span className="mobile-menu__brand font-bold uppercase tracking-[0.15em] text-[13px]">
            {brandFallbackText}
          </span>
          <button
            type="button"
            onClick={closeImmediately}
            aria-label="Fermer le menu"
            title="Fermer"
            className="mobile-menu__closebtn material-symbols-outlined flex items-center justify-center leading-none rounded-xl w-[40px] h-[40px] text-[24px] transition-colors"
          >
            close
          </button>
        </header>

        {/* NAV */}
        <nav aria-label="Navigation" className="mobile-menu__nav flex flex-col px-4 pt-4 overflow-y-auto flex-1 gap-1">
          {STATIC_NAV_LINKS.map((link) => {
            const label = messages.navbar[link.labelKey];
            return (
              <Link
                key={link.sectionId}
                href={link.href}
                data-nav-section={link.sectionId}
                onClick={(e) => {
                  closeImmediately();
                  if (pathname === "/") {
                    e.preventDefault();
                    scrollToSection(link.sectionId);
                  }
                }}
                className="mobile-menu__link flex items-center gap-3 px-3 py-3 rounded-xl no-underline transition-colors"
              >
                <Image
                  src={link.icon}
                  alt=""
                  aria-hidden="true"
                  width={ICON_SIZE}
                  height={ICON_SIZE}
                  style={GOLD_FILTER}
                  className={`${ICON_CLASS} mobile-menu__icon !w-[42px] !h-[42px]`}
                />
                <span className="mobile-menu__link-text text-[15px] font-semibold tracking-wide">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <footer className="mobile-menu__footer px-5 pt-4 pb-6 mt-4 border-t flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            {/* LANGUE */}
            <button
              type="button"
              onClick={handleLocaleToggle}
              title={messages.navbar.languageTitle}
              className="mobile-menu__btn-lang flex-1 inline-flex items-center justify-center gap-2 px-2 py-2 h-[52px] rounded-xl border text-[13px] font-bold tracking-[0.15em] transition-colors"
            >
              <Image
                src="/navbar/navbar-language.svg"
                alt=""
                aria-hidden="true"
                width={ICON_SIZE}
                height={ICON_SIZE}
                style={GOLD_FILTER}
                className={`${ICON_CLASS} mobile-menu__btn-icon !w-[32px] !h-[32px]`}
              />
              <span className="mobile-menu__btn-text">{locale === "fr" ? "FR" : "EN"}</span>
            </button>

            {/* THÈME */}
            <div className="theme-toggle-mobile-wrapper inline-flex items-center justify-center">
              <ThemeToggle initialTheme={initialTheme} compact onChangeExplicit={onToggleTheme} />
            </div>
          </div>

          {/* LOGOUT */}
          {isSignedIn && onSignOut ? (
            <button
              type="button"
              onClick={() => { closeImmediately(); onSignOut?.(); }}
              disabled={isSigningOut}
              className="mobile-menu__btn-logout inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[52px] rounded-xl border font-bold text-[14px] tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 40" }}
                className={`${ICON_CLASS} material-symbols-outlined mobile-menu__btn-icon !w-[32px] !h-[32px] !text-[32px] leading-none flex items-center justify-center`}
              >
                logout
              </span>
              <span>{isSigningOut ? messages.navbar.signingOut : messages.navbar.signOut}</span>
            </button>
          ) : null}
        </footer>
      </aside>
    </div>
  );
}
