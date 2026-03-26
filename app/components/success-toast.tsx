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
      <div className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-medium text-white shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {message}
      </div>
    </div>
  );
}
