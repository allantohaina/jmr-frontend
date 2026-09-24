import type { Metadata } from "next";
import {
  Fraunces,
  IBM_Plex_Sans,
  Inter,
  JetBrains_Mono,
  Manrope,
  Noto_Serif,
  Playfair_Display,
  Sora,
} from "next/font/google";
import "./globals.css";
import {
  ScrollReveal,
  ClientLayout,
  LocaleProvider,
  SitePreloader,
  SuccessToast,
  ToastProvider,
  VisitorTracker,
} from "@/app/components";
import { getMessages } from "@/app/lib/locale";
import { SiteContentProvider } from "@/app/lib/site-content";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "JMR Textile",
  description: "Suivi de projet, services et accompagnement textile.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/web-app-manifest-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/web-app-manifest-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
} as const;

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-manrope",
});

const notoSerif = Noto_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-noto-serif",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-brand",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-jbmono",
});

const fontVariables = [
  manrope.variable,
  notoSerif.variable,
  ibmPlexSans.variable,
  sora.variable,
  inter.variable,
  playfair.variable,
  fraunces.variable,
  jetbrainsMono.variable,
].join(" ");

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = "fr";
  const messages = getMessages(initialLocale);
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.jmrtextile.com/api";
  const apiOrigin = new URL(configuredApiUrl).origin;

  return (
    <html
      lang={initialLocale}
      data-theme="dark"
      className={fontVariables}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <meta httpEquiv="Content-Security-Policy" content={`default-src 'self'; connect-src 'self' ${apiOrigin} https://cloudflareinsights.com; img-src 'self' data: ${apiOrigin}; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://static.cloudflareinsights.com; frame-src 'none'; object-src 'none'; base-uri 'self'`} />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), interest-cohort=()" />
        <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload" />
        <link rel="preload" as="image" href="/human_images/08_salle_machines_coudre.webp" fetchPriority="high" />
      </head>
      <body>
        <LocaleProvider initialLocale={initialLocale}>
          <SiteContentProvider>
          <ToastProvider>
            <a className="skip-link" href="#main-content">
              {messages.common.skipToContent}
            </a>
            <SitePreloader />
            <ClientLayout>
              {children}
            </ClientLayout>
            <VisitorTracker />
            <Suspense>
              <SuccessToast />
            </Suspense>
            <ScrollReveal />
          </ToastProvider>
          </SiteContentProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
