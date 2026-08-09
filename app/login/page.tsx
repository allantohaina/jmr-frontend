"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthAccessSection } from "@/app/components";
import { getSafeRedirectPath, getToken } from "@/app/lib";

function isStaffSubdomain(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host.startsWith("admin.") || host.startsWith("worker.");
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true);

  const redirectPath = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    return getSafeRedirectPath(params.get("redirect")) ?? getSafeRedirectPath(params.get("next")) ?? "/mon-profil";
  }, []);

  useEffect(() => {
    if (isStaffSubdomain()) {
      window.location.replace("/login/staff");
      return;
    }

    const token = getToken();
    if (token && redirectPath && redirectPath !== "/mon-profil") {
      window.location.assign(redirectPath);
      return;
    }
    setIsLoading(false);
  }, [redirectPath]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e2a38] text-[#e5ad46]">
        <span className="text-xs font-bold uppercase tracking-[0.3em]">Chargement...</span>
      </div>
    );
  }

  return <AuthAccessSection nextPath={redirectPath ?? "/mon-profil"} />;
}
