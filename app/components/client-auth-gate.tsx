"use client";

import { useEffect, useState } from "react";
import { authAPI, type UserProfile } from "@/app/lib/api";
import { getToken, getUser } from "@/app/lib/auth";

type ClientAuthGateProps = {
  allowedRoles?: string[];
  redirectTo?: string;
  children: React.ReactNode | ((user: UserProfile) => React.ReactNode);
};

export function ClientAuthGate({
  allowedRoles,
  redirectTo = "/",
  children,
}: ClientAuthGateProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const storedUser = getUser();
      const token = getToken();

      if (!storedUser || !token) {
        window.location.replace(redirectTo);
        return;
      }

      try {
        const response = await authAPI.getProfile(token);
        const verifiedUser = response.data ?? storedUser;

        if (allowedRoles?.length && !allowedRoles.includes(String(verifiedUser.role))) {
          window.location.replace(verifiedUser.role === "worker" ? "/atelier" : redirectTo);
          return;
        }

        if (mounted) {
          setUser(verifiedUser);
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        window.location.replace(redirectTo);
      }
    }

    verifySession();

    return () => {
      mounted = false;
    };
  }, [allowedRoles, redirectTo]);

  if (isChecking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e2a38] text-[#e5ad46]">
        <span className="text-xs font-bold uppercase tracking-[0.3em]">Verification...</span>
      </div>
    );
  }

  return <>{typeof children === "function" ? children(user) : children}</>;
}
