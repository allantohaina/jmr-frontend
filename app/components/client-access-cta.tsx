"use client";

import Link from "next/link";
import { useLocale } from "@/app/components/locale-provider";

export function ClientAccessCta() {
  const { locale, messages } = useLocale();
  const isEn = locale === "en";

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[#1e2a38]/70">
        {isEn ? "Client area" : "Espace client"}
      </p>
      <h2 className="font-headline text-3xl font-bold text-[#1e2a38] md:text-5xl">
        {messages.auth.title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#1e2a38]/75">
        {messages.auth.subtitle}
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/login"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#1e2a38] px-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#FFB42D] shadow-xl transition-all hover:bg-[#141e2e] sm:w-auto"
        >
          {messages.auth.loginTitle}
        </Link>
        <Link
          href="/login?tab=signup"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-[#1e2a38]/30 px-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#1e2a38] transition-all hover:border-[#1e2a38] hover:bg-[#1e2a38]/5 sm:w-auto"
        >
          {messages.auth.signupButton}
        </Link>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] sm:flex-row sm:gap-6">
        <Link href="/demande-devis" className="text-[#1e2a38]/70 underline-offset-4 transition-colors hover:text-[#1e2a38] hover:underline">
          {isEn ? "Request a quote" : "Demander un devis"}
        </Link>
        <Link href="/suivi-projet" className="text-[#1e2a38]/70 underline-offset-4 transition-colors hover:text-[#1e2a38] hover:underline">
          {isEn ? "Track a project" : "Suivre un projet"}
        </Link>
      </div>
    </div>
  );
}
