"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/app/components/locale-provider";
import { getToken } from "@/app/lib/auth";

export function ClientAccessCta() {
  const { locale, messages } = useLocale();
  const isEn = locale === "en";
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const sync = () => setIsSignedIn(!!getToken());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("jmr-auth-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("jmr-auth-changed", sync);
    };
  }, []);

  // Connecté : l'appel "demande de devis" devient l'espace client
  // (formulaire de devis + suivi au même endroit, plus de doublon).
  if (isSignedIn) {
    return (
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#EAA100]/25 bg-brand-card p-8 text-center shadow-2xl sm:p-12">
        <p className="mb-3 text-label font-bold uppercase tracking-[0.3em] text-[#EAA100]">
          {isEn ? "Client area" : "Espace client"}
        </p>
        <h2 className="font-headline text-3xl font-bold text-[#FFF8EC] md:text-5xl">
          {messages.auth.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#B9C3D0]">
          {messages.auth.subtitle}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/mon-profil"
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#EAA100] px-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#1B2436] shadow-xl transition-all hover:brightness-110 sm:w-auto"
          >
            {isEn ? "My client space" : "Mon espace client"}
          </Link>
          <Link
            href="/demande-devis"
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-white/20 px-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#FFF8EC] transition-all hover:border-[#EAA100] hover:text-[#EAA100] sm:w-auto"
          >
            {messages.auth.ctaRequest}
          </Link>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] sm:flex-row sm:gap-6">
          <Link href="/suivi-projet" className="text-[#8B94A3] underline-offset-4 transition-colors hover:text-[#EAA100] hover:underline">
            {isEn ? "Track a project" : "Suivre un projet"}
          </Link>
        </div>
      </div>
    );
  }

  // Non connecté : une seule porte d'entrée vers le devis via le login.
  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#EAA100]/25 bg-brand-card p-8 text-center shadow-2xl sm:p-12">
      <p className="mb-3 text-label font-bold uppercase tracking-[0.3em] text-[#EAA100]">
        {isEn ? "Client area" : "Espace client"}
      </p>
      <h2 className="font-headline text-3xl font-bold text-[#FFF8EC] md:text-5xl">
        {messages.auth.title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#B9C3D0]">
        {messages.auth.subtitle}
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={`/login?next=${encodeURIComponent("/demande-devis")}`}
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#EAA100] px-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#1B2436] shadow-xl transition-all hover:brightness-110 sm:w-auto"
        >
          {messages.auth.ctaRequest}
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-white/20 px-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#FFF8EC] transition-all hover:border-[#EAA100] hover:text-[#EAA100] sm:w-auto"
        >
          {messages.auth.loginButton}
        </Link>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] sm:flex-row sm:gap-6">
        <Link href="/login?tab=signup" className="text-[#8B94A3] underline-offset-4 transition-colors hover:text-[#EAA100] hover:underline">
          {messages.auth.signupButton}
        </Link>
        <Link href="/suivi-projet" className="text-[#8B94A3] underline-offset-4 transition-colors hover:text-[#EAA100] hover:underline">
          {isEn ? "Track a project" : "Suivre un projet"}
        </Link>
      </div>
    </div>
  );
}
