"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProformaSection } from "../../../components/admin/proforma-section";

function ProformaPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  if (!id) {
    return (
      <div className="px-4 md:px-12 py-6 md:py-10 text-[#FFB42D]">
        <p className="text-xs font-bold uppercase tracking-[0.3em]">Devis introuvable</p>
      </div>
    );
  }

  return <ProformaSection id={id} />;
}

export default function ProformaPage() {
  return (
    <Suspense>
      <ProformaPageContent />
    </Suspense>
  );
}
