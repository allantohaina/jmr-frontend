"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { signOut } from "@/app/actions";

type NavItem = {
  route: string;
  sectionId: string;
  label: string;
  icon: string;
  homeAnchor?: boolean;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    route: "/",
    sectionId: "accueil",
    label: "Accueil",
    icon: "/navbar/navbar-project.svg",
    homeAnchor: true,
  },
  {
    route: "/",
    sectionId: "nos-services",
    label: "Nos services",
    icon: "/navbar/navbar-services.svg",
    homeAnchor: true,
  },
  {
    route: "/",
    sectionId: "a-propos",
    label: "A propos",
    icon: "/navbar/navbar-about.svg",
    homeAnchor: true,
  },
  {
    route: "/mon-profil",
    sectionId: "acces-client",
    label: "Espace client",
    icon: "/navbar/navbar-profile.svg",
  },
  {
    route: "/jmr-atelier-management-v2",
    sectionId: "admin",
    label: "Admin",
    icon: "/analytics_chart.svg",
    adminOnly: true,
  },
  {
    route: "/atelier",
    sectionId: "worker",
    label: "Atelier",
    icon: "/icone-production.svg",
    adminOnly: true, // Only for worker role
  },
];

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
}: {
  isSignedIn?: boolean;
  userFirstName?: string;
  userRole?: string;
}) {
  const pathname = usePathname();
  const [activeHomeSection, setActiveHomeSection] = useState("accueil");
  const [isBrandLogoError, setIsBrandLogoError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isAdmin = userRole === "admin" || userRole === "worker";
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.sectionId === "worker") return userRole === "worker";
    if (item.sectionId === "admin") return userRole === "admin";
    return !item.adminOnly || isAdmin;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen && !(event.target as Element).closest('.site-nav__item--profile')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

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
    if (pathname !== "/") {
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-section]"));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visibleEntries.length === 0) {
          return;
        }

        const currentSection = visibleEntries[0].target.getAttribute("data-nav-section");

        if (currentSection) {
          setActiveHomeSection(currentSection);
        }
      },
      {
        rootMargin: "-22% 0px -42% 0px",
        threshold: [0.2, 0.45, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  // Hide Navbar in Admin section - Moved AFTER hooks
  if (pathname?.startsWith("/jmr-atelier-management-v2")) {
    return null;
  }

  return (
    <nav className="site-nav" aria-label="Navigation principale">
      <Link
        className="site-nav__brand"
        href="/#accueil"
        aria-label="Accueil JMR Textile"
        onClick={() => setIsMenuOpen(false)}
      >
        {isBrandLogoError ? (
          <span className="site-nav__brand-fallback">JMR Textile</span>
        ) : (
          <Image
            className="site-nav__brand-logo"
            src="/navbar/logo.svg"
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
        <span className="site-nav__menu-toggle-label">{isMenuOpen ? "Fermer" : "Menu"}</span>
      </button>

      <ul className={`site-nav__menu${isMenuOpen ? " is-open" : ""}`} id="site-nav-menu">
        {visibleNavItems.map((item) => {
          const resolvedFirstName =
            typeof userFirstName === "string" ? userFirstName.trim() : "";
          const label =
            item.sectionId === "acces-client" && isSignedIn
              ? resolvedFirstName || "Mon profil"
              : item.label;
          const ariaCurrent = getNavItemAriaCurrent(pathname, activeHomeSection, item);
          const isCurrent = ariaCurrent !== undefined;

          if (item.sectionId === "acces-client" && isSignedIn) {
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
                    <span className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#c9cfd6] rounded-xl shadow-xl py-2 z-[110] animate-in fade-in zoom-in-95 duration-200">
                    <Link 
                      href="/mon-profil" 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#f6f7fa] text-sm font-medium text-[#151a21] transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <span className="material-symbols-outlined text-xl">person</span>
                      Tableau de bord
                    </Link>
                    {userRole === "admin" && (
                      <Link 
                        href="/jmr-atelier-management-v2" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#f6f7fa] text-sm font-medium text-[#151a21] transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                        Administration
                      </Link>
                    )}
                    <div className="h-px bg-[#c9cfd6] mx-2 my-1"></div>
                    <form action={signOut}>
                      <button 
                        type="submit" 
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm font-medium text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Se déconnecter
                      </button>
                    </form>
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
              >
                <Image
                  className="site-nav__icon"
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  width={42}
                  height={42}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}

        <li className="site-nav__item site-nav__item--language">
          <div
            className="site-nav__language-trigger site-nav__language-trigger--static"
            title="Version francaise disponible"
          >
            <Image
              className="site-nav__icon site-nav__icon--language"
              src="/navbar/navbar-language.svg"
              alt=""
              aria-hidden="true"
              width={42}
              height={42}
            />
            <span className="site-nav__language-name">Francais</span>
          </div>
        </li>
      </ul>
    </nav>
  );
}
