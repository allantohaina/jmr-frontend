"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PaiementSection } from "../../../components/mon-profil/paiement-section";

function PaiementPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  if (!id) {
    return (
      <div className="min-h-screen bg-[#1e2a38] px-6 py-32 text-center text-[#e5ad46]">
        <p className="text-xs font-bold uppercase tracking-[0.3em]">Devis introuvable</p>
      </div>
    );
  }

  return <PaiementSection id={id} />;
}

export default function PaiementPage() {
  return (
    <Suspense>
      <PaiementPageContent />
    </Suspense>
  );
}
