"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ClientHistorySection } from "@/app/components/admin";

function ClientHistoryPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  if (!id) {
    return (
      <div className="px-4 md:px-12 py-6 md:py-10 text-[#e5ad46]">
        <p className="text-xs font-bold uppercase tracking-[0.3em]">Client introuvable</p>
      </div>
    );
  }

  return <ClientHistorySection clientId={id} />;
}

export default function ClientHistoryPage() {
  return (
    <Suspense>
      <ClientHistoryPageContent />
    </Suspense>
  );
}
