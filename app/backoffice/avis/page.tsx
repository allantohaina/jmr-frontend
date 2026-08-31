"use client";

import React, { useState, useEffect, useCallback } from "react";
import { avisAPI, type AvisRecord } from "@/app/lib/api";
import { Loader, Check, X } from "lucide-react";

const FILTERS = [
  { key: "pending", label: "En attente" },
  { key: "approved", label: "Approuvés" },
  { key: "rejected", label: "Rejetés" },
  { key: "", label: "Tous" },
] as const;

export default function AvisModerationPage() {
  const [avis, setAvis] = useState<AvisRecord[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await avisAPI.moderationList(filter || undefined);
      setAvis(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchAvis(); }, [fetchAvis]);

  const setStatut = async (id: string, statut: string) => {
    try {
      await avisAPI.updateStatut(id, statut);
      await fetchAvis();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const stars = (note: number) => "★".repeat(Math.max(0, Math.min(5, note))) + "☆".repeat(Math.max(0, 5 - Math.min(5, note)));

  const counts: Record<string, number> = {};

  return (
    <div className="px-6 md:px-12 py-10 space-y-8">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="font-headline text-3xl text-[#eccc90]">Avis clients</h2>
          <p className="text-[#eccc90]/40 text-xs font-bold uppercase tracking-widest mt-1">Modération · JMR Atelier</p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${filter === f.key ? "bg-[#163526] text-[#e5ad46]" : "border border-[#e5ad46]/15 text-[#eccc90] hover:border-[#e5ad46]"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-700 font-medium">{error}</div>}

      <div className="bg-[#25303a] rounded-[2rem] overflow-hidden shadow-sm border border-[#e5ad46]/10">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#eccc90]/40">Chargement...</div>
        ) : avis.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#eccc90]/40 italic">Aucun avis pour ce filtre.</div>
        ) : (
          <div className="divide-y divide-[#e5ad46]/10">
            {avis.map((a) => (
              <div key={a.id} className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-[#eccc90]">{a.auteur || "Anonyme"}</span>
                      <span className="text-[#e5ad46] text-sm tracking-widest">{stars(a.note)}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${
                        a.statut === "approved" ? "bg-green-50 text-green-700 border-green-100" :
                        a.statut === "rejected" ? "bg-red-50 text-red-600 border-red-100" :
                        "bg-orange-50 text-orange-600 border-orange-100"
                      }`}>{a.statut}</span>
                    </div>
                    <p className="text-xs text-[#eccc90]/70">{a.commentaire || "—"}</p>
                    <p className="text-[10px] text-[#eccc90]/40 mt-1">
                      {a.produit_nom || "Produit"} · {(a.created_at || "").slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.statut === "pending" && (
                      <>
                        <button onClick={() => setStatut(a.id, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-green-50 border border-green-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-green-700 hover:bg-green-100">
                          <Check className="h-3 w-3" /> Approuver
                        </button>
                        <button onClick={() => setStatut(a.id, "rejected")} className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-100">
                          <X className="h-3 w-3" /> Rejeter
                        </button>
                      </>
                    )}
                    {a.statut !== "pending" && (
                      <button onClick={() => setStatut(a.id, "pending")} className="rounded-lg border border-[#e5ad46]/15 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#eccc90] hover:border-[#e5ad46]">
                        Revenir en attente
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}