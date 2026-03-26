"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.add("reveal-ready");

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (elements.length === 0) {
      return () => {
        document.body.classList.remove("reveal-ready");
      };
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const markVisible = (element: HTMLElement) => {
      if (!element.classList.contains("is-visible")) {
        element.classList.add("is-visible");
      }
    };

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => markVisible(element));
      return () => {
        document.body.classList.remove("reveal-ready");
      };
    }

    let remaining = elements.length;
    const fallbackTimer = window.setTimeout(() => {
      elements.forEach((element) => markVisible(element));
    }, 1200);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          markVisible(entry.target as HTMLElement);
          remaining -= 1;
          if (remaining <= 0) {
            window.clearTimeout(fallbackTimer);
          }
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.14,
      },
    );

    elements.forEach((element) => {
      element.classList.remove("is-visible");
      observer.observe(element);
    });

    return () => {
      window.clearTimeout(fallbackTimer);
      observer.disconnect();
      document.body.classList.remove("reveal-ready");
    };
  }, [pathname]);

  return null;
}
