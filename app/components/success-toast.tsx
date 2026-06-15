"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const success = searchParams.get("success");
  const message =
    success === "signup"
      ? "Inscription effectuee avec succes !"
      : success === "login"
        ? "Connexion effectuee !"
        : "";

  useEffect(() => {
    if (!success) {
      return;
    }

    const accesClientSection = document.getElementById("acces-client");
    if (accesClientSection) {
      accesClientSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}#acces-client` : `${pathname}#acces-client`;
      router.replace(newUrl, { scroll: false });
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, searchParams, router, pathname]);

  if (!success || !message) {
    return null;
  }

  return (
    <div className="fixed bottom-10 left-1/2 z-[9999] -translate-x-1/2 animate-toast-up">
      <div className="flex items-center gap-4 rounded-full bg-[#e5ad46] px-8 py-4 font-bold text-[#1e2a38] shadow-2xl shadow-[#e5ad46]/20 border border-[#eccc90]/20 backdrop-blur-md">
        <div className="w-6 h-6 rounded-full bg-[#1e2a38]/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <span className="text-xs uppercase tracking-[0.1em]">{message}</span>
      </div>
    </div>
  );
}
