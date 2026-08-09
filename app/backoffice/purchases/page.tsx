"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  TrendingDown,
  Package,
  X,
} from "lucide-react";
import { debounce } from "@/app/lib/utils";
import { useToast } from "@/app/components";
import { authAPI, AchatRecord, CATEGORIES_ACHAT, STATUTS_ACHAT } from "@/app/lib/api";

export default function AdminPurchasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [purchases, setPurchases] = useState<AchatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fournisseur: "", categorie: "Matière Première", montant: 0,
    date_achat: new Date().toISOString().slice(0, 10), statut: "En attente" as string,
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSearchChange = useMemo(() => debounce((val: string) => {
    setDebouncedSearch(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("search", val);
    else params.delete("search");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, 300), [router, searchParams]);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authAPI.get<{ data: AchatRecord[] }>("/achats");
      setPurchases(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setPurchases([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  const filteredPurchases = purchases.filter(p => 
    p.fournisseur.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const totalSpent = purchases.reduce((acc, curr) => acc + curr.montant, 0);
  const enAttente = purchases.filter(p => p.statut === "En attente");
  const totalEnAttente = enAttente.reduce((acc, curr) => acc + curr.montant, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.post("/achats", formData);
      setShowForm(false);
      setFormData({ fournisseur: "", categorie: "Matière Première", montant: 0, date_achat: new Date().toISOString().slice(0, 10), statut: "En attente", description: "" });
      showToast("Achat ajouté", "success");
      fetchPurchases();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 md:px-12 py-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline text-3xl text-[#163526] mb-2">Gestion des Achats</h1>
          <p className="text-xs uppercase tracking-widest text-[#163526]/40 font-bold">Suivi des dépenses et fournisseurs</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#163526]/40" />
            <input
              type="text"
              placeholder="Fournisseur, article..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); handleSearchChange(e.target.value); }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#163526]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-[#163526] text-white rounded-2xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#163526]/90 transition-all shadow-lg shadow-[#163526]/10"
          >
            <Plus className="w-4 h-4" /> Nouvel Achat
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-700 font-medium">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] border border-[#163526]/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg text-[#163526]">Nouvel achat</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-[#163526]/40 hover:text-[#163526]"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Fournisseur" value={formData.fournisseur} onChange={(e) => setFormData({...formData, fournisseur: e.target.value})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm" />
            <select value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm">
              {CATEGORIES_ACHAT.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" step="0.01" required placeholder="Montant" value={formData.montant} onChange={(e) => setFormData({...formData, montant: Number(e.target.value)})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm" />
            <input type="date" required value={formData.date_achat} onChange={(e) => setFormData({...formData, date_achat: e.target.value})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm" />
            <select value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm">
              {STATUTS_ACHAT.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea placeholder="Description (optionnelle)" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-[#faf9f4] border border-[#163526]/10 rounded-xl text-sm" rows={1} />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-3 bg-[#163526] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#163526]/90 disabled:opacity-50">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-[#163526]/5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5"><TrendingDown className="w-24 h-24 text-red-500" /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40 mb-3">Total Dépenses</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-[#163526]">{totalSpent.toLocaleString()}</span>
            <span className="text-lg font-headline text-[#163526]/40">Ar</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-[#163526]/5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40 mb-3">En attente</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><Package className="w-5 h-5 text-orange-500" /></div>
            <span className="text-3xl font-headline font-bold text-[#163526]">{enAttente.length}</span>
          </div>
          <p className="mt-2 text-[9px] font-bold text-[#163526]/40 uppercase tracking-widest">Valeur: {totalEnAttente.toLocaleString()} Ar</p>
        </div>
        <div className="bg-[#163526] p-6 rounded-[2rem] text-white relative shadow-xl overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-orange-500"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Total achats</p>
          <p className="text-3xl font-headline font-bold text-white">{purchases.length}</p>
          <p className="mt-2 text-[10px] uppercase font-bold text-orange-400">{purchases.length} commandes fournisseur</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#163526]/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#163526]/5 flex justify-between items-center bg-[#faf9f4]/50">
          <h3 className="font-headline text-lg text-[#163526]">Historique des Achats</h3>
          <span className="text-[10px] font-bold text-[#163526]/40">{filteredPurchases.length} résultat(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#163526]/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Fournisseur</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Catégorie</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Montant</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Statut</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#1b1c19]/40">Chargement...</td></tr>
              ) : filteredPurchases.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#1b1c19]/40 italic">Aucun achat enregistré.</td></tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="border-b border-[#163526]/5 hover:bg-[#faf9f4]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#163526]/60 font-mono">{p.date_achat}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#163526]">{p.fournisseur}</p>
                      {p.description && <p className="text-[10px] text-[#163526]/40 italic">{p.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#163526]/5 text-[#163526]/60 text-[9px] font-bold uppercase rounded-full">{p.categorie}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#163526]">{p.montant.toLocaleString()} Ar</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded-full ${
                        p.statut === "Payé" ? "bg-green-100 text-green-700" :
                        p.statut === "En attente" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-600"
                      }`}>{p.statut}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
