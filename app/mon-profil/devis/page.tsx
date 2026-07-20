"use client";

import { useEffect, useState } from "react";
import { MonProfilComponents } from "@/app/components";
import { getUser } from "@/app/lib/auth";
import type { QuoteRecord } from "@/app/lib/api";

export default function DevisPage() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const user = getUser();

    if (!user) {
      window.location.replace("/mon-profil?next=/mon-profil/devis");
      return;
    }

    if (mounted) {
      setQuotes([]);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Mes devis</h1>
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <MonProfilComponents.DevisSection quotes={quotes} />
      )}
    </div>
  );
}
