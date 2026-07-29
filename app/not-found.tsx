import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 text-[#172b44]">404 - Page Introuvable</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="bg-[#172b44] text-white px-8 py-3 rounded-full font-medium transition-transform hover:scale-105 active:scale-95"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
