"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import { useToast } from "@/app/components/toast-provider";

const STORAGE_KEY = "jmr_devis_drafts";

type Draft = {
  id: string;
  ref: string;
  createdAt: string;
  client: string;
  produit: string;
  quantite: string;
  tissu: string;
  budget: string;
  notes: string;
  updatedAt: string;
};

const emptyForm = {
  client: "",
  produit: "",
  quantite: "",
  tissu: "",
  budget: "",
  notes: "",
};

function loadDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function genRef(): string {
  const y = new Date().getFullYear().toString().slice(-2);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DV-${y}-${rand}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BrouillonsClient() {
  const { showToast } = useToast();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  const sorted = useMemo(
    () => [...drafts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [drafts]
  );

  const persist = (next: Draft[]) => {
    setDrafts(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      showToast("Impossible d'enregistrer dans le navigateur.", "error");
    }
  };

  const openModal = (id: string | null) => {
    setEditingId(id);
    if (id) {
      const draft = drafts.find((d) => d.id === id);
      if (!draft) return;
      setForm({
        client: draft.client,
        produit: draft.produit,
        quantite: draft.quantite,
        tissu: draft.tissu,
        budget: draft.budget,
        notes: draft.notes,
      });
    } else {
      setForm({ ...emptyForm });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const saveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const data = {
      client: form.client.trim(),
      produit: form.produit.trim(),
      quantite: form.quantite.trim(),
      tissu: form.tissu.trim(),
      budget: form.budget.trim(),
      notes: form.notes.trim(),
      updatedAt: now,
    };

    if (editingId) {
      persist(drafts.map((d) => (d.id === editingId ? { ...d, ...data } : d)));
      showToast("Brouillon mis à jour");
    } else {
      const draft: Draft = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
        ref: genRef(),
        createdAt: now,
        ...data,
      };
      persist([...drafts, draft]);
      showToast("Brouillon enregistré");
    }
    closeModal();
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    persist(drafts.filter((d) => d.id !== confirmDelete));
    showToast("Brouillon supprimé");
    setConfirmDelete(null);
  };

  const set = (key: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const fieldCls =
    "w-full bg-[#25303a] border border-[#e5ad46]/10 text-[#eccc90] font-body text-sm px-3 py-2.5 rounded-lg outline-none transition-colors focus:border-[#e5ad46]/60 placeholder:text-[#eccc90]/25";

  return (
    <div className="min-h-screen bg-[#1e2a38] font-body text-[#eccc90]">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[#e5ad46]/10 pb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e5ad46]">
              JMR Textile — Atelier
            </p>
            <h1 className="mt-1 font-headline text-3xl font-medium tracking-tight text-[#eccc90]">
              Brouillons de devis
            </h1>
            <p className="mt-1 font-mono text-xs text-[#eccc90]/50">
              {sorted.length === 0
                ? "0 brouillon"
                : sorted.length === 1
                  ? "1 brouillon"
                  : `${sorted.length} brouillons`}
            </p>
          </div>
          <button
            onClick={() => openModal(null)}
            className="flex items-center gap-2 rounded-lg bg-[#e5ad46] px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#1e2a38] transition-all hover:bg-[#eccc90]"
          >
            <Plus className="h-4 w-4" /> Nouveau brouillon
          </button>
        </header>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center border border-dashed border-[#e5ad46]/15 rounded-xl px-6 py-20 text-center">
            <FileText className="mb-4 h-10 w-10 text-[#eccc90]/20" />
            <p className="font-headline text-xl text-[#eccc90]">Aucun brouillon pour l&apos;instant</p>
            <p className="mt-1 text-sm text-[#eccc90]/50">
              Créez un brouillon pour préparer un devis avant de l&apos;envoyer.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((d) => (
              <div
                key={d.id}
                className="flex flex-col gap-4 rounded-xl border border-[#e5ad46]/10 bg-[#25303a] p-5 transition-colors hover:border-[#e5ad46]/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] tracking-wider text-[#e5ad46]">{d.ref}</p>
                  <p className="truncate font-headline text-lg text-[#eccc90]">
                    {d.client || "Sans nom"}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#eccc90]/50">
                    {d.produit && <span>{d.produit}</span>}
                    {d.quantite && <span>{d.quantite} pcs</span>}
                    {d.budget && <span>{d.budget} Ar</span>}
                    <span className="font-mono text-[11px]">Modifié le {formatDate(d.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openModal(d.id)}
                    className="flex items-center gap-2 rounded-lg border border-[#e5ad46]/15 px-3 py-2 text-xs text-[#eccc90]/60 transition-colors hover:border-[#e5ad46]/40 hover:text-[#eccc90]"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </button>
                  <button
                    onClick={() => setConfirmDelete(d.id)}
                    className="flex items-center gap-2 rounded-lg border border-red-400/25 px-3 py-2 text-xs text-red-300 transition-colors hover:bg-red-400/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-[#060d1a]/80 p-5 py-14 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-lg rounded-xl border border-[#e5ad46]/15 bg-[#25303a] p-7">
            <h2 className="font-headline text-xl font-medium text-[#eccc90]">
              {editingId ? "Modifier le brouillon" : "Nouveau brouillon"}
            </h2>
            <form onSubmit={saveDraft} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-[#eccc90]/50">
                  Client / Entreprise
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Boutique Andriana"
                  value={form.client}
                  onChange={set("client")}
                  className={fieldCls}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-[#eccc90]/50">
                    Type de produit
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Lamba, chemise, uniforme..."
                    value={form.produit}
                    onChange={set("produit")}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-[#eccc90]/50">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex : 200"
                    value={form.quantite}
                    onChange={set("quantite")}
                    className={fieldCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-[#eccc90]/50">
                    Tissu / matière
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Coton bio"
                    value={form.tissu}
                    onChange={set("tissu")}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-[#eccc90]/50">
                    Budget indicatif (Ar)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : 4 500 000"
                    value={form.budget}
                    onChange={set("budget")}
                    className={fieldCls}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-[#eccc90]/50">
                  Notes internes
                </label>
                <textarea
                  placeholder="Détails, contraintes, délai souhaité..."
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                  className={`${fieldCls} resize-y`}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-[#e5ad46]/10 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-[#e5ad46]/15 px-4 py-2.5 text-xs text-[#eccc90]/60 transition-colors hover:border-[#e5ad46]/40 hover:text-[#eccc90]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#e5ad46] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1e2a38] transition-colors hover:bg-[#eccc90]"
                >
                  Enregistrer le brouillon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Supprimer ce brouillon ?"
        message="Ce brouillon sera supprimé définitivement de cet appareil."
        confirmLabel="Supprimer"
        tone="danger"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}