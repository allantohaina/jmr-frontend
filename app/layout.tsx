import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import {
  ScrollReveal,
  Navbar,
  Footer,
  LocaleProvider,
  SuccessToast,
  ToastProvider,
  VisitorTracker,
} from "@/app/components";
import { getCurrentUser, getIsSignedIn } from "@/app/lib/auth-server";
import { getMessages, LOCALE_COOKIE_NAME, parseLocaleValue } from "@/app/lib/locale";
import { parseThemeValue, THEME_COOKIE_NAME } from "@/app/lib/theme";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "JMR Textile",
  description: "Suivi de projet, services et accompagnement textile.",
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
  const cookieStore = await cookies();
  const cookieTheme = parseThemeValue(cookieStore.get(THEME_COOKIE_NAME)?.value);
  const initialLocale = parseLocaleValue(cookieStore.get(LOCALE_COOKIE_NAME)?.value) ?? "fr";
  const initialTheme = cookieTheme ?? "dark";
  const messages = getMessages(initialLocale);
  const user = await getCurrentUser();
  const isSignedIn = !!user || (await getIsSignedIn());
  const userFirstName = typeof user?.first_name === "string" ? user.first_name : undefined;
  const userRole = typeof user?.role === "string" ? user.role : undefined;

  return (
    <html
      lang={initialLocale}
      data-theme={initialTheme}
      style={{ colorScheme: initialTheme }}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var cookieTheme = ${cookieTheme ? `'${cookieTheme}'` : "null"};
                  var storedTheme = localStorage.getItem('${THEME_COOKIE_NAME}');
                  var theme = cookieTheme === 'light' || cookieTheme === 'dark'
                    ? cookieTheme
                    : (storedTheme === 'light' || storedTheme === 'dark'
                    ? storedTheme
                    : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
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
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Inter:wght@100..900&family=Manrope:wght@200;300;400;500;600&family=Noto+Serif:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Playfair+Display:wght@400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <LocaleProvider initialLocale={initialLocale}>
          <ToastProvider>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
            <a className="skip-link" href="#main-content">
              {messages.common.skipToContent}
            </a>
            <header className="site-header">
              <Navbar
                isSignedIn={isSignedIn}
                userFirstName={userFirstName}
                userRole={userRole}
                initialTheme={initialTheme}
              />
            </header>
            <main id="main-content" className="bg-background text-on-background antialiased selection:bg-orange-200 font-body">
              {children}
            </main>
            <VisitorTracker />
            <Suspense>
              <SuccessToast />
            </Suspense>
            <ScrollReveal />
            <Footer />
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
