import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "surface-container-high": "#25303a",
        "primary-fixed-dim": "#EAA100",
        "surface-dim": "#1e2a38",
        "on-tertiary-fixed-variant": "#EAA100",
        "secondary-container": "#25303a",
        "outline": "#EAA100",
        "on-tertiary-fixed": "#EAA100",
        "tertiary-fixed": "#EAA100",
        "on-background": "#EAA100",
        "surface-container-lowest": "#25303a",
        "on-surface-variant": "#EAA100",
        "surface-container": "#25303a",
        "on-surface": "#EAA100",
        "tertiary-container": "#25303a",
        "secondary-fixed-dim": "#25303a",
        "surface-variant": "#25303a",
        "surface-tint": "#EAA100",
        "surface-container-highest": "#25303a",
        "inverse-on-surface": "#EAA100",
        "secondary-fixed": "#25303a",
        "surface": "#25303a",
        "inverse-primary": "#1e2a38",
        "tertiary-fixed-dim": "#EAA100",
        "primary-fixed": "#25303a",
        "on-primary-container": "#25303a",
        "on-secondary-fixed": "#EAA100",
        "on-primary-fixed": "#EAA100",
        "error": "#ff6b6b",
        "tertiary": "#EAA100",
        "on-secondary-fixed-variant": "#EAA100",
        "on-secondary-container": "#EAA100",
        "background": "#1e2a38",
        "surface-container-low": "#25303a",
        "on-error-container": "#2a1a1a",
        "secondary": "#EAA100",
        "on-primary": "#1e2a38",
        "on-tertiary-container": "#1e2a38",
        "on-primary-fixed-variant": "#25303a",
        "outline-variant": "#25303a",
        "primary": "#EAA100",
        "on-tertiary": "#1e2a38",
        "error-container": "#2a1a1a",
        "surface-bright": "#25303a",
        "on-error": "#ff6b6b",
        "primary-container": "#25303a",
        "on-secondary": "#1e2a38",
        "inverse-surface": "#EAA100"
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
