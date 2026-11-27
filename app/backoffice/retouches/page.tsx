"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCcw, Plus } from "lucide-react";
import { workflowAPI, type Retouche } from "@/app/lib/workflow-api";

export default function RetouchesPage() {
  const [quoteId, setQuoteId] = useState("");
  const [rows, setRows] = useState<Retouche[]>([]);
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const [message, setMessage] = useState("");
  const inputClass = "w-full rounded-lg bg-[#1e2a38] px-3 py-2 text-sm text-[#EAA100] outline-none border border-[#EAA100]/20";

  const load = useCallback(async () => {
    if (!quoteId) { setRows([]); return; }
    try {
      const res = await workflowAPI.retouches(quoteId);
      setRows(res.data?.data ?? []);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Chargement impossible."); }
  }, [quoteId]);

  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    if (!quoteId || !form.title) { setMessage("Renseignez l'ID du devis et un titre."); return; }
    try {
      await workflowAPI.createRetouche({
        quote_id: quoteId,
        title: form.title,
        description: form.description || undefined,
        price: form.price ? Number(form.price) : undefined,
      });
      setForm({ title: "", description: "", price: "" });
      await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Création impossible."); }
  };

  const decide = async (id: string, include: boolean, price?: string) => {
    try {
      if (include) await workflowAPI.includeRetouche(id, price ? Number(price) : undefined);
      else await workflowAPI.rejectRetouche(id);
      await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Mise à jour impossible."); }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <RefreshCcw className="h-6 w-6 text-[#EAA100]" />
        <h1 className="font-headline text-2xl text-[#EAA100]">Retouches &amp; corrections</h1>
      </div>

      {message && <p className="rounded-lg border border-[#E05252]/30 bg-[#E05252]/10 px-4 py-3 text-sm text-[#F3A3A6]">{message}</p>}

      <div className="rounded-xl border border-[#EAA100]/20 bg-[#161D30] p-5 space-y-4">
        <label className="block text-caption font-bold uppercase tracking-widest text-[#EAA100]/70">Devis concerné</label>
        <input className={inputClass} placeholder="ID du devis" value={quoteId} onChange={(e) => setQuoteId(e.target.value)} />
        <div className="grid gap-3 md:grid-cols-4">
          <input className={inputClass} placeholder="Titre de la retouche" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={inputClass} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className={inputClass} type="number" placeholder="Prix (Ar)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <button onClick={create} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EAA100] px-4 py-2 text-caption font-bold uppercase tracking-widest text-[#1e2a38]">
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#EAA100]/20 bg-[#161D30]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1e2a38] text-caption uppercase tracking-widest text-[#EAA100]/40">
            <tr><th className="px-5 py-4">Retouche</th><th className="px-5 py-4">Prix</th><th className="px-5 py-4">Statut</th><th className="px-5 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-[#EAA100]/10">
            {rows.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center italic text-[#EAA100]/40">Aucune retouche.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-4">
                  <p className="font-bold text-[#EAA100]">{r.title}</p>
                  <p className="text-xs text-[#EAA100]/50">{r.description ?? "—"}</p>
                </td>
                <td className="px-5 py-4 text-[#EAA100]/70">{Number(r.price ?? 0).toLocaleString("fr-FR")} Ar</td>
                <td className="px-5 py-4 text-xs uppercase text-[#EAA100]/60">{r.status}</td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex gap-2">
                    <input className="w-24 rounded-lg bg-[#1e2a38] px-2 py-1 text-xs text-[#EAA100] outline-none border border-[#EAA100]/20" placeholder="Prix" defaultValue={r.price ?? ""} id={`price-${r.id}`} />
                    <button onClick={() => decide(r.id, true, (document.getElementById(`price-${r.id}`) as HTMLInputElement)?.value)}
                      className="rounded-lg border border-[#5cb87d]/40 px-3 py-1 text-xs font-bold text-[#5cb87d]">Inclure</button>
                    <button onClick={() => decide(r.id, false)}
                      className="rounded-lg border border-[#E05252]/40 px-3 py-1 text-xs font-bold text-[#F3A3A6]">Refuser</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
