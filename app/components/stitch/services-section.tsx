"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { EditableText } from "../editable-text";

export function ServicesSection({ isAdmin = false }: { isAdmin?: boolean }) {
  const [content, setContent] = React.useState({
    title: "Un Travail de Qualité",
    description: "Nous privilégions le bon geste et la solidité. Ici, on ne cherche pas la perfection marketing, mais la justesse technique et la durabilité du vêtement.",
    service1_eyebrow: "Savoir-faire Technique",
    service1_title: "Conception & Production",
    service1_desc: "De la mise au point du patron à la couture finale, nous assurons une fabrication fiable et honnête.",
    service2_title: "Ingénierie Textile",
    service2_desc: "Nous optimisons vos modèles pour une production efficace sans sacrifier la qualité du montage.",
    service4_title: "Un Atelier Ouvert, Orienté Solutions.",
    service4_desc: "Nous travaillons main dans la main avec vous pour résoudre les défis techniques de vos créations."
  });

  const handleSave = (key: keyof typeof content) => (newVal: string) => {
    setContent(prev => ({ ...prev, [key]: newVal }));
    console.log(`[CMS MOCK] Saving ${key}: ${newVal}`);
  };

  return (
    <section className="bg-surface-container-low py-32 rounded-[3rem] max-w-[1440px] mx-auto" data-nav-section="nos-services" id="nos-services">
      <div className="px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="font-headline text-4xl md:text-5xl text-primary mb-6">
              <EditableText 
                isAdmin={isAdmin} 
                content={content.title} 
                onSave={handleSave("title")}
                tag="span"
              />
            </h2>
            <EditableText 
              isAdmin={isAdmin} 
              content={content.description} 
              onSave={handleSave("description")}
              tag="p"
              className="font-body text-on-surface-variant text-lg"
            />
          </div>
          <div className="font-body text-xs font-bold uppercase tracking-widest text-orange-500 flex items-center gap-2">
            Expertise Textile <span className="material-symbols-outlined text-sm">settings_suggest</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Service 1: Conception & Production */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-surface h-[500px] shadow-lg">
            <Image
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
              src="/human_images/04_decoupe_machine_electrique.jpg"
              alt="Travail de couture pratique en cours à l'atelier"
              fill
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
            <div className="absolute bottom-10 left-10 text-white z-10">
              <EditableText 
                isAdmin={isAdmin} 
                content={content.service1_eyebrow} 
                onSave={handleSave("service1_eyebrow")}
                className="font-body text-[10px] uppercase tracking-[0.3em] text-orange-400 mb-2 block font-bold"
              />
              <h3 className="font-headline text-4xl mb-4">
                <EditableText 
                  isAdmin={isAdmin} 
                  content={content.service1_title} 
                  onSave={handleSave("service1_title")}
                  tag="span"
                />
              </h3>
              <EditableText 
                isAdmin={isAdmin} 
                content={content.service1_desc} 
                onSave={handleSave("service1_desc")}
                tag="p"
                className="font-body text-base text-white/80 max-w-md mb-6"
              />
              <div className="w-12 h-[1px] bg-orange-500 group-hover:w-24 transition-all duration-500"></div>
            </div>
          </div>

          {/* Service 2: Ingénierie Textile */}
          <div className="bg-primary p-10 rounded-[2rem] flex flex-col justify-between text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-orange-400 text-5xl mb-8">engineering</span>
              <h3 className="font-headline text-3xl mb-6">
                <EditableText 
                  isAdmin={isAdmin} 
                  content={content.service2_title} 
                  onSave={handleSave("service2_title")}
                  tag="span"
                />
              </h3>
              <EditableText 
                isAdmin={isAdmin} 
                content={content.service2_desc} 
                onSave={handleSave("service2_desc")}
                tag="p"
                className="font-body text-base text-white/70 leading-relaxed"
              />
            </div>
            {/* ... stats list ... */}
            <div className="pt-10 border-t border-white/10 relative z-10">
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-xs uppercase tracking-widest font-body font-bold"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Gradation Industrielle</li>
                <li className="flex items-center gap-3 text-xs uppercase tracking-widest font-body font-bold"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Mise au point prototype</li>
                <li className="flex items-center gap-3 text-xs uppercase tracking-widest font-body font-bold"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Petites & Moyennes Séries</li>
              </ul>
            </div>
          </div>

          {/* Service 3: Matières Durables */}
          <div className="group relative overflow-hidden rounded-[2rem] bg-surface h-[400px] shadow-md">
            <Image
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              src="/human_images/09_decoupe_pieces_denim.jpg"
              alt="Stock de matières textiles professionnelles à l'atelier"
              fill
            />
            <div className="absolute inset-0 bg-white/40 group-hover:bg-white/10 transition-all duration-500"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                <h3 className="font-headline text-2xl text-primary mb-2">Matières Durables</h3>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold">Approvisionnement Transparent</p>
              </div>
            </div>
          </div>

          {/* Service 4: Atelier Ouvert */}
          <div className="md:col-span-2 relative overflow-hidden rounded-[2rem] bg-[#1b1c19] h-[400px] flex items-center px-12 group shadow-xl">
            <div className="max-w-md z-10 relative">
              <h3 className="font-headline text-4xl text-white mb-6">
                <EditableText 
                  isAdmin={isAdmin} 
                  content={content.service4_title} 
                  onSave={handleSave("service4_title")}
                  tag="span"
                />
              </h3>
              <EditableText 
                isAdmin={isAdmin} 
                content={content.service4_desc} 
                onSave={handleSave("service4_desc")}
                tag="p"
                className="font-body text-white/70 text-lg mb-10"
              />
              <Link href="#acces-client" className="inline-block bg-orange-500 text-white px-10 py-5 rounded-xl font-body text-xs uppercase tracking-[0.2em] font-bold hover:bg-orange-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20">
                Consulter nos services
              </Link>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden">
              <Image
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-1000"
                src="/human_images/01_patronage_terrasse.jpg"
                alt="Gros plan d'une construction de vêtement professionnel sur un cintre"
                fill
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#1b1c19]/50 to-[#1b1c19]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
