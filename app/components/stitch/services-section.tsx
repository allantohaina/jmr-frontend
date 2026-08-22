"use client";

import Link from "next/link";
import React from "react";
import { EditableText } from "../editable-text";
import { EditableImage } from "../editable-image";
import { useLocale } from "@/app/components/locale-provider";
import { useContent } from "@/app/lib/use-content";
import { scrollToSection } from "@/app/lib/scroll";

export function ServicesSection({ isAdmin = false }: { isAdmin?: boolean }) {
  const { messages } = useLocale();
  const { content, save, loaded } = useContent();

  const val = (key: string, fallback: string) => loaded && content[key] ? content[key] : fallback;

  const handleSave = (key: string) => (newVal: string) => save(key, newVal);

  return (
    <section className="bg-surface-container-low py-16 md:py-24 lg:py-32 rounded-[2rem] md:rounded-[3rem] max-w-[1440px] mx-auto" data-nav-section="nos-services" id="nos-services">
      <div className="px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6 md:gap-8">
          <div className="max-w-2xl">
            <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl text-primary mb-4 md:mb-6">
              <EditableText 
                isAdmin={isAdmin} 
                content={val("services_title", messages.services.title)} 
                onSave={handleSave("services_title")}
                tag="span"
              />
            </h2>
            <EditableText 
              isAdmin={isAdmin} 
              content={val("services_description", messages.services.description)} 
              onSave={handleSave("services_description")}
              tag="p"
              className="font-body text-on-surface-variant text-base md:text-lg leading-relaxed"
            />
          </div>
          <div className="font-body text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            {messages.services.expertise} <span className="material-symbols-outlined text-sm">settings_suggest</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-surface min-h-[320px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[500px] shadow-lg">
            <EditableImage
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
              src={val("services_image_1", "/human_images/04_decoupe_machine_electrique.jpg")}
              alt="Travail de couture pratique en cours à l'atelier"
              fill
              contentKey="services_image_1"
              isAdmin={isAdmin}
              onSave={handleSave("services_image_1")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-auto text-on-primary z-10">
              <EditableText 
                isAdmin={isAdmin} 
                content={val("services_s1_eyebrow", messages.services.service1Eyebrow)} 
                onSave={handleSave("services_s1_eyebrow")}
                className="font-body text-[10px] uppercase tracking-[0.3em] text-secondary mb-2 block font-bold"
              />
              <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl mb-3 md:mb-4">
                <EditableText 
                  isAdmin={isAdmin} 
                  content={val("services_s1_title", messages.services.service1Title)} 
                  onSave={handleSave("services_s1_title")}
                  tag="span"
                />
              </h3>
              <EditableText 
                isAdmin={isAdmin} 
                content={val("services_s1_desc", messages.services.service1Desc)} 
                onSave={handleSave("services_s1_desc")}
                tag="p"
                className="font-body text-sm md:text-base text-on-primary/80 max-w-md mb-4 md:mb-6"
              />
              <div className="w-12 h-[1px] bg-primary group-hover:w-24 transition-all duration-500"></div>
            </div>
          </div>

          <div className="bg-primary p-8 md:p-10 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-between text-on-primary shadow-2xl shadow-primary/30 relative overflow-hidden group min-h-[320px] md:min-h-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-on-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-on-primary/10 transition-colors"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-secondary text-4xl md:text-5xl mb-6 md:mb-8">engineering</span>
              <h3 className="font-headline text-2xl md:text-3xl mb-4 md:mb-6">
                <EditableText 
                  isAdmin={isAdmin} 
                  content={val("services_s2_title", messages.services.service2Title)} 
                  onSave={handleSave("services_s2_title")}
                  tag="span"
                />
              </h3>
              <EditableText 
                isAdmin={isAdmin} 
                content={val("services_s2_desc", messages.services.service2Desc)} 
                onSave={handleSave("services_s2_desc")}
                tag="p"
                className="font-body text-sm md:text-base text-on-primary/70 leading-relaxed"
              />
            </div>
            <div className="pt-8 md:pt-10 border-t border-on-primary/10 relative z-10">
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-widest font-body font-bold"><span className="w-2 h-2 rounded-full bg-on-primary shrink-0"></span> <EditableText isAdmin={isAdmin} content={val("services_bullet_1", messages.services.bullet1)} onSave={handleSave("services_bullet_1")} tag="span" /></li>
                <li className="flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-widest font-body font-bold"><span className="w-2 h-2 rounded-full bg-on-primary shrink-0"></span> <EditableText isAdmin={isAdmin} content={val("services_bullet_2", messages.services.bullet2)} onSave={handleSave("services_bullet_2")} tag="span" /></li>
                <li className="flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-widest font-body font-bold"><span className="w-2 h-2 rounded-full bg-on-primary shrink-0"></span> <EditableText isAdmin={isAdmin} content={val("services_bullet_3", messages.services.bullet3)} onSave={handleSave("services_bullet_3")} tag="span" /></li>
              </ul>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-surface min-h-[280px] sm:min-h-[340px] md:min-h-[400px] shadow-md">
            <EditableImage
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              src={val("services_image_3", "/human_images/09_decoupe_pieces_denim.jpg")}
              alt="Stock de matières textiles professionnelles à l'atelier"
              fill
              contentKey="services_image_3"
              isAdmin={isAdmin}
              onSave={handleSave("services_image_3")}
            />
            <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-all duration-500"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8 text-center z-10">
              <div className="bg-surface/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-primary/20 shadow-xl group-hover:scale-105 transition-transform duration-500">
                <h3 className="font-headline text-xl md:text-2xl text-primary mb-2"><EditableText isAdmin={isAdmin} content={val("services_s3_title", messages.services.service3Title)} onSave={handleSave("services_s3_title")} tag="span" /></h3>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-secondary font-bold"><EditableText isAdmin={isAdmin} content={val("services_s3_eyebrow", messages.services.service3Eyebrow)} onSave={handleSave("services_s3_eyebrow")} tag="span" /></p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-background min-h-[480px] md:min-h-[400px] flex flex-col md:flex-row md:items-center shadow-xl">
            <div className="relative w-full md:w-1/2 h-48 sm:h-56 md:h-full md:absolute md:right-0 md:top-0 md:bottom-0 overflow-hidden order-first md:order-none">
              <EditableImage
                className="w-full h-full object-cover opacity-70 md:opacity-60 group-hover:opacity-80 transition-all duration-1000"
                src={val("services_image_4", "/human_images/01_patronage_terrasse.jpg")}
                alt="Gros plan d'une construction de vêtement professionnel sur un cintre"
                fill
                contentKey="services_image_4"
                isAdmin={isAdmin}
                onSave={handleSave("services_image_4")}
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-background/50 to-background"></div>
            </div>
            <div className="relative z-10 p-6 sm:p-8 md:px-12 md:py-10 max-w-md">
              <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl text-on-surface mb-4 md:mb-6">
                <EditableText 
                  isAdmin={isAdmin} 
                  content={val("services_s4_title", messages.services.service4Title)} 
                  onSave={handleSave("services_s4_title")}
                  tag="span"
                />
              </h3>
              <EditableText 
                isAdmin={isAdmin} 
                content={val("services_s4_desc", messages.services.service4Desc)} 
                onSave={handleSave("services_s4_desc")}
                tag="p"
                className="font-body text-on-surface-variant text-base md:text-lg mb-6 md:mb-10 leading-relaxed"
              />
              <div className="inline-flex flex-col gap-2">
                <Link href="/" onClick={(e) => { e.preventDefault(); scrollToSection("acces-client"); }} className="inline-flex items-center justify-center min-h-[44px] bg-primary text-on-primary px-8 md:px-10 py-4 md:py-5 rounded-xl font-body text-xs uppercase tracking-[0.2em] font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20">
                  {val("services_s4_cta_label", messages.services.service4Cta)}
                </Link>
                {isAdmin && <EditableText isAdmin={isAdmin} content={val("services_s4_cta_label", messages.services.service4Cta)} onSave={handleSave("services_s4_cta_label")} tag="span" className="text-xs text-primary/60" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
