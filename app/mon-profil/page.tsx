"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthAccessSection, MonProfilSection } from "@/app/components";
import { authAPI, getSafeRedirectPath, getToken, type UserProfile } from "@/app/lib";

export default function MonProfilPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    return getSafeRedirectPath(new URLSearchParams(window.location.search).get("next"));
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const token = getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      if (nextPath) {
        window.location.assign(nextPath);
        return;
      }

      try {
        const response = await authAPI.getProfile(token);
        if (mounted) {
          setUser(response.data);
        }
      } catch (loadError) {
        console.error("Failed to fetch profile:", loadError);
        if (mounted) {
          setError("auth_failed");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [nextPath]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e2a38] text-[#e5ad46]">
        <span className="text-xs font-bold uppercase tracking-[0.3em]">Chargement...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthAccessSection nextPath={nextPath ?? "/mon-profil"} error={error} />;
  }

  return <MonProfilSection variant="dashboard" user={user} />;
}
