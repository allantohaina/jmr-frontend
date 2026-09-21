"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { animate, set, stagger } from "animejs";

// useLayoutEffect côté client (pas de flash avant peinture), useEffect côté serveur.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function shouldSkipAnimation(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type BaseProps = {
  as?: "div" | "main" | "section" | "span" | "ol" | "ul" | "li" | "p";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  role?: string;
  ariaLabel?: string;
  /** Durée en ms */
  duration?: number;
  /** Easing anime.js (ex. "outExpo", "outQuint", "outBack") */
  ease?: string;
  /** Rejouer à chaque entrée dans le viewport (défaut : une seule fois) */
  once?: boolean;
};

type AnimeRevealProps = BaseProps & {
  /** Délai avant démarrage en ms */
  delay?: number;
  /** Décalage vertical de départ en px */
  y?: number;
};

/**
 * Révèle un élément (fondu + remontée) quand il entre dans le viewport.
 * Contenu toujours visible sans JS / avec prefers-reduced-motion.
 *
 * @example
 * <AnimeReveal as="main" className="login-card" y={18} duration={650}>
 */
export function AnimeReveal({
  as = "div",
  children,
  className,
  style,
  id,
  role,
  ariaLabel,
  delay = 0,
  duration = 700,
  y = 24,
  ease = "outExpo",
  once = true,
}: AnimeRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || shouldSkipAnimation()) return;

    set(el, { opacity: 0, y });

    const animation = animate(el, {
      opacity: [0, 1],
      y: [y, 0],
      duration,
      delay,
      ease,
      autoplay: false,
    });

    if (!("IntersectionObserver" in window)) {
      animation.play();
      return () => { animation.revert(); };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animation.play();
          if (once) observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      animation.revert();
    };
  }, [delay, duration, y, ease, once]);

  const Tag = as as ElementType;
  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      id={id}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}

type AnimeStaggerProps = BaseProps & {  /** Sélecteur des enfants à animer en cascade */
  itemSelector?: string;
  /** Intervalle entre chaque enfant en ms */
  staggerMs?: number;
  /** Décalage vertical de départ en px */
  y?: number;
};

/**
 * Anime en cascade les enfants quand le conteneur entre dans le viewport.
 *
 * @example
 * <AnimeStagger as="ol" className="services-flow" itemSelector=".services-flow__step">
 */
export function AnimeStagger({
  as = "div",
  children,
  className,
  style,
  id,
  role,
  ariaLabel,
  duration = 650,
  ease = "outExpo",
  once = true,
  itemSelector = "[data-anime-item]",
  staggerMs = 90,
  y = 28,
}: AnimeStaggerProps) {
  const ref = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || shouldSkipAnimation()) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
    if (items.length === 0) return;

    set(items, { opacity: 0, y });

    const animation = animate(items, {
      opacity: [0, 1],
      y: [y, 0],
      duration,
      delay: stagger(staggerMs),
      ease,
      autoplay: false,
    });

    if (!("IntersectionObserver" in window)) {
      animation.play();
      return () => { animation.revert(); };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animation.play();
          if (once) observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      animation.revert();
    };
  }, [duration, ease, once, itemSelector, staggerMs, y]);

  const Tag = as as ElementType;
  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      id={id}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}

type AnimeFloatProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Amplitude en px (défaut 8) */
  amplitude?: number;
  /** Durée d'un aller en ms (défaut 2600) */
  duration?: number;
  /** Délai avant démarrage en ms */
  delay?: number;
};

/**
 * Flottement doux en boucle (monte / descend). Idéal pour les décors,
 * halos et visuels héros. Immobile avec prefers-reduced-motion.
 *
 * @example
 * <AnimeFloat amplitude={7} duration={2800} delay={400}>...</AnimeFloat>
 */
export function AnimeFloat({
  children,
  className,
  style,
  amplitude = 8,
  duration = 2600,
  delay = 0,
}: AnimeFloatProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || shouldSkipAnimation()) return;

    const animation = animate(el, {
      y: [-amplitude, amplitude],
      duration,
      delay,
      ease: "inOutSine",
      loop: true,
      alternate: true,
    });

    return () => { animation.revert(); };
  }, [amplitude, duration, delay]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

type AnimeGrowProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Durée en ms */
  duration?: number;
  /** Délai avant démarrage en ms */
  delay?: number;
  /** Easing anime.js */
  ease?: string;
};

/**
 * Trace un élément horizontalement (scaleX 0 → 1) quand il entre
 * dans le viewport. Parfait pour les soulignés de section.
 *
 * @example
 * <AnimeGrow><span className="ui-section-underline" /></AnimeGrow>
 */
export function AnimeGrow({
  children,
  className,
  style,
  duration = 800,
  delay = 150,
  ease = "outExpo",
}: AnimeGrowProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || shouldSkipAnimation()) return;

    set(el, { scaleX: 0, opacity: 0 });

    const animation = animate(el, {
      scaleX: [0, 1],
      opacity: [0, 1],
      duration,
      delay,
      ease,
      autoplay: false,
    });

    if (!("IntersectionObserver" in window)) {
      animation.play();
      return () => { animation.revert(); };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animation.play();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      animation.revert();
    };
  }, [duration, delay, ease]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transformOrigin: "center", ...style }}
    >
      {children}
    </div>
  );
}

type AnimeCountUpProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Durée en ms */
  duration?: number;
  /** Easing anime.js */
  ease?: string;
};

/**
 * Compte de 0 jusqu'au nombre trouvé dans le texte (ex. "100%")
 * quand l'élément entre dans le viewport. Compatible CMS : le texte
 * d'origine est préservé, seul le nombre défile. Sans chiffre :
 * simple fondu.
 *
 * @example
 * <AnimeCountUp className="stat">100%</AnimeCountUp>
 */
export function AnimeCountUp({
  children,
  className,
  style,
  duration = 1400,
  ease = "outExpo",
}: AnimeCountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || shouldSkipAnimation()) return;

    const original = el.textContent ?? "";
    const match = original.match(/\d[\d\s]*/);

    const play = () => animation.play();
    let animation: { play: () => void; revert: () => void };

    if (!match) {
      set(el, { opacity: 0 });
      animation = animate(el, {
        opacity: [0, 1],
        duration: 600,
        ease,
        autoplay: false,
      });
    } else {
      const target = parseInt(match[0].replace(/\s/g, ""), 10);
      const counter = { v: 0 };
      el.textContent = original.replace(match[0], "0");
      animation = animate(counter, {
        v: target,
        duration,
        ease,
        autoplay: false,
        onUpdate: () => {
          el.textContent = original.replace(match[0], String(Math.round(counter.v)));
        },
      });
    }

    if (!("IntersectionObserver" in window)) {
      play();
      return () => {
        animation.revert();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          play();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      animation.revert();
    };
  }, [duration, ease]);

  return (
    <span ref={ref} className={className} style={style}>
      {children}
    </span>
  );
}
