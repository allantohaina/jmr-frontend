import type { Metadata } from "next";
import "./globals.css";
import {
  ScrollReveal,
  Navbar,
  Footer,
  SuccessToast,
  ToastProvider,
  VisitorTracker,
} from "@/app/components";
import { getCurrentUser, getIsSignedIn } from "@/app/lib/auth-server";
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
  const user = await getCurrentUser();
  const isSignedIn = !!user || (await getIsSignedIn());
  const userFirstName = typeof user?.first_name === "string" ? user.first_name : undefined;
  const userRole = typeof user?.role === "string" ? user.role : undefined;

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Inter:wght@100..900&family=Manrope:wght@200;300;400;500;600&family=Noto+Serif:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Playfair+Display:wght@400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <ToastProvider>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
          <a className="skip-link" href="#main-content">
            Aller au contenu
          </a>
          <header className="site-header">
            <Navbar isSignedIn={isSignedIn} userFirstName={userFirstName} userRole={userRole} />
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
      </body>
    </html>
  );
}
