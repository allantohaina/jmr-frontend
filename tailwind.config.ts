import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "surface-container-high": "#25303a",
        "primary-fixed-dim": "#F5A623",
        "surface-dim": "#1e2a38",
        "on-tertiary-fixed-variant": "#F5A623",
        "secondary-container": "#25303a",
        "outline": "#F5A623",
        "on-tertiary-fixed": "#F5A623",
        "tertiary-fixed": "#F5A623",
        "on-background": "#F5A623",
        "surface-container-lowest": "#25303a",
        "on-surface-variant": "#F5A623",
        "surface-container": "#25303a",
        "on-surface": "#F5A623",
        "tertiary-container": "#25303a",
        "secondary-fixed-dim": "#25303a",
        "surface-variant": "#25303a",
        "surface-tint": "#F5A623",
        "surface-container-highest": "#25303a",
        "inverse-on-surface": "#F5A623",
        "secondary-fixed": "#25303a",
        "surface": "#25303a",
        "inverse-primary": "#1e2a38",
        "tertiary-fixed-dim": "#F5A623",
        "primary-fixed": "#25303a",
        "on-primary-container": "#25303a",
        "on-secondary-fixed": "#F5A623",
        "on-primary-fixed": "#F5A623",
        "error": "#ff6b6b",
        "tertiary": "#F5A623",
        "on-secondary-fixed-variant": "#F5A623",
        "on-secondary-container": "#F5A623",
        "background": "#1e2a38",
        "surface-container-low": "#25303a",
        "on-error-container": "#2a1a1a",
        "secondary": "#F5A623",
        "on-primary": "#1e2a38",
        "on-tertiary-container": "#1e2a38",
        "on-primary-fixed-variant": "#25303a",
        "outline-variant": "#25303a",
        "primary": "#F5A623",
        "on-tertiary": "#1e2a38",
        "error-container": "#2a1a1a",
        "surface-bright": "#25303a",
        "on-error": "#ff6b6b",
        "primary-container": "#25303a",
        "on-secondary": "#1e2a38",
        "inverse-surface": "#F5A623"
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
