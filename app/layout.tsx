import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Serif, Manrope } from "next/font/google";
import { IBM_Plex_Sans, Sora } from "next/font/google";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});
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

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

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
      <body className={`${ibmPlexSans.variable} ${sora.variable} ${inter.variable} ${playfairDisplay.variable} ${notoSerif.variable} ${manrope.variable}`}>
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
