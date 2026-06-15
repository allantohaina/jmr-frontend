"use client";

import React, { useState } from "react";
import { FileText, Download, Maximize2, Ruler, Scissors, Shirt } from "lucide-react";

interface TechSheet {
  id: string;
  orderId: string;
  client: string;
  product: string;
  date: string;
  image: string;
  specs: { label: string; value: string }[];
}

export function AtelierTechnicalSheets() {
  const [selectedSheet, setSelectedSheet] = useState<TechSheet | null>(null);

  const sheets: TechSheet[] = [
    {
      id: "TS-104",
      orderId: "#CMD-104",
      client: "Maison Haussmann",
      product: "Polo Coton Piqué",
      date: "24/03/2026",
      image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=400&auto=format&fit=crop",
      specs: [
        { label: "Matière", value: "100% Coton Bio" },
        { label: "Grammage", value: "220g/m²" },
        { label: "Couleur", value: "Bleu Marine (PANTONE 19-4023)" },
        { label: "Tailles", value: "S to XXL" },
        { label: "Finition", value: "Col tricoté, Boutons nacre" }
      ]
    },
    {
      id: "TS-105",
      orderId: "#CMD-105",
      client: "Atelier Granville",
      product: "Chemise Lin Homme",
      date: "22/03/2026",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop",
      specs: [
        { label: "Matière", value: "100% Lin Français" },
        { label: "Grammage", value: "160g/m²" },
        { label: "Couleur", value: "Blanc Optique" },
        { label: "Coupe", value: "Ajustée" },
        { label: "Boutons", value: "Bois Olivier" }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-headline text-3xl text-[#e5ad46]">Fiches Techniques</h2>
        <p className="text-[10px] uppercase tracking-widest text-[#eccc90]/40 font-bold mt-1">Spécifications de fabrication</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-1 space-y-4">
          {sheets.map(sheet => (
            <button
              key={sheet.id}
              onClick={() => setSelectedSheet(sheet)}
              className={`w-full text-left p-6 rounded-[2rem] border transition-all ${
                selectedSheet?.id === sheet.id 
                  ? "bg-[#e5ad46] text-[#1e2a38] border-[#e5ad46] shadow-xl" 
                  : "bg-[#25303a] text-[#eccc90] border-[#e5ad46]/5 hover:border-[#e5ad46]/20"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedSheet?.id === sheet.id ? "text-[#1e2a38]/60" : "text-[#e5ad46]"}`}>
                  {sheet.orderId}
                </span>
                <FileText className={`w-4 h-4 ${selectedSheet?.id === sheet.id ? "opacity-40" : "opacity-20"}`} />
              </div>
              <h3 className="font-headline text-xl mb-1">{sheet.product}</h3>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${selectedSheet?.id === sheet.id ? "text-[#1e2a38]/40" : "text-[#eccc90]/40"}`}>
                {sheet.client}
              </p>
            </button>
          ))}
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          {selectedSheet ? (
            <div className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
              <div className="relative h-64 bg-[#1e2a38]">
                <img src={selectedSheet.image} alt={selectedSheet.product} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e2a38] to-transparent" />
                <div className="absolute bottom-8 left-8 text-[#eccc90]">
                  <h3 className="font-headline text-3xl mb-1 text-[#e5ad46]">{selectedSheet.product}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">{selectedSheet.id} • Mis à jour le {selectedSheet.date}</p>
                </div>
                <button className="absolute top-6 right-6 p-3 bg-white/5 backdrop-blur-md rounded-xl text-white hover:bg-white/10 transition-all border border-white/10">
                  <Download className="w-5 h-5 text-[#e5ad46]" />
                </button>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e5ad46] mb-6">
                      <Scissors className="w-3 h-3" /> Instructions de Coupe
                    </h4>
                    <ul className="space-y-4">
                      {selectedSheet.specs.map((spec, i) => (
                        <li key={i} className="flex justify-between items-center py-3 border-b border-[#e5ad46]/5">
                          <span className="text-[10px] font-bold text-[#eccc90]/40 uppercase tracking-widest">{spec.label}</span>
                          <span className="text-sm font-bold text-[#eccc90]">{spec.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e5ad46] mb-6">
                      <Ruler className="w-3 h-3" /> Guide des Mesures
                    </h4>
                    <div className="p-6 bg-[#1e2a38] rounded-3xl space-y-4 border border-[#e5ad46]/5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-[#eccc90]/40 text-[10px] uppercase tracking-widest">Tour de poitrine</span>
                        <span className="font-bold text-[#eccc90]">52 cm (± 1cm)</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-[#eccc90]/40 text-[10px] uppercase tracking-widest">Longueur dos</span>
                        <span className="font-bold text-[#eccc90]">70 cm</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-[#eccc90]/40 text-[10px] uppercase tracking-widest">Manches</span>
                        <span className="font-bold text-[#eccc90]">22 cm</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-[#e5ad46] text-[#1e2a38] rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-[#eccc90] transition-all">
                    <Maximize2 className="w-4 h-4" /> Voir le croquis technique HD
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-[#25303a] rounded-[2.5rem] border-2 border-dashed border-[#e5ad46]/10 text-[#eccc90]/20 min-h-[400px]">
              <Shirt className="w-16 h-16 mb-4" />
              <p className="font-headline text-xl">Sélectionnez une fiche technique</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
