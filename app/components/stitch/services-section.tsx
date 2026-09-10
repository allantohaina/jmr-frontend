"use client";

import Link from "next/link";
import React from "react";
import { EditableImage } from "@/app/components/editable-image";
import { EditableText } from "@/app/components/editable-text";
import { useLocale } from "@/app/components/locale-provider";
import { scrollToSection } from "@/app/lib/scroll";

export function ServicesSection() {
  const { messages } = useLocale();

  return (
    <section className="bg-surface-container-low py-16 md:py-24 lg:py-32 rounded-[2rem] md:rounded-[3rem] max-w-[1440px] mx-auto" data-nav-section="nos-services" id="nos-services">
      <div className="px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6 md:gap-8">
          <div className="max-w-2xl">
            <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl text-primary mb-4 md:mb-6">
              <EditableText contentKey="services.title" fallback={messages.services.title} as="span" multiline />
            </h2>
            <p className="font-body text-on-surface-variant text-base md:text-lg leading-relaxed">
              <EditableText contentKey="services.description" fallback={messages.services.description} as="span" multiline />
            </p>
          </div>
          <div className="font-body text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <EditableText contentKey="services.expertise" fallback={messages.services.expertise} /> <span className="material-symbols-outlined text-sm">settings_suggest</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-surface min-h-[320px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[500px] shadow-lg">
            <EditableImage
              contentKey="services.image-main"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
              wrapperClassName="absolute inset-0"
              src="/human_images/04_decoupe_machine_electrique.jpg"
              alt="Travail de couture pratique en cours à l'atelier"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e2a38]/95 via-[#1e2a38]/35 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-auto text-[#eccc90] z-10">
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-secondary mb-2 block font-bold">
                <EditableText contentKey="services.service1Eyebrow" fallback={messages.services.service1Eyebrow} />
              </span>
              <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl mb-3 md:mb-4">
                <EditableText contentKey="services.service1Title" fallback={messages.services.service1Title} as="span" multiline />
              </h3>
              <p className="font-body text-sm md:text-base text-[#eccc90]/85 max-w-md mb-4 md:mb-6">
                <EditableText contentKey="services.service1Desc" fallback={messages.services.service1Desc} as="span" multiline />
              </p>
              <div className="w-12 h-[1px] bg-primary group-hover:w-24 transition-all duration-500"></div>
            </div>
          </div>

          <div className="bg-primary p-8 md:p-10 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-between text-on-primary shadow-2xl shadow-primary/30 relative overflow-hidden group min-h-[320px] md:min-h-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-on-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-on-primary/10 transition-colors"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-secondary text-4xl md:text-5xl mb-6 md:mb-8">engineering</span>
              <h3 className="font-headline text-2xl md:text-3xl mb-4 md:mb-6">
                <EditableText contentKey="services.service2Title" fallback={messages.services.service2Title} as="span" multiline />
              </h3>
              <p className="font-body text-sm md:text-base text-on-primary/70 leading-relaxed">
                <EditableText contentKey="services.service2Desc" fallback={messages.services.service2Desc} as="span" multiline />
              </p>
            </div>
            <div className="pt-8 md:pt-10 border-t border-on-primary/10 relative z-10">
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-widest font-body font-bold"><span className="w-2 h-2 rounded-full bg-on-primary shrink-0"></span> <span><EditableText contentKey="services.bullet1" fallback={messages.services.bullet1} /></span></li>
                <li className="flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-widest font-body font-bold"><span className="w-2 h-2 rounded-full bg-on-primary shrink-0"></span> <span><EditableText contentKey="services.bullet2" fallback={messages.services.bullet2} /></span></li>
                <li className="flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-widest font-body font-bold"><span className="w-2 h-2 rounded-full bg-on-primary shrink-0"></span> <span><EditableText contentKey="services.bullet3" fallback={messages.services.bullet3} /></span></li>
              </ul>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-surface min-h-[280px] sm:min-h-[340px] md:min-h-[400px] shadow-md">
            <EditableImage
              contentKey="services.image-secondary"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              wrapperClassName="absolute inset-0"
              src="/human_images/09_decoupe_pieces_denim.jpg"
              alt="Stock de matières textiles professionnelles à l'atelier"
            />
            <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-all duration-500"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8 text-center z-10">
              <div className="bg-surface/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-primary/20 shadow-xl group-hover:scale-105 transition-transform duration-500">
                <h3 className="font-headline text-xl md:text-2xl text-primary mb-2"><EditableText contentKey="services.service3Title" fallback={messages.services.service3Title} as="span" multiline /></h3>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-secondary font-bold"><EditableText contentKey="services.service3Eyebrow" fallback={messages.services.service3Eyebrow} /></p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-background min-h-[480px] md:min-h-[400px] flex flex-col md:flex-row md:items-center shadow-xl">
            <div className="relative w-full md:w-1/2 h-48 sm:h-56 md:h-full md:absolute md:right-0 md:top-0 md:bottom-0 overflow-hidden order-first md:order-none">
              <EditableImage
                contentKey="services.image-tertiary"
                className="w-full h-full object-cover opacity-70 md:opacity-60 group-hover:opacity-80 transition-all duration-1000"
                src="/human_images/01_patronage_terrasse.jpg"
                alt="Gros plan d'une construction de vêtement professionnel sur un cintre"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-background/50 to-background"></div>
            </div>
            <div className="relative z-10 p-6 sm:p-8 md:px-12 md:py-10 max-w-md">
              <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl text-on-surface mb-4 md:mb-6">
                <EditableText contentKey="services.service4Title" fallback={messages.services.service4Title} as="span" multiline />
              </h3>
              <p className="font-body text-on-surface-variant text-base md:text-lg mb-6 md:mb-10 leading-relaxed">
                <EditableText contentKey="services.service4Desc" fallback={messages.services.service4Desc} as="span" multiline />
              </p>
              <div className="inline-flex flex-col gap-2">
                <Link href="/" onClick={(e) => { e.preventDefault(); scrollToSection("acces-client"); }} className="inline-flex items-center justify-center min-h-[44px] bg-primary text-on-primary px-8 md:px-10 py-4 md:py-5 rounded-xl font-body text-xs uppercase tracking-[0.2em] font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20">
                  <EditableText contentKey="services.service4Cta" fallback={messages.services.service4Cta} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
