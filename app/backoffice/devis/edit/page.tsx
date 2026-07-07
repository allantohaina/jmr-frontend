"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EditDevisSection } from "../../../components/admin/edit-devis-section";

function EditDevisPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  if (!id) {
    return (
      <div className="px-12 py-10 text-[#e5ad46]">
        <p className="text-xs font-bold uppercase tracking-[0.3em]">Devis introuvable</p>
      </div>
    );
  }

  return <EditDevisSection id={id} />;
}

export default function EditDevisPage() {
  return (
    <Suspense>
      <EditDevisPageContent />
    </Suspense>
  );
}
