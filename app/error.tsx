"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for the dev
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">Oups, quelque chose s&apos;est mal passé !</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Une erreur est survenue lors de l&apos;accès à cette page. Nous nous excusons pour ce désagrément.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-[#163526] text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-orange-500 transition-all"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="bg-white border border-[#163526]/10 text-[#163526] px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#163526]/5 transition-all"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
