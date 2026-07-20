"use client";

import Image from "next/image";
import React from "react";
import { EditableText } from "../editable-text";
import { useLocale } from "@/app/components/locale-provider";
import { useContent } from "@/app/lib/use-content";

export function AboutSection({ isAdmin = false }: { isAdmin?: boolean }) {
  const { messages } = useLocale();
  const { content, save, loaded } = useContent();

  const val = (key: string, fallback: string) => loaded && content[key] ? content[key] : fallback;
  const handleSave = (key: string) => (newVal: string) => save(key, newVal);

  return (
    <section className="py-16 md:py-24 lg:py-32 max-w-[1440px] mx-auto px-6 md:px-12" data-nav-section="a-propos" id="a-propos">
      <div className="grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center">
        <div className="relative group order-2 lg:order-1">
          <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-6">
            <div className="relative w-full aspect-[3/4] mt-0 md:mt-12 shadow-xl overflow-hidden rounded-2xl md:rounded-3xl bg-surface-container-high">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              >
                <source src="/video/machine.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-primary/10 z-10 mix-blend-multiply opacity-20"></div>
            </div>
            <div className="relative w-full aspect-[3/4] shadow-xl overflow-hidden rounded-2xl md:rounded-3xl">
              <Image
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                src="/human_images/05_equipe_tracage_patron.jpg"
                alt="Outils d'atelier réels et fournitures de couture quotidiennes"
                fill
              />
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <EditableText 
            isAdmin={isAdmin} 
            content={val("about_eyebrow", messages.about.eyebrow)} 
            onSave={handleSave("about_eyebrow")}
            className="font-body text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-primary/60 mb-3 md:mb-4 block font-bold"
          />
          <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl text-primary mb-6 md:mb-8 leading-tight">
            <EditableText 
              isAdmin={isAdmin} 
              content={val("about_title", messages.about.title)} 
              onSave={handleSave("about_title")}
              tag="span"
            />
          </h2>
          <EditableText 
            isAdmin={isAdmin} 
            content={val("about_p1", messages.about.p1)} 
            onSave={handleSave("about_p1")}
            tag="p"
            className="font-body text-on-surface-variant text-base md:text-lg leading-relaxed mb-4 md:mb-6"
          />
          <EditableText 
            isAdmin={isAdmin} 
            content={val("about_p2", messages.about.p2)} 
            onSave={handleSave("about_p2")}
            tag="p"
            className="font-body text-on-surface-variant text-base md:text-lg leading-relaxed mb-8 md:mb-10"
          />
          <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-6 md:gap-8">
            <div className="group/stat text-center sm:text-left">
              <p className="text-2xl md:text-3xl font-headline text-primary group-hover/stat:text-secondary transition-colors">{messages.about.stat1}</p>
              <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">{messages.about.stat1Label}</p>
            </div>
            <div className="hidden sm:block w-[1px] h-12 bg-outline-variant/30 shrink-0"></div>
            <div className="group/stat text-center sm:text-left">
              <p className="text-2xl md:text-3xl font-headline text-primary group-hover/stat:text-secondary transition-colors">{messages.about.stat2}</p>
              <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">{messages.about.stat2Label}</p>
            </div>
            <div className="hidden sm:block w-[1px] h-12 bg-outline-variant/30 shrink-0"></div>
            <div className="group/stat text-center sm:text-left">
              <p className="text-2xl md:text-3xl font-headline text-primary group-hover/stat:text-secondary transition-colors">{messages.about.stat3}</p>
              <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">{messages.about.stat3Label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
