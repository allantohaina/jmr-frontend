"use client";

import { useEffect, useState } from "react";
import {
  NotificationsSection,
  ClientAccessCta,
  HeroSection,
  ServicesSection,
  AboutSection,
} from "@/app/components";
import { HomeShowcase } from "@/app/components/home-showcase";
import { getUser, getToken } from "@/app/lib/auth";
import Link from "next/link";
import { useLocale } from "@/app/components/locale-provider";
import { AnimeReveal, AnimeFloat } from "@/app/components/anime-reveal";
import { signOutClient } from "@/app/lib/auth-client";
import { authAPI, type UserProfile } from "@/app/lib/api";
import { TEXTILE_PROBLEM_THREADS } from "@/app/lib";

function SignedInPanel({ firstName }: { firstName: string }) {
  const { messages } = useLocale();
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[#1e2a38]/70">
        {messages.auth.memberEyebrow}
      </p>
      <h2 className="font-headline text-3xl font-bold text-[#1e2a38] md:text-5xl">
        {messages.auth.memberTitle}{firstName ? `, ${firstName}` : ""}.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#1e2a38]/75">
        {messages.auth.memberText}
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/demande-devis"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#1e2a38] px-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#EAA100] shadow-xl transition-all hover:bg-[#161D30] sm:w-auto"
        >
          {messages.auth.ctaRequest}
        </Link>
        <Link
          href="/mon-profil"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-[#1e2a38]/30 px-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#1e2a38] transition-all hover:border-[#1e2a38] hover:bg-[#1e2a38]/5 sm:w-auto"
        >
          {messages.auth.memberSpace}
        </Link>
      </div>
    </div>
  );
}

export function HomePageClient() {  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    const token = getToken();
    const storedUser = getUser() as UserProfile | null;

    if (!token) {
      if (storedUser) signOutClient();
      setUser(null);
      return;
    }

    if (storedUser) {
      authAPI.getProfile(token).then((res) => {
        setUser(res.data);
      }).catch(() => {
        signOutClient();
        setUser(null);
      });
    } else {
      setUser(null);
    }
  }, []);

  const isSignedIn = isMounted && !!user;
  const hasNotifications = TEXTILE_PROBLEM_THREADS.length > 0;
  const firstName = (user?.first_name ?? "").trim();

  return (
    <div className="home-page">
      <HeroSection />

      <ServicesSection />

      <AboutSection />

      <section className="px-6 md:px-12 py-16 md:py-20 max-w-[1440px] mx-auto" data-nav-section="acces-client" id="acces-client">
        <AnimeReveal className="home-page__client-access bg-primary rounded-[2rem] md:rounded-[3rem] overflow-hidden relative p-6 sm:p-10 md:p-16 lg:p-24 text-center shadow-2xl shadow-primary/40">
          <AnimeFloat className="absolute inset-0 opacity-10 pointer-events-none" amplitude={14} duration={3600}>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#EAA100,_transparent)]"></div>
          </AnimeFloat>
          <div className="relative z-10">
            {isSignedIn && hasNotifications ? (
              <NotificationsSection user={user} />
            ) : isSignedIn ? (
              <SignedInPanel firstName={firstName} />
            ) : (
              <ClientAccessCta />
            )}
          </div>
        </AnimeReveal>
      </section>

      <HomeShowcase />

    </div>
  );
}
