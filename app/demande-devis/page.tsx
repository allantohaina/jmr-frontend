"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DemandeDevisSection } from "@/app/components";
import { getToken } from "@/app/lib/auth";

export const DEVIS_LOGIN_NEXT = "/demande-devis";

export function getDevisHref(isSignedIn: boolean): string {
  return isSignedIn
    ? "/demande-devis"
    : `/login?next=${encodeURIComponent(DEVIS_LOGIN_NEXT)}`;
}

export default function DemandeDevisPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace(getDevisHref(false));
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e2a38] text-[#EAA100]">
        <span className="text-xs font-bold uppercase tracking-[0.3em]">
          Redirection vers la connexion...
        </span>
      </div>
    );
  }

  return <DemandeDevisSection />;
}
