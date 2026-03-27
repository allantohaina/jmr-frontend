"use client";

import Image from "next/image";
import React from "react";
import { EditableText } from "../editable-text";

export function AboutSection({ isAdmin = false }: { isAdmin?: boolean }) {
  const [content, setContent] = React.useState({
    eyebrow: "À Propos de JMR Textile",
    title: "Un Héritage de Précision Textile.",
    p1: "JMR Textile est une entreprise textile basée à Madagascar. Nous travaillons avec une organisation locale et des partenaires techniques que nous coordonnons directement.",
    p2: "Notre rôle est de faire avancer vos projets de manière structurée et transparente. Chaque projet est traité avec une attention particulière à l'origine des matières et à la conformité technique."
  });

  const handleSave = (key: keyof typeof content) => (newVal: string) => {
    setContent(prev => ({ ...prev, [key]: newVal }));
    console.log(`[CMS MOCK] Saving ${key}: ${newVal}`);
  };

  return (
    <section className="py-32 max-w-[1440px] mx-auto px-6 md:px-12" data-nav-section="a-propos" id="a-propos">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* ... existing images/video ... */}
        <div className="relative group">
          <div className="absolute -top-10 -right-10 font-headline text-[12rem] text-surface-container-high select-none z-0 leading-none font-bold opacity-40 uppercase tracking-tighter">JMR</div>
          <div className="relative z-10 grid grid-cols-2 gap-6">
            <div className="relative w-full aspect-[3/4] mt-12 shadow-xl overflow-hidden rounded-3xl bg-surface-container-high">
              {/* Vidéo intégrée ici */}
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
            <div className="relative w-full aspect-[3/4] shadow-xl overflow-hidden rounded-3xl">
              <Image
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                src="/human_images/05_equipe_tracage_patron.jpg"
                alt="Outils d'atelier réels et fournitures de couture quotidiennes"
                fill
              />
            </div>
          </div>
          {/* Badge flottant sur la vidéo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full hidden group-hover:block transition-all">
             <p className="font-body text-[10px] uppercase tracking-[0.3em] text-white font-bold">Atelier en action</p>
          </div>
        </div>
        <div>
          <EditableText 
            isAdmin={isAdmin} 
            content={content.eyebrow} 
            onSave={handleSave("eyebrow")}
            className="font-body text-[11px] uppercase tracking-[0.3em] text-primary/40 mb-4 block font-bold"
          />
          <h2 className="font-headline text-5xl text-primary mb-8 leading-tight">
            <EditableText 
              isAdmin={isAdmin} 
              content={content.title} 
              onSave={handleSave("title")}
              tag="span"
            />
          </h2>
          <EditableText 
            isAdmin={isAdmin} 
            content={content.p1} 
            onSave={handleSave("p1")}
            tag="p"
            className="font-body text-on-surface-variant text-lg leading-relaxed mb-6"
          />
          <EditableText 
            isAdmin={isAdmin} 
            content={content.p2} 
            onSave={handleSave("p2")}
            tag="p"
            className="font-body text-on-surface-variant text-lg leading-relaxed mb-10"
          />
          <div className="flex items-center gap-8">
            <div className="group/stat">
              <p className="text-3xl font-headline text-primary group-hover/stat:text-orange-500 transition-colors">100%</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Malagasy</p>
            </div>
            <div className="w-[1px] h-12 bg-outline-variant/30"></div>
            <div className="group/stat">
              <p className="text-3xl font-headline text-primary group-hover/stat:text-orange-500 transition-colors">Direct</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Sans Intermédiaire</p>
            </div>
            <div className="w-[1px] h-12 bg-outline-variant/30"></div>
            <div className="group/stat">
              <p className="text-3xl font-headline text-primary group-hover/stat:text-orange-500 transition-colors">Honnête</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Prix Justes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
