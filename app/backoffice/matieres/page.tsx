"use client";

import React, { useState, useEffect, useCallback } from "react";
import { matieresAPI, type MatiereRecord, type MouvementStockRecord } from "@/app/lib/api";
import { Loader, Plus, AlertTriangle, RefreshCw, Minus } from "lucide-react";

export default function MatieresPage() {
  const [matieres, setMatieres] = useState<MatiereRecord[]>([]);
  const [alertes, setAlertes] = useState<MatiereRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<MatiereRecord | null>(null);
  const [mouvements, setMouvements] = useState<MouvementStockRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: "", unite: "m", stock_actuel: "0", stock_seuil: "0", prix_unite: "0", fournisseur: "", description: "" });
  const [mouvement, setMouvement] = useState({ matiere_id: "", type: "entree", quantite: "0", motif: "" });
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await matieresAPI.list();
      setMatieres(Array.isArray(res.data?.data) ? res.data.data : []);
      setAlertes(Array.isArray(res.data?.alertes) ? res.data.alertes : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openDetail = async (m: MatiereRecord) => {
    setDetail(m);
    setMouvement({ matiere_id: m.id, type: "entree", quantite: "0", motif: "" });
    setMouvements([]);
    try {
      const res = await matieresAPI.get(m.id);
      setDetail(res.data.data);
      setMouvements(Array.isArray(res.data.mouvements) ? res.data.mouvements : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const createMatiere = async () => {
    setSaving(true);
    setError(null);
    try {
      await matieresAPI.create({
        nom: form.nom,
        unite: form.unite,
        stock_actuel: Number(form.stock_actuel) || 0,
        stock_seuil: Number(form.stock_seuil) || 0,
        prix_unite: Number(form.prix_unite) || 0,
        fournisseur: form.fournisseur || null,
        description: form.description || null,
      });
      setShowForm(false);
      setForm({ nom: "", unite: "m", stock_actuel: "0", stock_seuil: "0", prix_unite: "0", fournisseur: "", description: "" });
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const submitMouvement = async () => {
    setSaving(true);
    setError(null);
    try {
      await matieresAPI.mouvement({
        matiere_id: mouvement.matiere_id,
        type: mouvement.type,
        quantite: Number(mouvement.quantite) || 0,
        motif: mouvement.motif,
      });
      if (detail) await openDetail(detail);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number | string | undefined) => Number(n ?? 0).toLocaleString("fr-FR");

  return (
    <div className="px-6 md:px-12 py-10 space-y-8">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="font-headline text-3xl text-[#163526]">Matières premières</h2>
          <p className="text-[#1b1c19]/40 text-xs font-bold uppercase tracking-widest mt-1">Stock atelier · JMR</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#163526] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] hover:bg-[#1e4234] transition-colors"
        >
          <Plus className="h-4 w-4" /> Nouvelle matière
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-700 font-medium">{error}</div>}

      {alertes.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold uppercase tracking-widest mb-1">{alertes.length} matière(s) sous le seuil minimum</p>
            <p className="text-red-600/80">{alertes.map((a) => a.nom).join(", ")}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#163526]/5 p-6 shadow-sm">
          <h3 className="font-headline text-lg text-[#163526] mb-4">Ajouter une matière</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Nom *" className="rounded-xl border border-[#163526]/15 px-4 py-2.5 text-sm text-[#163526]" />
            <select value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })} className="rounded-xl border border-[#163526]/15 px-4 py-2.5 text-sm text-[#163526]">
              {["m", "kg", "pce", "L", "rouleau"].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input value={form.fournisseur} onChange={(e) => setForm({ ...form, fournisseur: e.target.value })} placeholder="Fournisseur" className="rounded-xl border border-[#163526]/15 px-4 py-2.5 text-sm text-[#163526]" />
            <input type="number" value={form.stock_actuel} onChange={(e) => setForm({ ...form, stock_actuel: e.target.value })} placeholder="Stock actuel" className="rounded-xl border border-[#163526]/15 px-4 py-2.5 text-sm text-[#163526]" />
            <input type="number" value={form.stock_seuil} onChange={(e) => setForm({ ...form, stock_seuil: e.target.value })} placeholder="Seuil d'alerte" className="rounded-xl border border-[#163526]/15 px-4 py-2.5 text-sm text-[#163526]" />
            <input type="number" value={form.prix_unite} onChange={(e) => setForm({ ...form, prix_unite: e.target.value })} placeholder="Prix unitaire" className="rounded-xl border border-[#163526]/15 px-4 py-2.5 text-sm text-[#163526]" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-xl border border-[#163526]/15 px-4 py-2.5 text-sm text-[#163526] md:col-span-3" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={createMatiere} disabled={saving || !form.nom} className="rounded-xl bg-[#e5ad46] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#163526] hover:brightness-105 disabled:opacity-50">
              {saving ? "Enregistrement..." : "Créer"}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-[#163526]/15 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#163526]">Annuler</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Références", matieres.length], ["Alertes stock", alertes.length], ["Stock total", matieres.reduce((s, m) => s + Number(m.stock_actuel ?? 0), 0).toLocaleString("fr-FR")], ["Fournisseurs", new Set(matieres.map((m) => m.fournisseur).filter(Boolean)).size]].map(([label, value]) => (
          <div key={label} className="bg-white rounded-2xl border border-[#163526]/5 p-4 shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">{label}</p>
            <p className="text-2xl font-headline font-bold text-[#163526]">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#163526]/5">
        <div className="p-6 border-b border-[#163526]/5">
          <h3 className="font-headline text-lg text-[#163526]">Catalogue des matières</h3>
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#1b1c19]/40">Chargement...</div>
        ) : matieres.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#1b1c19]/40 italic">Aucune matière enregistrée.</div>
        ) : (
          <div className="divide-y divide-[#163526]/5">
            {matieres.map((m) => (
              <div key={m.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <button onClick={() => openDetail(m)} className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold text-[#163526] truncate">
                    {m.nom}
                    {m.alerte && <span className="ml-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-red-50 text-red-600 border border-red-100">Stock bas</span>}
                  </p>
                  <p className="text-[10px] text-[#163526]/40 font-medium mt-0.5">
                    {fmt(m.stock_actuel)} {m.unite} · Seuil {fmt(m.stock_seuil)} {m.unite} · {Number(m.prix_unite).toLocaleString("fr-FR")} Ar/m
                    {m.fournisseur ? ` · ${m.fournisseur}` : ""}
                  </p>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => { setDetail(m); setMouvement({ matiere_id: m.id, type: "entree", quantite: "0", motif: "" }); }} className="inline-flex items-center gap-1 rounded-lg border border-[#163526]/15 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#163526] hover:border-[#e5ad46] hover:text-[#e5ad46]">
                    <Plus className="h-3 w-3" /> Entrée
                  </button>
                  <button onClick={() => { setDetail(m); setMouvement({ matiere_id: m.id, type: "sortie", quantite: "0", motif: "" }); }} className="inline-flex items-center gap-1 rounded-lg border border-[#163526]/15 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#163526] hover:border-[#e5ad46] hover:text-[#e5ad46]">
                    <Minus className="h-3 w-3" /> Sortie
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1320]/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-headline text-lg text-[#163526]">{detail.nom}</h3>
                <p className="text-[10px] text-[#163526]/40 font-medium">
                  Stock actuel : <span className="font-bold text-[#163526]">{fmt(detail.stock_actuel)} {detail.unite}</span> · Seuil : {fmt(detail.stock_seuil)}
                </p>
              </div>
              <button onClick={() => setDetail(null)} className="text-[#163526]/40 hover:text-[#163526]">✕</button>
            </div>

            <div className="rounded-xl bg-[#faf9f4] border border-[#163526]/5 p-4 mb-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-2">Nouveau mouvement</p>
              <div className="flex gap-2 mb-2">
                {["entree", "sortie", "ajustement"].map((t) => (
                  <button key={t} onClick={() => setMouvement({ ...mouvement, type: t })} className={`rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${mouvement.type === t ? "bg-[#e5ad46] text-[#163526]" : "bg-white border border-[#163526]/15 text-[#163526]"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="number" value={mouvement.quantite} onChange={(e) => setMouvement({ ...mouvement, quantite: e.target.value })} placeholder="Quantité" className="flex-1 rounded-lg border border-[#163526]/15 px-3 py-2 text-sm text-[#163526]" />
                <input value={mouvement.motif} onChange={(e) => setMouvement({ ...mouvement, motif: e.target.value })} placeholder="Motif" className="flex-1 rounded-lg border border-[#163526]/15 px-3 py-2 text-sm text-[#163526]" />
                <button onClick={submitMouvement} disabled={saving} className="rounded-lg bg-[#163526] px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#e5ad46] disabled:opacity-50">
                  OK
                </button>
              </div>
            </div>

            <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-2">Historique des mouvements</p>
            {mouvements.length === 0 ? (
              <p className="text-xs text-[#163526]/40 italic">Aucun mouvement enregistré.</p>
            ) : (
              <div className="divide-y divide-[#163526]/5">
                {mouvements.map((mv) => (
                  <div key={mv.id} className="py-2 flex justify-between text-sm">
                    <span className={`font-bold ${mv.type === "entree" ? "text-green-600" : mv.type === "sortie" ? "text-red-600" : "text-[#163526]"}`}>
                      {mv.type} · {fmt(mv.quantite)} {detail.unite}
                    </span>
                    <span className="text-[10px] text-[#163526]/40">{mv.motif || ""} · {(mv.created_at || "").slice(0, 10)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}