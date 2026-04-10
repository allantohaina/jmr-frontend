import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "surface-container-high": "#25303a",
        "primary-fixed-dim": "#eccc90",
        "surface-dim": "#1e2a38",
        "on-tertiary-fixed-variant": "#e5ad46",
        "secondary-container": "#25303a",
        "outline": "#eccc90",
        "on-tertiary-fixed": "#eccc90",
        "tertiary-fixed": "#eccc90",
        "on-background": "#e5ad46",
        "surface-container-lowest": "#25303a",
        "on-surface-variant": "#eccc90",
        "surface-container": "#25303a",
        "on-surface": "#e5ad46",
        "tertiary-container": "#25303a",
        "secondary-fixed-dim": "#25303a",
        "surface-variant": "#25303a",
        "surface-tint": "#e5ad46",
        "surface-container-highest": "#25303a",
        "inverse-on-surface": "#eccc90",
        "secondary-fixed": "#25303a",
        "surface": "#25303a",
        "inverse-primary": "#1e2a38",
        "tertiary-fixed-dim": "#eccc90",
        "primary-fixed": "#25303a",
        "on-primary-container": "#25303a",
        "on-secondary-fixed": "#eccc90",
        "on-primary-fixed": "#eccc90",
        "error": "#ff6b6b",
        "tertiary": "#e5ad46",
        "on-secondary-fixed-variant": "#eccc90",
        "on-secondary-container": "#eccc90",
        "background": "#1e2a38",
        "surface-container-low": "#25303a",
        "on-error-container": "#2a1a1a",
        "secondary": "#e5ad46",
        "on-primary": "#1e2a38",
        "on-tertiary-container": "#1e2a38",
        "on-primary-fixed-variant": "#25303a",
        "outline-variant": "#25303a",
        "primary": "#e5ad46",
        "on-tertiary": "#1e2a38",
        "error-container": "#2a1a1a",
        "surface-bright": "#25303a",
        "on-error": "#ff6b6b",
        "primary-container": "#25303a",
        "on-secondary": "#1e2a38",
        "inverse-surface": "#eccc90"
      },
      fontFamily: {
        "headline": ["var(--font-noto-serif)"],
        "body": ["var(--font-manrope)"],
        "label": ["var(--font-manrope)"]
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
