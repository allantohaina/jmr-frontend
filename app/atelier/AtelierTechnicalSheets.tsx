"use client";

import React, { useState, useEffect } from "react";
import { FileText, Download, Maximize2, Ruler, Scissors, Shirt } from "lucide-react";
import { authAPI } from "@/app/lib/api";

interface TechSheet {
  id: string;
  orderId: string;
  client: string;
  product: string;
  date: string;
  image: string;
  specs: { label: string; value: string }[];
}

type CommandeSheet = {
  id: string;
  numero?: string;
  designation?: string;
  quantite?: number;
  statut_production?: string;
  client_first_name?: string;
  client_email?: string;
  created_at?: string;
  date_livraison_prevue?: string;
};

export function AtelierTechnicalSheets() {
  const [selectedSheet, setSelectedSheet] = useState<TechSheet | null>(null);
  const [sheets, setSheets] = useState<TechSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchSheets = async () => {
      setIsLoading(true);
      try {
        const res = await authAPI.get<CommandeSheet[]>("/commandes");
        if (!active) return;
        const list: CommandeSheet[] = Array.isArray(res.data) ? res.data : [];
        setSheets(
          list.slice(0, 20).map((c) => ({
            id: String(c.id),
            orderId: c.numero ? `#${c.numero}` : `#${c.id}`,
            client: c.client_first_name || c.client_email || "Client",
            product: c.designation || "Sans désignation",
            date: (c.created_at || "").slice(0, 10),
            image: "",
            specs: [
              { label: "Quantité", value: String(c.quantite ?? "—") },
              { label: "Statut", value: c.statut_production || "—" },
              ...(c.date_livraison_prevue
                ? [{ label: "Livraison prévue", value: c.date_livraison_prevue.slice(0, 10) }]
                : []),
            ],
          }))
        );
      } catch (error) {
        console.error("Erreur chargement fiches techniques:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchSheets();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-headline text-3xl text-[#EAA100]">Fiches Techniques</h2>
        <p className="text-caption uppercase tracking-widest text-[#EAA100]/40 font-bold mt-1">Spécifications de fabrication</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-1 space-y-4">
          {isLoading ? (
            <p className="text-sm text-[#EAA100]/40 italic">Chargement des fiches…</p>
          ) : sheets.length === 0 ? (
            <p className="text-sm text-[#EAA100]/40 italic">Aucune fiche technique pour le moment.</p>
          ) : (
          <>
          {sheets.map(sheet => (
            <button
              key={sheet.id}
              onClick={() => setSelectedSheet(sheet)}
              className={`w-full text-left p-6 rounded-[2rem] border transition-all ${
                selectedSheet?.id === sheet.id 
                  ? "bg-[#EAA100] text-[#1e2a38] border-[#EAA100] shadow-xl" 
                  : "bg-[#161D30] text-[#EAA100] border-[#EAA100]/5 hover:border-[#EAA100]/20"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-caption font-bold uppercase tracking-widest ${selectedSheet?.id === sheet.id ? "text-[#1e2a38]/60" : "text-[#EAA100]"}`}>
                  {sheet.orderId}
                </span>
                <FileText className={`w-4 h-4 ${selectedSheet?.id === sheet.id ? "opacity-40" : "opacity-20"}`} />
              </div>
              <h3 className="font-headline text-xl mb-1">{sheet.product}</h3>
              <p className={`text-caption uppercase tracking-widest font-bold ${selectedSheet?.id === sheet.id ? "text-[#1e2a38]/40" : "text-[#EAA100]/40"}`}>
                {sheet.client}
              </p>
            </button>
          ))}
          </>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          {selectedSheet ? (
            <div className="bg-[#161D30] rounded-[2.5rem] border border-[#EAA100]/5 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
              <div className="relative h-48 bg-[#1e2a38]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e2a38] to-transparent" />
                <div className="absolute bottom-8 left-8 text-[#EAA100]">
                  <h3 className="font-headline text-3xl mb-1 text-[#EAA100]">{selectedSheet.product}</h3>
                  <p className="text-caption uppercase tracking-widest font-bold opacity-80">{selectedSheet.orderId}{selectedSheet.date ? ` • ${selectedSheet.date}` : ""}</p>
                </div>
                <button className="absolute top-6 right-6 p-3 bg-white/5 backdrop-blur-md rounded-xl text-white hover:bg-white/10 transition-all border border-white/10">
                  <Download className="w-5 h-5 text-[#EAA100]" />
                </button>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h4 className="flex items-center gap-2 text-caption font-bold uppercase tracking-[0.2em] text-[#EAA100] mb-6">
                      <Scissors className="w-3 h-3" /> Instructions de Coupe
                    </h4>
                    <ul className="space-y-4">
                      {selectedSheet.specs.map((spec, i) => (
                        <li key={i} className="flex justify-between items-center py-3 border-b border-[#EAA100]/5">
                          <span className="text-caption font-bold text-[#EAA100]/40 uppercase tracking-widest">{spec.label}</span>
                          <span className="text-sm font-bold text-[#EAA100]">{spec.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="flex items-center gap-2 text-caption font-bold uppercase tracking-[0.2em] text-[#EAA100] mb-6">
                      <Ruler className="w-3 h-3" /> Guide des Mesures
                    </h4>
                    <div className="p-6 bg-[#1e2a38] rounded-3xl space-y-4 border border-[#EAA100]/5">
                      <p className="text-xs text-[#EAA100]/40 italic">Mesures issues de la fiche client — voir Fiche mesures.</p>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-[#EAA100] text-[#1e2a38] rounded-2xl text-caption font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-[#EAA100] transition-all">
                    <Maximize2 className="w-4 h-4" /> Voir le croquis technique HD
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-[#161D30] rounded-[2.5rem] border-2 border-dashed border-[#EAA100]/10 text-[#EAA100]/20 min-h-[400px]">
              <Shirt className="w-16 h-16 mb-4" />
              <p className="font-headline text-xl">Sélectionnez une fiche technique</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
