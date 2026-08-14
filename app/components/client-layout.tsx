"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ConsentBanner } from "./consent-banner";
import type { ThemeName } from "@/app/lib/theme";

const AUTH_PATHS = ["/admin-login", "/worker-login", "/login", "/login/staff"];

export function ClientLayout({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: ThemeName;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="site-header">
        <Navbar initialTheme={initialTheme} />
      </header>
      <main id="main-content" className="bg-background text-on-background antialiased selection:bg-orange-200 font-body">
        {children}
      </main>
      <Footer />
      <ConsentBanner />
    </>
  );
}
