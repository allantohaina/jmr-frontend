"use client";

import { useInactivityLogout } from "@/app/lib/use-inactivity-logout";
import { getToken } from "@/app/lib/auth";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function InactivityGuard() {
  const pathname = usePathname();
  const isProtected = useMemo(() => {
    if (!pathname) return false;
    return pathname.startsWith("/backoffice") || pathname.startsWith("/atelier") || pathname.startsWith("/mon-profil");
  }, [pathname]);

  const hasToken = typeof window !== "undefined" ? !!getToken() : false;

  useInactivityLogout({
    enabled: hasToken && isProtected,
    redirectTo: pathname?.startsWith("/backoffice") ? "/admin-login" : pathname?.startsWith("/atelier") ? "/worker-login" : "/login",
  });

  return null;
}
