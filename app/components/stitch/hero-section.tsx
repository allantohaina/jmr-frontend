"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { EditableText } from "../editable-text";
import { useLocale } from "@/app/components/locale-provider";
import { useContent } from "@/app/lib/use-content";
import { scrollToSection } from "@/app/lib/scroll";

export function HeroSection({ isAdmin = false }: { isAdmin?: boolean }) {
  const { messages } = useLocale();
  const { content, save, loaded } = useContent();

  const eyebrow = loaded && content.hero_eyebrow ? content.hero_eyebrow : messages.hero.eyebrow;
  const title = loaded && content.hero_title ? content.hero_title : messages.hero.title;
  const description = loaded && content.hero_description ? content.hero_description : messages.hero.description;
  const val = (key: string, fallback: string) => loaded && content[key] ? content[key] : fallback;

  const handleSave = (key: string) => (newVal: string) => save(key, newVal);

  return (
    <section className="relative px-6 md:px-12 py-16 md:py-24 lg:py-32 max-w-[1440px] mx-auto overflow-hidden bg-surface-container-low rounded-b-[2rem] md:rounded-b-[3rem] shadow-sm" data-nav-section="accueil" id="accueil">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,_#e9c176_0%,_transparent_50%)] opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
        <div className="lg:col-span-7">
          <div className="mb-4 md:mb-6 flex items-center gap-3">
            <span className="w-10 md:w-12 h-[1px] bg-primary"></span>
            <EditableText 
              isAdmin={isAdmin} 
              content={eyebrow} 
              onSave={handleSave("hero_eyebrow")}
              className="font-label text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-primary font-bold"
            />
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight md:tracking-tight text-primary leading-[1.1] mb-6 md:mb-8">
            <EditableText 
              isAdmin={isAdmin} 
              content={title} 
              onSave={handleSave("hero_title")}
              tag="span"
            />
          </h1>
          <EditableText 
            isAdmin={isAdmin} 
            content={description} 
            onSave={handleSave("hero_description")}
            tag="p"
            className="font-body text-base md:text-lg text-on-surface-variant max-w-xl mb-8 md:mb-10 leading-relaxed"
          />
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href={val("hero_primary_cta_url", "/#nos-services")} onClick={(e) => { if (val("hero_primary_cta_url", "/#nos-services") === "/#nos-services") { e.preventDefault(); scrollToSection("nos-services"); } }} className="bg-primary text-on-primary px-8 md:px-10 py-4 md:py-5 min-h-[44px] rounded-xl font-body font-bold uppercase tracking-widest text-xs hover:bg-secondary transition-colors shadow-xl shadow-primary/20 text-center inline-flex items-center justify-center">
              {val("hero_primary_cta_label", messages.hero.primaryCta)}
            </Link>
            <Link href={val("hero_secondary_cta_url", "/#acces-client")} onClick={(e) => { if (val("hero_secondary_cta_url", "/#acces-client") === "/#acces-client") { e.preventDefault(); scrollToSection("acces-client"); } }} className="border border-primary/30 text-primary px-8 md:px-10 py-4 md:py-5 min-h-[44px] rounded-xl font-body font-bold uppercase tracking-widest text-xs hover:border-primary hover:bg-primary/10 transition-all text-center inline-flex items-center justify-center">
              {val("hero_secondary_cta_label", messages.hero.secondaryCta)}
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="aspect-[4/5] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl relative z-0 border-2 md:border-4 border-primary/25">
            <Image
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              src={val("hero_image", "/human_images/08_salle_machines_coudre.jpg")}
              alt="Environnement d'atelier moderne avec stockage pratique des tissus et équipement professionnel"
              fill
              priority
            />
          </div>
          <div className="absolute -bottom-10 -left-10 w-64 aspect-square rounded-2xl overflow-hidden border-4 border-primary/30 shadow-2xl hidden md:block z-30">
            <Image
              className="w-full h-full object-cover"
              src={val("hero_secondary_image", "/human_images/07_coupe_machine_denim.jpg")}
              alt="Vue détaillée de la couture professionnelle sur un tissu durable"
              fill
            />
          </div>
        </div>
      </div>
    </section>
  );
}
