"use client";

import Image from "next/image";
import React from "react";
import { EditableText } from "../editable-text";
import { useLocale } from "@/app/components/locale-provider";

export function AboutSection({ isAdmin = false }: { isAdmin?: boolean }) {
  const { messages } = useLocale();
  const [content, setContent] = React.useState({
    eyebrow: messages.about.eyebrow,
    title: messages.about.title,
    p1: messages.about.p1,
    p2: messages.about.p2,
  });

  React.useEffect(() => {
    setContent({
      eyebrow: messages.about.eyebrow,
      title: messages.about.title,
      p1: messages.about.p1,
      p2: messages.about.p2,
    });
  }, [messages.about]);

  const handleSave = (key: keyof typeof content) => (newVal: string) => {
    setContent(prev => ({ ...prev, [key]: newVal }));
    console.log(`[CMS MOCK] Saving ${key}: ${newVal}`);
  };

  return (
    <section className="py-32 max-w-[1440px] mx-auto px-6 md:px-12" data-nav-section="a-propos" id="a-propos">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* ... existing images/video ... */}
        <div className="relative group">
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
              <p className="text-3xl font-headline text-primary group-hover/stat:text-orange-500 transition-colors">{messages.about.stat1}</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{messages.about.stat1Label}</p>
            </div>
            <div className="w-[1px] h-12 bg-outline-variant/30"></div>
            <div className="group/stat">
              <p className="text-3xl font-headline text-primary group-hover/stat:text-orange-500 transition-colors">{messages.about.stat2}</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{messages.about.stat2Label}</p>
            </div>
            <div className="w-[1px] h-12 bg-outline-variant/30"></div>
            <div className="group/stat">
              <p className="text-3xl font-headline text-primary group-hover/stat:text-orange-500 transition-colors">{messages.about.stat3}</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{messages.about.stat3Label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
