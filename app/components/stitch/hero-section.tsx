"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { EditableText } from "../editable-text";
import { useLocale } from "@/app/components/locale-provider";

export function HeroSection({ isAdmin = false }: { isAdmin?: boolean }) {
  const { messages } = useLocale();
  const [content, setContent] = React.useState({
    eyebrow: messages.hero.eyebrow,
    title: messages.hero.title,
    description: messages.hero.description,
  });

  React.useEffect(() => {
    setContent({
      eyebrow: messages.hero.eyebrow,
      title: messages.hero.title,
      description: messages.hero.description,
    });
  }, [messages.hero.description, messages.hero.eyebrow, messages.hero.title]);

  const handleSave = (key: keyof typeof content) => (newVal: string) => {
    setContent(prev => ({ ...prev, [key]: newVal }));
    console.log(`[CMS MOCK] Saving ${key}: ${newVal}`);
    // Ici on appellerait une API pour sauvegarder
  };

  return (
    <section className="relative px-6 md:px-12 py-20 lg:py-32 max-w-[1440px] mx-auto overflow-hidden bg-surface-container-low rounded-b-[3rem] shadow-sm" data-nav-section="accueil" id="accueil">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,_#e9c176_0%,_transparent_50%)] opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="w-12 h-[1px] bg-orange-500"></span>
            <EditableText 
              isAdmin={isAdmin} 
              content={content.eyebrow} 
              onSave={handleSave("eyebrow")}
              className="font-label text-[11px] uppercase tracking-[0.2em] text-orange-500 font-bold"
            />
          </div>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-primary leading-[1.1] mb-8">
            <EditableText 
              isAdmin={isAdmin} 
              content={content.title} 
              onSave={handleSave("title")}
              tag="span"
            />
          </h1>
          <EditableText 
            isAdmin={isAdmin} 
            content={content.description} 
            onSave={handleSave("description")}
            tag="p"
            className="font-body text-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="#nos-services" className="bg-primary text-on-primary px-10 py-5 rounded-xl font-body font-bold uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors shadow-xl shadow-primary/20 text-center">
              {messages.hero.primaryCta}
            </Link>
            <Link href="#acces-client" className="border border-outline-variant text-primary px-10 py-5 rounded-xl font-body font-bold uppercase tracking-widest text-xs hover:border-orange-500 hover:text-orange-500 transition-all text-center">
              {messages.hero.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative z-0 border-8 border-white">
            <Image
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              src="/human_images/08_salle_machines_coudre.jpg"
              alt="Environnement d'atelier moderne avec stockage pratique des tissus et équipement professionnel"
              fill
              priority
            />
          </div>
          <div className="absolute -bottom-10 -left-10 w-64 aspect-square rounded-2xl overflow-hidden border-[12px] border-white shadow-2xl hidden md:block z-30">
            <Image
              className="w-full h-full object-cover"
              src="/human_images/07_coupe_machine_denim.jpg"
              alt="Vue détaillée de la couture professionnelle sur un tissu durable"
              fill
            />
          </div>
        </div>
      </div>
    </section>
  );
}
