"use client";

import { useEffect, useState } from "react";
import { MonProfilComponents } from "@/app/components";
import { authAPI, getUser, type QuoteRecord } from "@/app/lib";

export default function DevisPage() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadQuotes() {
      const user = getUser();

      if (!user) {
        window.location.replace("/mon-profil?next=/mon-profil/devis");
        return;
      }

      try {
        const response = await authAPI.get<QuoteRecord[]>(`/users/${user.id}/quotes`);
        if (mounted) {
          setQuotes(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch quotes:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadQuotes();

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
