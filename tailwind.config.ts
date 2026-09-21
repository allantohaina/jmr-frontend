import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ===== SYSTÈME COULEUR JMR (référence unique — ne pas ajouter de hex en dur) =====
        // Brand : primary #EAA100 (CTA, actif) / vivid #F5C518 (pastilles, focus)
        //         deep #B57E03 (grandes surfaces) / on-primary #1B2436 (texte sur doré)
        // Tertiary (accents chauds) : #F26419 — secondary + hover des CTA dorés
        // Surfaces sombres : abyss #0A0E19 / ink #1E2A38 (fond, JAMAIS en card) /
        //                    TOUTES les cards #161D30 (card = raised = deep, aucune variante)
        // Textes sur sombre : cream #FFF8EC (titres) / muted #B9C3D0 / faint #8B94A3
        // Papiers clairs : ink #172D42 / soft #40566A / muted #6F8292 (JAMAIS sur sombre)
        // Sémantique : success #1F8457 (+bright #5CB87D) / danger #E05252
        //             (+deep #B14255, +soft #F3A3A6) / warning amber-400
        //             / info #5C9AD9 / violet #8B7BD4 / status-orange #E08B52
        brand: {
          primary: "#EAA100",
          vivid: "#F5C518",
          deep: "#B57E03",
          "on-primary": "#1B2436",
          tertiary: "#F26419",
          abyss: "#0A0E19",
          ink: "#1E2A38",
          card: "#161D30",
          raised: "#161D30",
          inkdeep: "#161D30",
          cream: "#FFF8EC",
          muted: "#B9C3D0",
          faint: "#8B94A3",
          paperink: "#172D42",
          papersoft: "#40566A",
          papermuted: "#6F8292",
          paper: "#FAF6EC",
          success: "#1F8457",
          "success-bright": "#5CB87D",
          danger: "#E05252",
          "danger-deep": "#B14255",
          "danger-soft": "#F3A3A6",
          info: "#5C9AD9",
          violet: "#8B7BD4",
          embersoft: "#E08B52",
        },
        // ===== Anciens tokens (compatibilité — valeurs recalées sur le système) =====
        "surface-container-high": "#161D30",
        "primary-fixed-dim": "#EAA100",
        "surface-dim": "#1E2A38",
        "on-tertiary-fixed-variant": "#FFF8EC",
        "secondary-container": "#161D30",
        "outline": "#EAA100",
        "on-tertiary-fixed": "#1B2436",
        "tertiary-fixed": "#F26419",
        "on-background": "#EDF2F7",
        "surface-container-lowest": "#161D30",
        "on-surface-variant": "#B9C3D0",
        "surface-container": "#161D30",
        "on-surface": "#FFF8EC",
        "tertiary-container": "#161D30",
        "secondary-fixed-dim": "#161D30",
        "surface-variant": "#161D30",
        "surface-tint": "#EAA100",
        "surface-container-highest": "#161D30",
        "inverse-on-surface": "#EAA100",
        "secondary-fixed": "#86BBD8",
        "surface": "#161D30",
        "inverse-primary": "#1E2A38",
        "tertiary-fixed-dim": "#F26419",
        "primary-fixed": "#161D30",
        "on-primary-container": "#161D30",
        "on-secondary-fixed": "#1B2436",
        "on-primary-fixed": "#FFF8EC",
        "error": "#E05252",
        "tertiary": "#86BBD8",
        "on-secondary-fixed-variant": "#FFF8EC",
        "on-secondary-container": "#EAA100",
        "background": "#1E2A38",
        "surface-container-low": "#161D30",
        "on-error-container": "#2a1a1a",
        "secondary": "#F26419",
        "on-primary": "#1B2436",
        "on-tertiary-container": "#1B2436",
        "on-primary-fixed-variant": "#161D30",
        "outline-variant": "#161D30",
        "primary": "#EAA100",
        "on-tertiary": "#1B2436",
        "error-container": "#2a1a1a",
        "surface-bright": "#161D30",
        "on-error": "#FFF8EC",
        "primary-container": "#161D30",
        "on-secondary": "#1B2436",
        "inverse-surface": "#EAA100"
      },
      fontFamily: {
        // Familles : headline = Noto Serif (titres UI) / body+label = Manrope (textes, labels)
        //            brand = Fraunces (wordmark, éditorial) / mono = JetBrains Mono (chiffres, refs, code)
        //            serif (Georgia, défaut Tailwind) = documents/papiers uniquement
        "headline": ["var(--font-noto-serif)"],
        "body": ["var(--font-manrope)"],
        "label": ["var(--font-manrope)"],
        "brand": ["var(--font-brand)", "Georgia", "serif"],
        "mono": ["var(--font-jbmono)", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      // Échelle typo : micro 9 (mini-badges) / caption 10 (eyebrows, en-têtes) /
      // label 11 (labels champs, meta) / body-sm 12 / body 13 (texte dense) /
      // body-lg 14 (inputs, paragraphes) / title-sm 15 / title 17 / title-lg 20 / title-xl 22
      // ≥24px ou clamp() = display au cas par cas. Graisses : 800 display, 700 actions/labels,
      // 600 titres, 500 medium, 400 texte courant.
      fontSize: {
        "micro": "9px",
        "caption": "10px",
        "label": "11px",
        "body-sm": "12px",
        "body": "13px",
        "body-lg": "14px",
        "title-sm": "15px",
        "title": "17px",
        "title-lg": "20px",
        "title-xl": "22px",
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};

export default config;
