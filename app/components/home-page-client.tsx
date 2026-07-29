"use client";

import { useEffect, useState } from "react";
import {
  NotificationsSection,
  AuthAccessSection,
  HeroSection,
  ServicesSection,
  AboutSection,
} from "@/app/components";
import { getUser, getToken } from "@/app/lib/auth";
import { signOutClient } from "@/app/lib/auth-client";
import { authAPI, type UserProfile } from "@/app/lib/api";

export function HomePageClient() {
  const [user, setUser] = useState<UserProfile | null>(null);
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
  const isAdmin = user?.role === "admin";

  return (
    <div className="home-page">
      <HeroSection isAdmin={isAdmin} />

      <ServicesSection isAdmin={isAdmin} />

      <AboutSection isAdmin={isAdmin} />

      <section className="px-6 md:px-12 py-16 md:py-20 max-w-[1440px] mx-auto" data-nav-section="acces-client" id="acces-client">
        <div className="home-page__client-access bg-primary rounded-[2rem] md:rounded-[3rem] overflow-hidden relative p-6 sm:p-10 md:p-16 lg:p-24 text-center shadow-2xl shadow-primary/40">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#e9c176,_transparent)]"></div>
          </div>
          <div className="relative z-10">
            {isSignedIn ? (
              <NotificationsSection user={user} />
            ) : (
              <AuthAccessSection />
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
