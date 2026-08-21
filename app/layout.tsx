import type { Metadata } from "next";
import "./globals.css";
import {
  ScrollReveal,
  ClientLayout,
  LocaleProvider,
  SuccessToast,
  ToastProvider,
  VisitorTracker,
} from "@/app/components";
import { getMessages } from "@/app/lib/locale";
import { THEME_COOKIE_NAME } from "@/app/lib/theme";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = "fr";
  const initialTheme = "dark";
  const messages = getMessages(initialLocale);
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.jmrtextile.com/api";
  const apiOrigin = new URL(configuredApiUrl).origin;

  return (
    <html
      lang={initialLocale}
      data-theme={initialTheme}
      style={{ colorScheme: initialTheme }}
      suppressHydrationWarning
    >
      <head>
        <meta httpEquiv="Content-Security-Policy" content={`default-src 'self'; connect-src 'self' ${apiOrigin}; img-src 'self' data: ${apiOrigin}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; frame-src 'none'; object-src 'none'; base-uri 'self'`} />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), interest-cohort=()" />
        <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('${THEME_COOKIE_NAME}');
                  var theme = storedTheme === 'light' || storedTheme === 'dark'
                    ? storedTheme
                    : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch (error) {
                  document.documentElement.dataset.theme = '${initialTheme}';
                  document.documentElement.style.colorScheme = '${initialTheme}';
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Inter:wght@100..900&family=Manrope:wght@200;300;400;500;600&family=Noto+Serif:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Playfair+Display:wght@400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body>
        <LocaleProvider initialLocale={initialLocale}>
          <ToastProvider>
            <a className="skip-link" href="#main-content">
              {messages.common.skipToContent}
            </a>
            <ClientLayout initialTheme={initialTheme}>
              {children}
            </ClientLayout>
            <VisitorTracker />
            <Suspense>
              <SuccessToast />
            </Suspense>
            <ScrollReveal />
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
