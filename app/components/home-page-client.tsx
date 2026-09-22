"use client";

import {
  HeroSection,
  ServicesSection,
  AboutSection,
} from "@/app/components";
import { HomeShowcase, HomeDevisCta } from "@/app/components/home-showcase";

export function HomePageClient() {
  return (
    <div className="home-page">
      <HeroSection />

      <ServicesSection />

      <AboutSection />

      <section className="px-6 md:px-12 py-16 md:py-20 max-w-[1440px] mx-auto" data-nav-section="acces-client" id="acces-client">
        <HomeDevisCta />
      </section>

      <HomeShowcase showDevisCta={false} />

    </div>
  );
}
