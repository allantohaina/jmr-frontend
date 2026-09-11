import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "surface-container-high": "#25303a",
        "primary-fixed-dim": "#FFB42D",
        "surface-dim": "#1e2a38",
        "on-tertiary-fixed-variant": "#FFB42D",
        "secondary-container": "#25303a",
        "outline": "#FFB42D",
        "on-tertiary-fixed": "#FFB42D",
        "tertiary-fixed": "#FFB42D",
        "on-background": "#FFB42D",
        "surface-container-lowest": "#25303a",
        "on-surface-variant": "#FFB42D",
        "surface-container": "#25303a",
        "on-surface": "#FFB42D",
        "tertiary-container": "#25303a",
        "secondary-fixed-dim": "#25303a",
        "surface-variant": "#25303a",
        "surface-tint": "#FFB42D",
        "surface-container-highest": "#25303a",
        "inverse-on-surface": "#FFB42D",
        "secondary-fixed": "#25303a",
        "surface": "#25303a",
        "inverse-primary": "#1e2a38",
        "tertiary-fixed-dim": "#FFB42D",
        "primary-fixed": "#25303a",
        "on-primary-container": "#25303a",
        "on-secondary-fixed": "#FFB42D",
        "on-primary-fixed": "#FFB42D",
        "error": "#ff6b6b",
        "tertiary": "#FFB42D",
        "on-secondary-fixed-variant": "#FFB42D",
        "on-secondary-container": "#FFB42D",
        "background": "#1e2a38",
        "surface-container-low": "#25303a",
        "on-error-container": "#2a1a1a",
        "secondary": "#FFB42D",
        "on-primary": "#1e2a38",
        "on-tertiary-container": "#1e2a38",
        "on-primary-fixed-variant": "#25303a",
        "outline-variant": "#25303a",
        "primary": "#FFB42D",
        "on-tertiary": "#1e2a38",
        "error-container": "#2a1a1a",
        "surface-bright": "#25303a",
        "on-error": "#ff6b6b",
        "primary-container": "#25303a",
        "on-secondary": "#1e2a38",
        "inverse-surface": "#FFB42D"
      },
      fontFamily: {
        "headline": ["var(--font-noto-serif)"],
        "body": ["var(--font-manrope)"],
        "label": ["var(--font-manrope)"],
        "brand": ["Fraunces", "Georgia", "serif"]
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
