"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { scrollToSection } from "@/app/lib/scroll";

import { useLocale } from "@/app/components/locale-provider";
import { ThemeToggle } from "@/app/components/theme-toggle";
import MobileMenu from "@/app/components/MobileMenu";
import { getUser, writeBrowserCookie, getToken } from "@/app/lib/auth";
import { signOutClient } from "@/app/lib/auth-client";
import { authAPI, notificationsAPI, type NotificationRecord, type UserProfile } from "@/app/lib/api";
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
    return "/";
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [sessionUser, setSessionUser] = useState<UserProfile | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(initialTheme);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const effectiveUserFirstName = sessionUser?.first_name ?? userFirstName;
  const effectiveUserRole = sessionUser?.role ?? userRole;
  const effectiveIsSignedIn = isSignedIn || !!sessionUser;
  const isStaff = effectiveUserRole === "admin" || effectiveUserRole === "worker";
  const hasNotifications = effectiveIsSignedIn;
  const navItems: NavItem[] = [
    {
      route: "/",
      sectionId: "accueil",
      label: messages.navbar.home,
      icon: "/navbar/navbar-home.svg",
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

  function isMobileViewport(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function handleToggleBurger() {
    if (!isMobileViewport()) {
      setIsMenuOpen(false);
      return;
    }
    setIsMenuOpen((open) => !open);
  }

  // Ferme le menu si la fenêtre passe en desktop (>900px)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 901px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setIsMenuOpen(false);
    };
    mq.addEventListener("change", handler);
    handler(mq);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Ferme le menu mobile avec la touche Escape
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMenuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen && !(event.target as Element).closest(".site-nav__item--profile")) {
        setIsProfileOpen(false);
      }
      if (isNotifOpen && !(event.target as Element).closest(".site-nav__item--notif")) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen, isNotifOpen]);

  useEffect(() => {
    if (!effectiveIsSignedIn) {
      setNotifications([]);
      setUnreadNotifications(0);
      return;
    }

    let active = true;
    const loadNotifications = async () => {
      try {
        const response = await notificationsAPI.list();
        if (!active) return;
        setNotifications(response.data.data ?? []);
        setUnreadNotifications(response.data.unread_count ?? 0);
      } catch {
        // A notification failure must never block navigation.
      }
    };

    void loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60_000);
    return () => { active = false; window.clearInterval(intervalId); };
  }, [effectiveIsSignedIn]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", isMenuOpen);

    return () => {
      document.body.classList.remove("nav-menu-open");
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function handleSwipeOpen() {
      if (isMobileViewport()) {
        setIsMenuOpen(true);
      }
    }
    window.addEventListener("mobile-menu-swipe-open", handleSwipeOpen);
    return () => window.removeEventListener("mobile-menu-swipe-open", handleSwipeOpen);
  }, []);

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
  }

  function handleToggleLocale() {
    const next: Locale = locale === "fr" ? "en" : "fr";
    handleLocaleChange(next);
  }

  function handleToggleTheme() {
    const next: ThemeName = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    writeBrowserCookie("theme", next, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "Lax",
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", next);
    }
  }

  if (pathname?.startsWith("/backoffice") || pathname?.startsWith("/admin-backoffice")) {
    return null;
  }

  return (
    <>
      <nav className="site-nav" aria-label={messages.navbar.ariaLabel}>
        <Link
          className="site-nav__brand"
          href="/"
          aria-label={messages.navbar.home + " JMR Textile"}
          onClick={(e) => {
            setIsMenuOpen(false);
            if (pathname === "/") {
              e.preventDefault();
              scrollToSection("accueil");
            }
          }}
        >
          {isBrandLogoError ? (
            <span className="site-nav__brand-fallback">JMR Textile</span>
          ) : (
            <Image
              className="site-nav__brand-logo"
              src={currentTheme === "light" ? "/navbar/logo-light.svg" : "/navbar/logo-dark.svg"}
              alt="JMR Textile"
              width={413}
              height={92}
              priority
              unoptimized
              onError={() => setIsBrandLogoError(true)}
            />
          )}
        </Link>

        <ul className="site-nav__menu" id="site-nav-menu">
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
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    if (pathname === "/" && item.homeAnchor) {
                      e.preventDefault();
                      scrollToSection(item.sectionId);
                    }
                  }}
                  prefetch={true}
                >
                  <Image
                    className="site-nav__icon"
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    width={42}
                    height={42}
                    loading="lazy"
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}

          <li className="site-nav__item site-nav__item--theme">
            <ThemeToggle initialTheme={initialTheme} />
          </li>

          {hasNotifications && (
            <li className="site-nav__item site-nav__item--notif relative">
              <button
                type="button"
                className="site-nav__language-trigger"
                title="Notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-expanded={isNotifOpen}
              >
                <Image
                  className="site-nav__icon"
                  src="/notification_bell.svg"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  loading="lazy"
                />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-2.5 h-2.5 px-1 bg-[#e5ad46] text-[#163526] text-[9px] font-bold leading-[18px] text-center rounded-full">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
                <span className="site-nav__language-name">Notifications</span>
              </button>

              {isNotifOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#25303a] border border-[#e5ad46]/20 rounded-xl shadow-xl py-4 px-4 z-[110] animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="text-sm font-semibold text-[#e5ad46] mb-3">Notifications</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-3 text-sm text-white/60">Aucune notification pour le moment.</p>
                    ) : notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.action_url || "/mon-profil"}
                        onClick={() => {
                          setIsNotifOpen(false);
                          if (!notification.read_at) {
                            void notificationsAPI.markRead(notification.id).then(() => {
                              setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item));
                              setUnreadNotifications((count) => Math.max(0, count - 1));
                            });
                          }
                        }}
                        className={`block p-3 rounded-lg text-sm transition-colors ${notification.read_at ? "bg-[#1e2a38] text-white/65" : "bg-[#1e2a38] text-white hover:bg-[#344454]"}`}
                      >
                        <span className="block font-semibold">{notification.title}</span>
                        <span className="block mt-1 text-xs text-white/60 line-clamp-2">{notification.message}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          )}

          <li className="site-nav__item site-nav__item--language">
            <button
              type="button"
              className="site-nav__language-trigger"
              title={messages.navbar.languageTitle}
              onClick={handleToggleLocale}
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
          </li>
        </ul>

        <button
          type="button"
          className="max-[900px]:flex max-[900px]:items-center max-[900px]:justify-center hidden h-10 w-10 rounded-xl transition-colors hover:bg-[#e5ad46]/10"
          onClick={handleToggleBurger}
          aria-label="Menu"
          aria-expanded={isMenuOpen}
          aria-controls="site-mobile-menu"
        >
          <span className="material-symbols-outlined text-[#e5ad46] text-2xl">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </nav>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        initialTheme={initialTheme}
        locale={locale}
        messages={messages}
        isSignedIn={effectiveIsSignedIn}
        isSigningOut={isSigningOut}
        onToggleTheme={(next) => {
          setCurrentTheme(next);
          document.documentElement.dataset.theme = next;
          document.documentElement.style.colorScheme = next;
          writeBrowserCookie("theme", next, {
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
            sameSite: "Lax",
          });
          if (typeof window !== "undefined") {
            window.localStorage.setItem("theme", next);
          }
        }}
        onLocaleChange={handleLocaleChange}
        onSignOut={handleSignOut}
        brandFallbackText="JMR TEXTILE"
      />
    </>
  );
}
