"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientDevisPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/backoffice/devis"); }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#EAA100]/60">
      Redirection vers les devis…
    </div>
  );
}
