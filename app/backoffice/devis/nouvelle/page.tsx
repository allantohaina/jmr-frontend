"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CotationTextileSection } from "../../../components/admin/cotation-textile-section";

function NouvelleCotationContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("id") ?? undefined;
  const clientId = searchParams.get("client_id") ?? undefined;
  const name = searchParams.get("name") ?? "";
  const email = searchParams.get("email") ?? "";
  const phone = searchParams.get("phone") ?? "";
  const demandeId = searchParams.get("demande_id") ?? undefined;

  return (
    <div className="px-4 md:px-12 py-8 md:py-10 space-y-6">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#e5ad46]">calculate</span>
        <div>
          <h2 className="font-headline text-2xl md:text-3xl text-white">
            {quoteId ? "Modifier la cotation" : "Nouvelle cotation"}
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#eccc90]/40 mt-1">
            Calcul automatique des prix textile
          </p>
        </div>
      </div>
      <CotationTextileSection quoteId={quoteId} clientId={clientId} initialName={name} initialEmail={email} initialPhone={phone} demandeId={demandeId} />
    </div>
  );
}

export default function NouvelleCotationPage() {
  return (
    <Suspense>
      <NouvelleCotationContent />
    </Suspense>
  );
}