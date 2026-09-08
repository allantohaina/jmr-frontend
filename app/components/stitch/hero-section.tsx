"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/app/components/locale-provider";
import { scrollToSection } from "@/app/lib/scroll";

export function HeroSection() {
  const { messages } = useLocale();

  return (
    <section className="relative px-6 md:px-12 py-16 md:py-24 lg:py-32 max-w-[1440px] mx-auto overflow-hidden bg-surface-container-low rounded-b-[2rem] md:rounded-b-[3rem] shadow-sm" data-nav-section="accueil" id="accueil">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,_#e9c176_0%,_transparent_50%)] opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
        <div className="lg:col-span-7">
          <div className="mb-4 md:mb-6 flex items-center gap-3">
            <span className="w-10 md:w-12 h-[1px] bg-primary"></span>
            <span className="font-label text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
              {messages.hero.eyebrow}
            </span>
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight md:tracking-tight text-primary leading-[1.1] mb-6 md:mb-8">
            {messages.hero.title}
          </h1>
          <p className="font-body text-base md:text-lg text-on-surface-variant max-w-xl mb-8 md:mb-10 leading-relaxed">
            {messages.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/#nos-services" onClick={(e) => { e.preventDefault(); scrollToSection("nos-services"); }} className="bg-primary text-on-primary px-8 md:px-10 py-4 md:py-5 min-h-[44px] rounded-xl font-body font-bold uppercase tracking-widest text-xs hover:bg-secondary transition-colors shadow-xl shadow-primary/20 text-center inline-flex items-center justify-center">
              {messages.hero.primaryCta}
            </Link>
            <Link href="/#acces-client" onClick={(e) => { e.preventDefault(); scrollToSection("acces-client"); }} className="border border-primary/30 text-primary px-8 md:px-10 py-4 md:py-5 min-h-[44px] rounded-xl font-body font-bold uppercase tracking-widest text-xs hover:border-primary hover:bg-primary/10 transition-all text-center inline-flex items-center justify-center">
              {messages.hero.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="aspect-[4/5] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl relative z-0 border-2 md:border-4 border-primary/25">
            <Image
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              src="/human_images/08_salle_machines_coudre.jpg"
              alt="Environnement d'atelier moderne avec stockage pratique des tissus et équipement professionnel"
              fill
              unoptimized
            />
          </div>
          <div className="absolute -bottom-10 -left-10 w-64 aspect-square rounded-2xl overflow-hidden border-4 border-primary/30 shadow-2xl z-30 hidden md:block">
            <Image
              className="w-full h-full object-cover"
              src="/human_images/07_coupe_machine_denim.jpg"
              alt="Vue détaillée de la couture professionnelle sur un tissu durable"
              fill
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
