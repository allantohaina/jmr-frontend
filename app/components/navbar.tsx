"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
    route: "/",
    sectionId: "acces-client",
    label: "Espace client",
    icon: "/navbar/navbar-profile.svg",
    homeAnchor: true,
  },
  {
    route: "/admin",
    sectionId: "admin",
    label: "Admin",
    icon: "/analytics_chart.svg",
    adminOnly: true,
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
  const isAdmin = userRole === "admin";
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

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
            item.route === "/mon-profil" && isSignedIn
              ? resolvedFirstName || "Espace client"
              : item.label;
          const ariaCurrent = getNavItemAriaCurrent(pathname, activeHomeSection, item);
          const isCurrent = ariaCurrent !== undefined;

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
