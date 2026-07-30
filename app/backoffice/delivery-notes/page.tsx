"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, X, PackageCheck } from "lucide-react";
import { authAPI, BonLivraisonRecord, STATUTS_BON_LIVRAISON } from "@/app/lib/api";
import { debounce } from "@/app/lib/utils";

export default function AdminDeliveryNotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bons, setBons] = useState<BonLivraisonRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("id"));

  const [formData, setFormData] = useState({
    commande_id: "", numero: "", date_livraison: new Date().toISOString().slice(0, 10),
    destinataire: "", statut: "Préparé" as string, notes: "",
  });

  const [commandes, setCommandes] = useState<{ id: string; numero: string }[]>([]);

  const handleSearchChange = useCallback(debounce((val: string) => {
    setDebouncedSearch(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("search", val);
    else params.delete("search");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, 300), [router, searchParams]);

  const fetchBons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authAPI.get<{ data: BonLivraisonRecord[] }>("/bon-livraison");
      setBons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setBons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCommandes = useCallback(async () => {
    try {
      const res = await authAPI.get<{ data: { id: string; numero: string; designation: string }[] }>("/commandes");
      if (Array.isArray(res.data)) {
        setCommandes(res.data.map((c: { id: string; numero: string }) => ({ id: c.id, numero: c.numero })));
      }
    } catch {}
  }, []);

  useEffect(() => { fetchBons(); fetchCommandes(); }, [fetchBons, fetchCommandes]);

  const updateStatut = async (id: string, statut: string) => {
    try {
      await authAPI.put(`/bon-livraison/${id}`, { statut });
      fetchBons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.post("/bon-livraison", formData);
      setShowForm(false);
      setFormData({ commande_id: "", numero: "", date_livraison: new Date().toISOString().slice(0, 10), destinataire: "", statut: "Préparé", notes: "" });
      fetchBons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const filtered = bons.filter((b) =>
    b.numero.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    b.destinataire.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (b.commande_numero || "").toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="px-6 md:px-12 py-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline text-3xl text-[#163526] mb-2">Bons de Livraison</h1>
          <p className="text-xs uppercase tracking-widest text-[#163526]/40 font-bold">Suivi des expéditions atelier</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#163526]/40" />
            <input
              type="text"
              placeholder="N°, destinataire..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); handleSearchChange(e.target.value); }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#163526]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-[#163526] text-white rounded-2xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#163526]/90 transition-all shadow-lg shadow-[#163526]/10"
          >
            <Plus className="w-4 h-4" /> Nouveau BL
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-700 font-medium">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] border border-[#163526]/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg text-[#163526]">Nouveau bon de livraison</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-[#163526]/40 hover:text-[#163526]"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Commande</label>
              <select required value={formData.commande_id} onChange={(e) => setFormData({...formData, commande_id: e.target.value})} className="w-full mt-1 px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm">
                <option value="">Sélectionner une commande</option>
                {commandes.map((c) => <option key={c.id} value={c.id}>{c.numero}</option>)}
              </select>
            </div>
            <input required placeholder="N° Bon de livraison" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm" />
            <input type="date" required value={formData.date_livraison} onChange={(e) => setFormData({...formData, date_livraison: e.target.value})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm" />
            <input required placeholder="Destinataire" value={formData.destinataire} onChange={(e) => setFormData({...formData, destinataire: e.target.value})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm" />
            <select value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm">
              {STATUTS_BON_LIVRAISON.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea placeholder="Notes (optionnelle)" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm md:col-span-2" rows={2} />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-3 bg-[#163526] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#163526]/90 disabled:opacity-50">
            {saving ? "Enregistrement..." : "Créer le bon de livraison"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUTS_BON_LIVRAISON.map((s) => {
          const count = bons.filter((b) => b.statut === s).length;
          return (
            <div key={s} className="bg-white p-5 rounded-2xl border border-[#163526]/5 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">{s}</p>
              <div className="flex items-center gap-3">
                <PackageCheck className={`w-5 h-5 ${
                  s === "Livré" ? "text-green-500" :
                  s === "Expédié" ? "text-blue-500" :
                  s === "Annulé" ? "text-red-400" :
                  "text-orange-400"
                }`} />
                <span className="text-2xl font-headline font-bold text-[#163526]">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#163526]/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#163526]/5 flex justify-between items-center bg-[#faf9f4]/50">
          <h3 className="font-headline text-lg text-[#163526]">Tous les bons de livraison</h3>
          <span className="text-[10px] font-bold text-[#163526]/40">{filtered.length} résultat(s)</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#1b1c19]/40">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#1b1c19]/40 italic">Aucun bon de livraison.</div>
        ) : (
          <div className="divide-y divide-[#163526]/5">
            {filtered.map((b) => (
              <div key={b.id} className={`transition-colors ${selectedId === b.id ? 'bg-[#faf9f4]' : 'hover:bg-[#faf9f4]/50'}`}>
                <div className="px-6 py-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-[#163526]/40">{b.numero}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${
                        b.statut === "Livré" ? "bg-green-50 text-green-700 border-green-100" :
                        b.statut === "Expédié" ? "bg-blue-50 text-blue-700 border-blue-100" :
                        b.statut === "Annulé" ? "bg-red-50 text-red-600 border-red-100" :
                        "bg-orange-50 text-orange-600 border-orange-100"
                      }`}>{b.statut}</span>
                    </div>
                    <p className="text-sm font-bold text-[#163526]">{b.destinataire}</p>
                    <div className="flex items-center gap-4 mt-1 text-[10px] text-[#163526]/40 font-medium">
                      <span>Commande: {b.commande_numero || "—"}</span>
                      <span>Date: {b.date_livraison}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {STATUTS_BON_LIVRAISON.map((s) => {
                      const actif = s === b.statut;
                      return (
                        <button
                          key={s}
                          disabled={actif}
                          onClick={() => updateStatut(b.id, s)}
                          title={s}
                          className={`px-2 py-1 text-[8px] font-bold uppercase rounded-lg transition-all ${
                            actif ? "bg-[#e5ad46] text-white" :
                            "bg-[#163526]/5 text-[#163526]/40 hover:bg-[#e5ad46]/20 hover:text-[#e5ad46]"
                          }`}
                        >
                          {s.slice(0, 3)}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setSelectedId(selectedId === b.id ? null : b.id)}
                      className="ml-2 text-[9px] font-bold uppercase tracking-widest text-[#e5ad46] hover:underline"
                    >
                      {selectedId === b.id ? "Fermer" : "Détails"}
                    </button>
                  </div>
                </div>

                {selectedId === b.id && (
                  <div className="px-6 pb-5 pt-0 border-t border-[#163526]/5 bg-[#faf9f4]/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">Destinataire</p>
                        <p className="font-medium text-[#163526]">{b.destinataire}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">Date livraison</p>
                        <p className="text-[#163526]">{b.date_livraison}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">Commande liée</p>
                        <p className="text-[#163526]">{b.commande_numero || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">Statut</p>
                        <p className="text-[#163526]">{b.statut}</p>
                      </div>
                      {b.notes && (
                        <div className="col-span-full">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">Notes</p>
                          <p className="text-[#163526]/70 text-xs italic">{b.notes}</p>
                        </div>
                      )}
                      {b.articles && b.articles.length > 0 && (
                        <div className="col-span-full">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-2">Articles</p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-[#163526]/10">
                                <th className="text-left py-1 text-[#163526]/40 font-bold">Désignation</th>
                                <th className="text-right py-1 text-[#163526]/40 font-bold">Qté</th>
                                <th className="text-right py-1 text-[#163526]/40 font-bold">Unité</th>
                              </tr>
                            </thead>
                            <tbody>
                              {b.articles.map((a, i) => (
                                <tr key={i} className="border-b border-[#163526]/5">
                                  <td className="py-1 text-[#163526]">{a.designation}</td>
                                  <td className="py-1 text-right text-[#163526]">{a.quantite}</td>
                                  <td className="py-1 text-right text-[#163526]/60">{a.unite}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
