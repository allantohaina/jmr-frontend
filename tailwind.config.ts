import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "surface-container-high": "#e9e8e3",
        "primary-fixed-dim": "#accfb8",
        "surface-dim": "#dbdad5",
        "on-tertiary-fixed-variant": "#5d4201",
        "secondary-container": "#e4e2e1",
        "outline": "#727973",
        "on-tertiary-fixed": "#261900",
        "tertiary-fixed": "#ffdea5",
        "on-background": "#1b1c19",
        "surface-container-lowest": "#ffffff",
        "on-surface-variant": "#424843",
        "surface-container": "#efeee9",
        "on-surface": "#1b1c19",
        "tertiary-container": "#5c4100",
        "secondary-fixed-dim": "#c8c6c6",
        "surface-variant": "#e3e3de",
        "surface-tint": "#466553",
        "surface-container-highest": "#e3e3de",
        "inverse-on-surface": "#f2f1ec",
        "secondary-fixed": "#e4e2e1",
        "surface": "#faf9f4",
        "inverse-primary": "#accfb8",
        "tertiary-fixed-dim": "#e9c176",
        "primary-fixed": "#c7ebd4",
        "on-primary-container": "#99bca6",
        "on-secondary-fixed": "#1b1c1c",
        "on-primary-fixed": "#012113",
        "error": "#ba1a1a",
        "tertiary": "#402c00",
        "on-secondary-fixed-variant": "#474747",
        "on-secondary-container": "#656464",
        "background": "#faf9f4",
        "surface-container-low": "#f5f4ef",
        "on-error-container": "#93000a",
        "secondary": "#5f5e5e",
        "on-primary": "#ffffff",
        "on-tertiary-container": "#d4ae66",
        "on-primary-fixed-variant": "#2e4d3c",
        "outline-variant": "#c2c8c1",
        "primary": "#163526",
        "on-tertiary": "#ffffff",
        "error-container": "#ffdad6",
        "surface-bright": "#faf9f4",
        "on-error": "#ffffff",
        "primary-container": "#2d4c3b",
        "on-secondary": "#ffffff",
        "inverse-surface": "#30312e"
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
