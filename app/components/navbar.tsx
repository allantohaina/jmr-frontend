"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import { useLocale } from "@/app/components/locale-provider";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { getUser, writeBrowserCookie, getToken } from "@/app/lib/auth";
import { signOutClient } from "@/app/lib/auth-client";
import { authAPI, type UserProfile } from "@/app/lib/api";
import { LOCALE_COOKIE_NAME, type Locale } from "@/app/lib/locale";
import type { ThemeName } from "@/app/lib/theme";

type NavItem = {
  route: string;
  sectionId: string;
  label: string;
  icon: string;
  homeAnchor?: boolean;
  adminOnly?: boolean;
};

function getNavItemHref(pathname: string, item: NavItem) {
  if (pathname === "/" && item.homeAnchor) {
    return `/#${item.sectionId}`;
  }

  return item.route;
}

function getNavItemAriaCurrent(pathname: string, activeHomeSection: string, item: NavItem) {
  if (pathname === "/" && item.homeAnchor) {
    return activeHomeSection === item.sectionId ? "location" : undefined;
  }

  return pathname === item.route ? "page" : undefined;
}

export function Navbar({
  isSignedIn = false,
  userFirstName,
  userRole,
  initialTheme,
}: {
  isSignedIn?: boolean;
  userFirstName?: string;
  userRole?: string;
  initialTheme: ThemeName;
}) {
  const pathname = usePathname();
  const { locale, setLocale, messages } = useLocale();
  const [activeHomeSection, setActiveHomeSection] = useState("accueil");
  const [isBrandLogoError, setIsBrandLogoError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [sessionUser, setSessionUser] = useState<UserProfile | null>(null);
  const [menuDrawerOffset, setMenuDrawerOffset] = useState(0);
  const [isMenuDragging, setIsMenuDragging] = useState(false);
  const menuTouchStartX = useRef<number | null>(null);
  const menuTouchStartY = useRef<number | null>(null);
  const menuTouchStartTime = useRef<number | null>(null);
  const effectiveUserFirstName = sessionUser?.first_name ?? userFirstName;
  const effectiveUserRole = sessionUser?.role ?? userRole;
  const effectiveIsSignedIn = isSignedIn || !!sessionUser;
  const isStaff = effectiveUserRole === "admin" || effectiveUserRole === "worker";
  const navItems: NavItem[] = [
    {
      route: "/",
      sectionId: "accueil",
      label: messages.navbar.home,
      icon: "/navbar/navbar-project.svg",
      homeAnchor: true,
    },
    {
      route: "/",
      sectionId: "nos-services",
      label: messages.navbar.services,
      icon: "/navbar/navbar-services.svg",
      homeAnchor: true,
    },
    {
      route: "/",
      sectionId: "a-propos",
      label: messages.navbar.about,
      icon: "/navbar/navbar-about.svg",
      homeAnchor: true,
    },
    {
      route: "/mon-profil",
      sectionId: "acces-client",
      label: messages.navbar.clientSpace,
      icon: "/navbar/navbar-profile.svg",
      homeAnchor: true,
    },
    {
      route: "/backoffice",
      sectionId: "admin",
      label: messages.navbar.admin,
      icon: "/analytics_chart.svg",
      adminOnly: true,
    },
    {
      route: "/atelier",
      sectionId: "worker",
      label: messages.navbar.workshop,
      icon: "/icone-production.svg",
      adminOnly: true,
    },
  ];
  const visibleNavItems = navItems.filter((item) => {
    if (item.sectionId === "acces-client") return !isStaff;
    if (item.sectionId === "worker") return effectiveUserRole === "worker";
    if (item.sectionId === "admin") return effectiveUserRole === "admin";
    return !item.adminOnly || isStaff;
  });

  useEffect(() => {
    const token = getToken();
    const user = getUser() as UserProfile | null;

    if (!token) {
      if (user) signOutClient();
      setSessionUser(null);
      return;
    }

    if (user) {
      authAPI.getProfile(token).then((res) => {
        setSessionUser(res.data);
      }).catch(() => {
        signOutClient();
        setSessionUser(null);
      });
    } else {
      setSessionUser(null);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen && !(event.target as Element).closest(".site-nav__item--profile")) {
        setIsProfileOpen(false);
      }
      if (isLanguageOpen && !(event.target as Element).closest(".site-nav__item--language")) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLanguageOpen, isProfileOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      setMenuDrawerOffset(0);
      setIsMenuDragging(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen && !isLanguageOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsLanguageOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLanguageOpen, isMenuOpen]);

  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", isMenuOpen);

    return () => {
      document.body.classList.remove("nav-menu-open");
    };
  }, [isMenuOpen]);

  // Add global touch event listeners for swipe-to-open
  useEffect(() => {
    const handleGlobalTouchStart = (e: TouchEvent) => handleMenuTouchStart(e);
    const handleGlobalTouchMove = (e: TouchEvent) => handleMenuTouchMove(e);
    const handleGlobalTouchEnd = () => handleMenuTouchEnd();
    const handleGlobalTouchCancel = () => handleMenuTouchEnd();

    document.addEventListener("touchstart", handleGlobalTouchStart, { passive: true });
    document.addEventListener("touchmove", handleGlobalTouchMove, { passive: true });
    document.addEventListener("touchend", handleGlobalTouchEnd, { passive: true });
    document.addEventListener("touchcancel", handleGlobalTouchCancel, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleGlobalTouchStart);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
      document.removeEventListener("touchcancel", handleGlobalTouchCancel);
    };
  }, [isMenuOpen, menuDrawerOffset]);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-section]"));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => ({
            id: entry.target.getAttribute("data-nav-section"),
            rect: entry.target.getBoundingClientRect(),
            intersectionRatio: entry.intersectionRatio,
          }));

        if (visibleSections.length === 0) return;

        visibleSections.sort((a, b) => {
          const aTop = Math.abs(a.rect.top);
          const bTop = Math.abs(b.rect.top);
          return aTop - bTop;
        });

        const currentSection = visibleSections[0].id;
        if (currentSection) {
          setActiveHomeSection(currentSection);
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: "-20% 0px -20% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOutClient();
      window.location.assign("/");
    } finally {
      setIsSigningOut(false);
      setIsProfileOpen(false);
    }
  }

  function handleLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    writeBrowserCookie(LOCALE_COOKIE_NAME, nextLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "Lax",
    });
    setIsLanguageOpen(false);
  }

  function isMobileViewport() {
    return typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
  }

  function handleMenuTouchStart(event: React.TouchEvent | TouchEvent) {
    if (!isMobileViewport()) {
      return;
    }

    const touch = (event as any).touches?.[0] || (event as any).changedTouches?.[0];
    if (!touch) return;

    const clientX = touch.clientX;
    const clientY = touch.clientY;

    // Only handle swipes on the left edge when menu is closed, or anywhere on menu when open
    if (!isMenuOpen && clientX > 30) {
      return;
    }

    menuTouchStartX.current = clientX;
    menuTouchStartY.current = clientY;
    menuTouchStartTime.current = Date.now();
    setIsMenuDragging(true);
  }

  function handleMenuTouchMove(event: React.TouchEvent | TouchEvent) {
    if (!isMobileViewport() || menuTouchStartX.current === null || menuTouchStartY.current === null) {
      return;
    }

    const touch = (event as any).touches?.[0] || (event as any).changedTouches?.[0];
    if (!touch) return;

    const currentX = touch.clientX;
    const currentY = touch.clientY;
    const deltaX = currentX - menuTouchStartX.current;
    const deltaY = currentY - menuTouchStartY.current;

    // Ignore if vertical swipe is more than horizontal
    if (Math.abs(deltaY) > Math.abs(deltaX) * 0.5) {
      return;
    }

    if (isMenuOpen) {
      // Swiping to close
      setMenuDrawerOffset(Math.min(Math.max(deltaX, 0), 320));
    } else {
      // Swiping to open
      setMenuDrawerOffset(Math.min(Math.max(deltaX, 0), 320));
    }
  }

  function handleMenuTouchEnd() {
    if (!isMobileViewport() || menuTouchStartX.current === null || menuTouchStartTime.current === null) {
      return;
    }

    const deltaTime = Date.now() - menuTouchStartTime.current;
    const offset = menuDrawerOffset;

    if (isMenuOpen) {
      // Close if swiped far enough or fast enough
      if (offset > 96 || (offset > 30 && deltaTime < 300)) {
        setIsMenuOpen(false);
      }
    } else {
      // Open if swiped far enough or fast enough
      if (offset > 60 || (offset > 30 && deltaTime < 300)) {
        setIsMenuOpen(true);
      }
    }

    menuTouchStartX.current = null;
    menuTouchStartTime.current = null;
    menuTouchStartY.current = null;
    setMenuDrawerOffset(0);
    setIsMenuDragging(false);
  }

  if (pathname?.startsWith("/backoffice") || pathname?.startsWith("/admin-backoffice")) {
    return null;
  }

  return (
    <nav className="site-nav" aria-label={messages.navbar.ariaLabel}>
      <Link
        className="site-nav__brand"
        href="/#accueil"
        aria-label={messages.navbar.home + " JMR Textile"}
        onClick={() => setIsMenuOpen(false)}
      >
        {isBrandLogoError ? (
          <span className="site-nav__brand-fallback">JMR Textile</span>
        ) : (
          <Image
            className="site-nav__brand-logo"
            src="/navbar/logo-dark.svg"
            alt="JMR Textile"
            width={413}
            height={92}
            priority
            unoptimized
            onError={() => setIsBrandLogoError(true)}
          />
        )}
      </Link>

      <button
        className={`site-nav__menu-toggle${isMenuOpen ? " is-open" : ""}`}
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls="site-nav-menu"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <Image
          className="site-nav__menu-toggle-icon"
          src="/hamburger_menu.svg"
          alt=""
          aria-hidden="true"
          width={22}
          height={22}
        />
        <span className="site-nav__menu-toggle-label">
          {isMenuOpen ? messages.common.close : messages.common.menu}
        </span>
      </button>

      <button
        type="button"
        className={`site-nav__drawer-backdrop${isMenuOpen || isMenuDragging ? " is-open" : ""}${isMenuDragging ? " is-dragging" : ""}`}
        aria-hidden={!isMenuOpen && !isMenuDragging}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={() => setIsMenuOpen(false)}
        style={{
          opacity: isMenuDragging
            ? isMenuOpen
              ? `calc(1 - ${Math.min(menuDrawerOffset, 320)} / 320)`
              : `calc(${Math.min(menuDrawerOffset, 320)} / 320)`
            : undefined,
        }}
      />

      <ul
        className={`site-nav__menu${isMenuOpen ? " is-open" : ""}${isMenuDragging ? " is-dragging" : ""}`}
        id="site-nav-menu"
        style={{
          transform: isMenuDragging
            ? isMenuOpen
              ? `translate3d(${menuDrawerOffset}px, 0, 0)`
              : `translate3d(calc(-100% + ${menuDrawerOffset}px), 0, 0)`
            : undefined,
        }}
        onTouchStart={handleMenuTouchStart}
        onTouchMove={handleMenuTouchMove}
        onTouchEnd={handleMenuTouchEnd}
        onTouchCancel={handleMenuTouchEnd}
      >
        {visibleNavItems.map((item) => {
          const resolvedFirstName =
            typeof effectiveUserFirstName === "string" ? effectiveUserFirstName.trim() : "";
          const label =
            item.sectionId === "acces-client" && effectiveIsSignedIn
              ? resolvedFirstName || messages.navbar.profile
              : item.label;
          const ariaCurrent = getNavItemAriaCurrent(pathname, activeHomeSection, item);
          const isCurrent = ariaCurrent !== undefined;

          if (item.sectionId === "acces-client" && effectiveIsSignedIn) {
            return (
              <li className="site-nav__item site-nav__item--profile relative group" key={item.sectionId}>
                <button
                  className={`site-nav__link${isCurrent ? " is-current" : ""} ${isProfileOpen ? "opacity-100" : "opacity-80"} hover:opacity-100 transition-opacity`}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <Image
                    className="site-nav__icon"
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    width={42}
                    height={42}
                  />
                  <div className="flex items-center gap-1">
                    <span>{label}</span>
                    <span className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}>expand_more</span>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#25303a] border border-[#e5ad46]/20 rounded-xl shadow-xl py-2 z-[110] animate-in fade-in zoom-in-95 duration-200">
                    <Link
                      href="/mon-profil"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#1e2a38] text-sm font-medium text-[#e5ad46] transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <span className="material-symbols-outlined text-xl">person</span>
                        {messages.navbar.dashboard}
                    </Link>
                    {effectiveUserRole === "admin" && (
                      <Link
                        href="/backoffice"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#1e2a38] text-sm font-medium text-[#e5ad46] transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                        {messages.navbar.administration}
                      </Link>
                    )}
                    <div className="h-px bg-[#e5ad46]/20 mx-2 my-1"></div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a1a1a] text-sm font-medium text-[#ff6b6b] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-xl">logout</span>
                      {isSigningOut ? messages.navbar.signingOut : messages.navbar.signOut}
                    </button>
                  </div>
                )}
              </li>
            );
          }

          return (
            <li className="site-nav__item" key={item.sectionId}>
              <Link
                className={`site-nav__link${isCurrent ? " is-current" : ""}`}
                href={getNavItemHref(pathname, item)}
                aria-current={ariaCurrent}
                onClick={() => setIsMenuOpen(false)}
                prefetch={true} // Smart preloading
              >
                <Image
                  className="site-nav__icon"
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  width={42}
                  height={42}
                  loading="lazy" // Lazy load images!
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}

        <li className="site-nav__item site-nav__item--theme">
          <ThemeToggle initialTheme={initialTheme} />
        </li>

        <li className="site-nav__item site-nav__item--language">
          <button
            type="button"
            className="site-nav__language-trigger"
            title={messages.navbar.languageTitle}
            aria-expanded={isLanguageOpen}
            onClick={() => setIsLanguageOpen((open) => !open)}
          >
            <Image
              className="site-nav__icon site-nav__icon--language"
              src="/navbar/navbar-language.svg"
              alt=""
              aria-hidden="true"
              width={42}
              height={42}
              loading="lazy"
            />
            <span className="site-nav__language-name">
              {locale === "fr" ? messages.common.french : messages.common.english}
            </span>
          </button>
          {isLanguageOpen ? (
            <div className="site-nav__language-menu is-open">
              <button
                type="button"
                className={`site-nav__language-option-button${locale === "fr" ? " is-current" : ""}`}
                onClick={() => handleLocaleChange("fr")}
              >
                {messages.common.french}
              </button>
              <button
                type="button"
                className={`site-nav__language-option-button${locale === "en" ? " is-current" : ""}`}
                onClick={() => handleLocaleChange("en")}
              >
                {messages.common.english}
              </button>
            </div>
          ) : null}
        </li>
      </ul>
    </nav>
  );
}
