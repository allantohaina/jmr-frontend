"use client";

import React, { useState, useEffect } from "react";
import { authAPI } from "../../lib/api";

export default function AdminProductionPage() {
  const [selectedStat, setSelectedStat] = React.useState<string | null>(null);
  const [productionLines, setProductionLines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProduction() {
      try {
        const response = await authAPI.get<any[]>("/production");
        setProductionLines(response.data);
      } catch (error) {
        console.error("Failed to fetch production data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduction();
  }, []);

  const STATS_DETAILS: Record<string, { title: string; items: { label: string; motive: string; status: "error" | "warning" | "success" }[] }> = {
    "Machines Actives": {
      title: "État des Machines",
      items: [
        { label: "Piqueuse Brother #1", motive: "Opérationnelle", status: "success" },
        { label: "Surjeteuse Juki #4", motive: "Moteur HS - En attente de pièce", status: "error" },
        { label: "Boutonnière #2", motive: "Maintenance préventive", status: "warning" },
      ]
    },
    "Retards": {
      title: "Causes des Retards",
      items: [
        { label: "Commande #CMD-2024-001", motive: "Rupture de stock fil nylon bleu", status: "error" },
        { label: "Commande #CMD-2024-003", motive: "Absence opérateur spécialisé", status: "warning" },
      ]
    }
  };

  return (
    <div className="px-6 md:px-12 py-10 space-y-10">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="font-headline text-3xl text-[#163526]">Suivi de Production</h2>
          <p className="text-[#1b1c19]/40 text-xs font-bold uppercase tracking-widest mt-1">État des machines et flux de travail en temps réel</p>
        </div>
        <button 
          onClick={() => alert("Impression du rapport de production en cours...")}
          className="px-6 py-3 bg-white text-[#163526] font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-2 border border-[#163526]/10 hover:bg-[#163526]/5 transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">print</span>
          Rapport PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Machines Actives", value: isLoading ? "..." : "12/15", color: "text-green-600" },
          { label: "Taux d'Efficacité", value: isLoading ? "..." : "94%", color: "text-[#163526]" },
          { label: "Retards", value: isLoading ? "..." : productionLines.filter(l => l.status === 'probleme').length, color: "text-orange-500" },
          { label: "Qualité", value: isLoading ? "..." : "99.1%", color: "text-[#163526]" },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedStat(stat.label)}
            className="bg-white p-6 rounded-2xl border border-[#163526]/5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">{stat.label}</p>
            <div className="flex justify-between items-end">
              <p className={`text-3xl font-headline font-bold ${stat.color}`}>{stat.value}</p>
              <span className="material-symbols-outlined text-[#163526]/20 group-hover:text-orange-500 transition-colors">analytics</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Panel for Stats Motives */}
      {selectedStat && STATS_DETAILS[selectedStat] && (
        <div className="bg-[#163526] rounded-[2rem] p-8 text-white animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline text-xl">{STATS_DETAILS[selectedStat].title} - Motifs détaillés</h3>
            <button onClick={() => setSelectedStat(null)} className="text-white/40 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STATS_DETAILS[selectedStat].items.map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{item.label}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                    item.status === 'warning' ? 'bg-orange-400' : 'bg-green-500'
                  }`} />
                </div>
                <p className="text-sm font-bold">{item.motive}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] p-8 border border-[#163526]/5 shadow-sm">
        <h3 className="font-headline text-xl text-[#163526] mb-8">Lignes de Production</h3>
        <div className="space-y-8">
          {isLoading ? (
            <p className="text-[#1b1c19]/40 italic text-sm">Chargement des lignes...</p>
          ) : productionLines.length === 0 ? (
            <p className="text-[#1b1c19]/40 italic text-sm">Aucune ligne de production active.</p>
          ) : (
            productionLines.map((line) => (
              <div key={line.id} className="space-y-4 group">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-bold text-[#163526] group-hover:text-orange-500 transition-colors">{line.name}</p>
                    <p className="text-[10px] text-[#1b1c19]/40 uppercase font-bold tracking-widest">Commande {line.order}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-[10px] font-bold text-[#163526] uppercase tracking-widest">{line.progress}% Complété</p>
                    <button 
                      onClick={() => alert(`Gestion de la ligne ${line.id}`)}
                      className="p-2 hover:bg-[#163526]/5 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm text-[#163526]/40 hover:text-[#163526]">settings</span>
                    </button>
                  </div>
                </div>
                <div className="h-3 w-full bg-[#163526]/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${line.status === 'probleme' ? 'bg-red-400' : 'bg-[#163526]'} rounded-full shadow-[0_0_8px_rgba(22,53,38,0.2)] transition-all group-hover:opacity-80`}
                    style={{ width: `${line.progress}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
