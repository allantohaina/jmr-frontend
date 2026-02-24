"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

type LanguageCode = "fr" | "en";

type LanguageOption = {
  value: LanguageCode;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/suivi-projet",
    label: "Suivi de projet",
    icon: "/navbar/navbar-project.svg",
  },
  {
    href: "/mon-profil",
    label: "Mon profil",
    icon: "/navbar/navbar-profile.svg",
  },
  {
    href: "/nos-services",
    label: "Nos services",
    icon: "/navbar/navbar-services.svg",
  },
  {
    href: "/a-propos",
    label: "A propos",
    icon: "/navbar/navbar-about.svg",
  },
];

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "fr", label: "Francais" },
  { value: "en", label: "English" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isBrandLogoError, setIsBrandLogoError] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>("fr");
  const [isLanguageHydrated, setIsLanguageHydrated] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageControlRef = useRef<HTMLDivElement>(null);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const languageMenuRef = useRef<HTMLUListElement>(null);

  const selectedLanguage =
    LANGUAGE_OPTIONS.find((option) => option.value === language) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const syncPreferredLanguage = () => {
      const storedLanguage = window.localStorage.getItem("site-language");
      const preferredLanguage: LanguageCode =
        storedLanguage === "fr" || storedLanguage === "en"
          ? storedLanguage
          : window.navigator.language.toLowerCase().startsWith("en")
            ? "en"
            : "fr";

      setLanguage((currentLanguage) =>
        currentLanguage === preferredLanguage ? currentLanguage : preferredLanguage,
      );
      setIsLanguageHydrated(true);
    };

    const timerId = window.setTimeout(syncPreferredLanguage, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;

    if (!isLanguageHydrated) {
      return;
    }

    window.localStorage.setItem("site-language", language);
  }, [language, isLanguageHydrated]);

  useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!languageControlRef.current?.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isLanguageMenuOpen) {
      return;
    }

    const positionLanguageMenu = () => {
      const control = languageControlRef.current;
      const trigger = languageTriggerRef.current;
      const menu = languageMenuRef.current;

      if (!control || !trigger || !menu) {
        return;
      }

      const controlRect = control.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const iconElement = trigger.querySelector(".site-nav__icon--language");
      const iconHeight = iconElement instanceof HTMLElement ? iconElement.offsetHeight : 42;
      const menuWidth = menu.offsetWidth;
      const viewportPadding = 12;
      const desiredLeft = triggerRect.left + triggerRect.width / 2 - menuWidth / 2;
      const maxLeft = Math.max(viewportPadding, window.innerWidth - viewportPadding - menuWidth);
      const clampedLeft = Math.min(Math.max(desiredLeft, viewportPadding), maxLeft);

      menu.style.left = `${clampedLeft - controlRect.left}px`;
      menu.style.top = `${iconHeight + 8}px`;
    };

    const frameId = window.requestAnimationFrame(positionLanguageMenu);
    window.addEventListener("resize", positionLanguageMenu);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", positionLanguageMenu);
    };
  }, [isLanguageMenuOpen, language]);

  return (
    <nav className="site-nav" aria-label="Navigation principale">
      <Link className="site-nav__brand" href="/" aria-label="Accueil JMR Textile">
        {isBrandLogoError ? (
          <span className="site-nav__brand-fallback">JMR Textile</span>
        ) : (
          <Image
            className="site-nav__brand-logo"
            src="/navbar/logo.svg?v=3"
            alt="JMR Textile"
            width={413}
            height={92}
            priority
            unoptimized
            onError={() => setIsBrandLogoError(true)}
          />
        )}
      </Link>

      <ul className="site-nav__menu">
        {NAV_ITEMS.map((item) => {
          const isCurrent = pathname === item.href;

          return (
            <li className="site-nav__item" key={item.href}>
              <Link
                className={`site-nav__link${isCurrent ? " is-current" : ""}`}
                href={item.href}
              >
                <Image
                  className="site-nav__icon"
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  width={42}
                  height={42}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li className="site-nav__item site-nav__item--language">
          <div
            className={`site-nav__language-control${isLanguageMenuOpen ? " is-open" : ""}`}
            ref={languageControlRef}
          >
            <button
              type="button"
              className="site-nav__language-trigger"
              aria-label="Choisir la langue"
              aria-haspopup="menu"
              aria-expanded={isLanguageMenuOpen}
              ref={languageTriggerRef}
              onClick={() => setIsLanguageMenuOpen((isOpen) => !isOpen)}
            >
              <Image
                className="site-nav__icon site-nav__icon--language"
                src="/navbar/navbar-language.svg"
                alt=""
                aria-hidden="true"
                width={42}
                height={42}
              />
              <span className="site-nav__language-name">{selectedLanguage.label}</span>
            </button>

            <ul
              className="site-nav__language-menu"
              role="menu"
              aria-label="Liste des langues"
              ref={languageMenuRef}
            >
              {LANGUAGE_OPTIONS.map((option) => {
                const isCurrent = option.value === language;

                return (
                  <li className="site-nav__language-option" key={option.value} role="none">
                    <button
                      type="button"
                      className={`site-nav__language-option-button${
                        isCurrent ? " is-current" : ""
                      }`}
                      role="menuitemradio"
                      aria-checked={isCurrent}
                      onClick={() => {
                        setLanguage(option.value);
                        setIsLanguageMenuOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </li>
      </ul>
    </nav>
  );
}
