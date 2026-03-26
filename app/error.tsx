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
          className="bg-[#172b44] text-white px-6 py-2 rounded-full font-medium"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="bg-gray-200 text-[#172b44] px-6 py-2 rounded-full font-medium"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
      
      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 p-4 bg-red-50 text-red-700 text-left rounded-lg overflow-auto max-w-2xl w-full">
          <p className="font-mono text-sm font-bold mb-2">Debug Error Info (Dev Only):</p>
          <pre className="text-xs whitespace-pre-wrap">{error.message}</pre>
          <pre className="text-xs mt-2 text-gray-400">{error.stack}</pre>
        </div>
      )}
    </div>
  );
}
