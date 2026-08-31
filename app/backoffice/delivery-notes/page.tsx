"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, X, PackageCheck, CalendarDays, ClipboardList, CircleAlert, Check, Truck, Package, Loader, Printer } from "lucide-react";
import { authAPI, BonLivraisonRecord, STATUTS_BON_LIVRAISON } from "@/app/lib/api";
import { debounce } from "@/app/lib/utils";
import { TextileDocument, AdminSignaturePanel } from "@/app/components/documents";
import type { DocumentSignature, DocumentLineItem, TextileDocumentProps } from "@/app/components/documents/types";

const deliverySteps = ["Préparation", "Prête à expédier", "Expédiée", "Livrée"];

function bonToDoc(b: BonLivraisonRecord): Omit<TextileDocumentProps, "kind"> {
  const lines: DocumentLineItem[] = (b.articles ?? []).map((a) => ({
    description: a.designation,
    quantity: a.quantite,
    unit: a.unite,
    unitPrice: 0,
    taxRate: 0,
  }));

  if (lines.length === 0) {
    lines.push({
      description: b.commande_designation ?? "Articles à livrer",
      quantity: 1,
      unit: "lot",
      unitPrice: 0,
      taxRate: 0,
    });
  }

  return {
    number: b.numero ?? `BL-${String(b.id).slice(0, 8).toUpperCase()}`,
    issuedAt: b.date_livraison ?? new Date().toISOString(),
    client: {
      name: b.destinataire,
    },
    lines,
    currency: "MGA",
    status: b.statut,
    orderReference: b.commande_numero ?? undefined,
    deliveryAddress: b.destinataire,
    notes: b.notes ?? undefined,
    signature: b.admin_signature_name && b.admin_signature_at
      ? { name: b.admin_signature_name, signedAt: b.admin_signature_at }
      : undefined,
  };
}

function statusTone(status: string) {
  if (status === "Livré") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (status === "Expédié") return "bg-sky-50 text-sky-800 border-sky-200";
  if (status === "Annulé") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-amber-50 text-amber-800 border-amber-200";
}

function progressForStatus(status: string) {
  if (status === "Livré") return 3;
  if (status === "Expédié") return 2;
  return 1;
}

function currentDeliveryStep(status: string) {
  if (status === "Livré") return "Livrée";
  if (status === "Expédié") return "Expédiée";
  return "Prête à expédier";
}

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
  const [showDoc, setShowDoc] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);

  const [formData, setFormData] = useState({
    commande_id: "", numero: "", date_livraison: new Date().toISOString().slice(0, 10),
    destinataire: "", statut: "Préparé" as string, notes: "",
  });

  const [commandes, setCommandes] = useState<{ id: string; numero: string }[]>([]);

  const debouncedSearchRef = useRef<((val: string) => void) | null>(null);
  const handleSearchChange = (val: string) => {
    if (!debouncedSearchRef.current) {
      debouncedSearchRef.current = debounce((v: string) => {
        setDebouncedSearch(v);
        const params = new URLSearchParams(searchParams.toString());
        if (v) params.set("search", v);
        else params.delete("search");
        router.replace(`?${params.toString()}`, { scroll: false });
      }, 300);
    }
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(val);
    }
  };

  useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) {
        // cleanup debounce if needed
      }
    };
  }, []);

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

    const errors: string[] = [];
    if (!formData.commande_id) errors.push("La commande est requise.");
    if (!formData.numero.trim() || formData.numero.trim().length < 3) errors.push("Le numéro du bon de livraison est requis (min. 3 caractères).");
    if (!formData.date_livraison) errors.push("La date de livraison est requise.");
    if (!formData.destinataire.trim() || formData.destinataire.trim().length < 2) errors.push("Le destinataire est requis (min. 2 caractères).");

    if (errors.length > 0) {
      setError(errors.join(" "));
      setSaving(false);
      return;
    }

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

  const handleApprove = async (signature: DocumentSignature) => {
    if (!selectedBon) return;
    setSavingSignature(true);
    try {
      await authAPI.signBonLivraison(selectedBon.id, signature);
      await fetchBons();
    } finally {
      setSavingSignature(false);
    }
  };

  const filtered = bons.filter((b) =>
    b.numero.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    b.destinataire.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (b.commande_numero || "").toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  const selectedBon = bons.find((b) => b.id === selectedId) || null;

  return (
    <div className="px-6 md:px-12 py-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline text-3xl text-[#eccc90] mb-2">Bons de Livraison</h1>
          <p className="text-xs uppercase tracking-widest text-[#eccc90]/40 font-bold">Suivi des expéditions atelier</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#eccc90]/40" />
            <input
              type="text"
              placeholder="N°, destinataire..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); handleSearchChange(e.target.value); }}
              className="w-full pl-12 pr-4 py-3 bg-[#25303a] border border-[#e5ad46]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
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
        <form onSubmit={handleSubmit} className="bg-[#25303a] p-6 rounded-[2rem] border border-[#e5ad46]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg text-[#eccc90]">Nouveau bon de livraison</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-[#eccc90]/40 hover:text-[#eccc90]"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">Commande</label>
              <select required value={formData.commande_id} onChange={(e) => setFormData({...formData, commande_id: e.target.value})} className="w-full mt-1 px-4 py-3 bg-[#1e2a38] border border-[#e5ad46]/10 rounded-xl text-sm">
                <option value="">Sélectionner une commande</option>
                {commandes.map((c) => <option key={c.id} value={c.id}>{c.numero}</option>)}
              </select>
            </div>
            <input required placeholder="N° Bon de livraison" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} className="w-full px-4 py-3 bg-[#1e2a38] border border-[#e5ad46]/10 rounded-xl text-sm" />
            <input type="date" required value={formData.date_livraison} onChange={(e) => setFormData({...formData, date_livraison: e.target.value})} className="w-full px-4 py-3 bg-[#1e2a38] border border-[#e5ad46]/10 rounded-xl text-sm" />
            <input required placeholder="Destinataire" value={formData.destinataire} onChange={(e) => setFormData({...formData, destinataire: e.target.value})} className="w-full px-4 py-3 bg-[#1e2a38] border border-[#e5ad46]/10 rounded-xl text-sm" />
            <select value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})} className="w-full px-4 py-3 bg-[#1e2a38] border border-[#e5ad46]/10 rounded-xl text-sm">
              {STATUTS_BON_LIVRAISON.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea placeholder="Notes (optionnelle)" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 bg-[#1e2a38] border border-[#e5ad46]/10 rounded-xl text-sm md:col-span-2" rows={2} />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-3 bg-[#163526] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#163526]/90 disabled:opacity-50">
            {saving ? "Enregistrement..." : "Créer le bon de livraison"}
          </button>
        </form>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3" aria-label="Synthèse des statuts">
        {STATUTS_BON_LIVRAISON.map((s) => {
          const count = bons.filter((b) => b.statut === s).length;
          return (
            <div key={s} className="bg-[#25303a] p-5 rounded-2xl border border-[#e5ad46]/10 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-1">{s}</p>
              <div className="flex items-center gap-3">
                <PackageCheck className={`w-5 h-5 ${
                  s === "Livré" ? "text-green-500" :
                  s === "Expédié" ? "text-blue-500" :
                  s === "Annulé" ? "text-red-400" :
                  "text-orange-400"
                }`} />
                <span className="text-2xl font-headline font-bold text-[#eccc90]">{count}</span>
              </div>
            </div>
          );
        })}
      </section>

      <div className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#e5ad46]/10 flex justify-between items-center bg-[#1e2a38]/50">
          <h3 className="font-headline text-lg text-[#eccc90]">Tous les bons de livraison</h3>
          <span className="text-[10px] font-bold text-[#eccc90]/40">{filtered.length} résultat(s)</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#eccc90]/40">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#eccc90]/40 italic">Aucun bon de livraison.</div>
        ) : (
          <div className="divide-y divide-[#e5ad46]/10">
            {filtered.map((b) => (
              <div key={b.id} className={`transition-colors ${selectedId === b.id ? 'bg-[#1e2a38]' : 'hover:bg-[#1e2a38]/50'}`}>
                <div className="px-6 py-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-[#eccc90]/40">{b.numero}</span>
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide rounded-full border ${statusTone(b.statut)}`}>{b.statut}</span>
                    </div>
                    <p className="text-sm font-bold text-[#eccc90]">{b.destinataire}</p>
                    <div className="flex items-center gap-4 mt-1 text-[10px] text-[#eccc90]/40 font-medium">
                      <span>Commande: {b.commande_numero || "—"}</span>
                      <span>Date: {b.date_livraison}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedId(b.id); setShowDoc(false); }}
                      className="rounded-lg border border-[#e5ad46]/15 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-[#eccc90] transition hover:border-[#e5ad46] hover:text-[#e5ad46] focus:outline-none focus:ring-2 focus:ring-[#e5ad46]"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => { setSelectedId(b.id); setShowDoc(true); }}
                      className="rounded-lg border border-[#e5ad46]/40 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-[#eccc90] transition hover:bg-[#e5ad46] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e5ad46]"
                    >
                      Bon A4
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBon && !showDoc && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#163526]/35 p-0 sm:p-6 backdrop-blur-[2px] animate-in fade-in duration-200"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-note-title"
            className="relative w-full max-w-5xl max-h-[94vh] overflow-y-auto bg-[#1e2a38] shadow-2xl sm:rounded-[2rem] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
          >
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#e5ad46]/10 bg-[#1e2a38]/95 px-6 py-5 backdrop-blur md:px-10 md:py-7">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e5ad46]">Bon de livraison · {selectedBon.numero}</p>
                <h2 id="delivery-note-title" className="font-headline text-2xl text-[#eccc90] md:text-4xl">Expédition pour {selectedBon.destinataire}</h2>
                <p className="mt-2 flex items-center gap-2 text-xs text-[#eccc90]/55"><CalendarDays className="h-3.5 w-3.5" /> Prévue le {selectedBon.date_livraison}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDoc(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e5ad46]/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#eccc90] hover:bg-[#e5ad46]/10 transition-colors"
                >
                  <Printer className="h-4 w-4" /> Voir le bon A4
                </button>
                <button onClick={() => setSelectedId(null)} aria-label="Fermer le détail" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e5ad46]/10 text-[#eccc90]/60 transition hover:border-[#e5ad46]/10 hover:bg-[#163526] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e5ad46]">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="space-y-7 px-6 py-7 md:px-10 md:py-9">
              <div className="grid gap-3 border-y border-[#e5ad46]/10 py-4 text-sm md:grid-cols-3">
                <div><p className="text-[9px] font-bold uppercase tracking-widest text-[#eccc90]/45">Destinataire</p><p className="mt-1 font-semibold text-[#eccc90]">{selectedBon.destinataire}</p></div>
                <div><p className="text-[9px] font-bold uppercase tracking-widest text-[#eccc90]/45">Commande liée</p><p className="mt-1 font-semibold text-[#eccc90]">{selectedBon.commande_numero || "—"}{selectedBon.commande_designation ? ` · ${selectedBon.commande_designation}` : ""}</p></div>
                <div className="md:text-right"><p className="text-[9px] font-bold uppercase tracking-widest text-[#eccc90]/45">Statut</p><span className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${statusTone(selectedBon.statut)}`}>{selectedBon.statut}</span></div>
              </div>

              {selectedBon.statut === "Annulé" ? (
                <div className="flex gap-4 border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                  <div><p className="font-headline text-lg">Expédition annulée</p><p className="mt-1 text-sm text-rose-800/80">Ce bon de livraison est sorti du parcours normal de traitement.</p></div>
                </div>
              ) : (
                <section aria-label="Progression de la livraison" className="border-y border-[#e5ad46]/15 bg-[#25303a] px-3 py-10 md:px-8 md:py-12">
                  <div className="mb-10 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#eccc90]/45">Suivi opérationnel</p><h3 className="font-headline mt-1 text-2xl text-[#eccc90]">Progression de la livraison</h3><p className="mt-2 text-sm text-[#eccc90]/65">Étape actuelle : <strong className="font-semibold text-[#eccc90]">{currentDeliveryStep(selectedBon.statut)}</strong></p></div><PackageCheck className="h-8 w-8 shrink-0 text-[#e5ad46]" /></div>
                  <div className="relative grid grid-cols-4">
                    <div className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-[#163526]/15" />
                    <div className="absolute left-[12.5%] top-5 h-px bg-[#163526] transition-all duration-500" style={{ width: `${Math.max(0, progressForStatus(selectedBon.statut)) * 25}%` }} />
                    {deliverySteps.map((step, index) => {
                      const progress = progressForStatus(selectedBon.statut);
                      const completed = index < progress;
                      const current = index === progress;
                      return <div key={step} className="relative z-10 flex min-w-0 flex-col items-center text-center">
                        <span className={`grid h-10 w-10 place-items-center rounded-full border-4 transition ${completed ? "border-[#e5ad46]/10 bg-[#163526] text-white" : current ? "border-[#e5ad46] bg-[#1e2a38] text-[#eccc90] shadow-[0_0_0_8px_rgba(229,173,70,0.18)]" : "border-[#d9d7ce] bg-[#1e2a38] text-transparent"}`}>{completed ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}</span>
                        <span className={`mt-4 max-w-[7rem] text-[10px] font-bold uppercase leading-tight tracking-wide sm:text-[11px] ${completed || current ? "text-[#eccc90]" : "text-[#eccc90]/40"}`}>{step}</span>
                      </div>;
                    })}
                  </div>
                </section>
              )}

              <div className="grid overflow-hidden border border-[#e5ad46]/10 bg-[#25303a] md:grid-cols-[1.3fr_0.7fr]">
                <section className="p-5 md:p-7">
                  <div className="mb-4 flex items-center gap-2"><Package className="h-4 w-4 text-[#e5ad46]" /><h3 className="font-headline text-xl text-[#eccc90]">Articles à livrer</h3></div>
                  {selectedBon.articles && selectedBon.articles.length > 0 ? <div className="divide-y divide-[#163526]/10">{selectedBon.articles.map((article, index) => <div key={`${article.designation}-${index}`} className="flex items-center justify-between gap-4 py-4 first:pt-0"><div className="min-w-0"><p className="font-semibold text-[#eccc90]">{article.designation}</p><p className="mt-1 text-xs text-[#eccc90]/50">Article #{String(index + 1).padStart(2, "0")}</p></div><p className="shrink-0 font-headline text-lg text-[#eccc90]"><span className="text-[#e5ad46]">{article.quantite}</span> <span className="text-sm text-[#eccc90]/55">{article.unite}</span></p></div>)}</div> : <div className="border border-dashed border-[#e5ad46]/15 bg-[#1e2a38] p-5 text-sm text-[#eccc90]/55">Aucun article n’est associé à ce bon de livraison.</div>}
                </section>
                <aside className="space-y-6 border-t border-[#e5ad46]/10 bg-[#1e2a38] p-5 md:border-l md:border-t-0 md:p-7">
                  <section><div className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#e5ad46]" /><h3 className="font-headline text-lg text-[#eccc90]">Expédition</h3></div><p className="mt-3 text-sm leading-relaxed text-[#eccc90]/65">Les informations transporteur et suivi ne sont pas encore renseignées pour ce bon.</p></section>
                  {selectedBon.notes && <section className="border-l-2 border-[#e5ad46] pl-4"><p className="text-[9px] font-bold uppercase tracking-widest text-[#eccc90]/45">Note interne</p><p className="mt-2 text-sm leading-relaxed text-[#eccc90]/75">{selectedBon.notes}</p></section>}
                </aside>
              </div>

              <footer className="flex flex-col gap-3 border-t border-[#e5ad46]/10 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-xs text-[#eccc90]/50"><ClipboardList className="h-4 w-4" /> Mettre à jour l’avancement du bon</p><div className="flex flex-wrap gap-2">{STATUTS_BON_LIVRAISON.map((status) => <button key={status} disabled={status === selectedBon.statut} onClick={() => updateStatut(selectedBon.id, status)} className={`rounded-lg border px-3 py-2 text-[9px] font-bold uppercase tracking-wide transition focus:outline-none focus:ring-2 focus:ring-[#e5ad46] disabled:cursor-default ${status === selectedBon.statut ? "border-[#e5ad46]/10 bg-[#163526] text-white" : "border-[#e5ad46]/15 bg-[#25303a] text-[#eccc90]/65 hover:border-[#e5ad46] hover:text-[#eccc90]"}`}>{status}</button>)}</div></footer>
            </div>
          </section>
        </div>
      )}

      {selectedBon && showDoc && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0b1320]/70 p-0 sm:p-6 backdrop-blur-sm print:static print:bg-transparent print:p-0 print:backdrop-blur-0"
          role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowDoc(false); }}
        >
          <div className="relative w-full max-w-[920px] max-h-[96vh] overflow-y-auto bg-transparent sm:rounded-2xl print:max-h-none print:overflow-visible">
            <div className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-[#163526]/95 px-4 py-3 sm:px-6 sm:py-4 backdrop-blur border-b border-[#e5ad46]/15 print:hidden">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.22em] text-[#eccc90]/45">Bon de livraison · A4</p>
                <h2 className="font-headline text-lg text-[#eccc90]">{selectedBon.numero}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e5ad46]/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#eccc90] hover:bg-[#e5ad46]/15 transition"
                >
                  <Printer className="h-4 w-4" /> Imprimer
                </button>
                <button
                  type="button"
                  onClick={() => setShowDoc(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#eccc90]/15 text-[#eccc90]/60 hover:bg-[#eccc90]/10 hover:text-[#eccc90] transition"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-0 py-4 sm:px-2 sm:py-6 print:px-0 print:py-0">
              <TextileDocument kind="delivery_note" {...bonToDoc(selectedBon)} />

              <div className="px-4 sm:px-6 mt-6 print:hidden max-w-[210mm] mx-auto">
                {savingSignature ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-[#e5ad46]/30 bg-[#fffdf8] p-5 text-[#172d42]">
                    <Loader className="h-4 w-4 animate-spin text-[#e5ad46]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Enregistrement de la signature…</span>
                  </div>
                ) : (
                  <AdminSignaturePanel
                    initialSignature={
                      selectedBon.admin_signature_name && selectedBon.admin_signature_at
                        ? { name: selectedBon.admin_signature_name, signedAt: selectedBon.admin_signature_at }
                        : undefined
                    }
                    onApprove={handleApprove}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
