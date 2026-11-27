"use client";

import { useEffect, useState } from "react";
import { History, Users } from "lucide-react";
import { authAPI } from "@/app/lib/api";
import { workflowAPI, type ClientHistory } from "@/app/lib/workflow-api";

type Client = { id: string; first_name?: string; last_name?: string; email?: string; cumulative_revenue?: number | string };

export default function ClientHistoryPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState<ClientHistory | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.get<{ data: Client[] }>("/users/clients-revenue");
        setClients(res.data?.data ?? []);
      } catch (e) { setMessage(e instanceof Error ? e.message : "Chargement des clients impossible."); }
    })();
  }, []);

  useEffect(() => {
    if (!selected) { setHistory(null); return; }
    (async () => {
      try {
        const res = await workflowAPI.clientHistory(selected);
        setHistory(res.data ?? null);
      } catch (e) { setMessage(e instanceof Error ? e.message : "Historique indisponible."); }
    })();
  }, [selected]);

  const money = (v: number | string | undefined) => Number(v ?? 0).toLocaleString("fr-FR") + " Ar";

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-6 w-6 text-[#EAA100]" />
        <h1 className="font-headline text-2xl text-[#EAA100]">Historique &amp; chiffre d&apos;affaires client</h1>
      </div>

      {message && <p className="rounded-lg border border-[#E05252]/30 bg-[#E05252]/10 px-4 py-3 text-sm text-[#F3A3A6]">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-[#EAA100]/20 bg-[#161D30] p-4">
          <div className="mb-3 flex items-center gap-2 text-caption font-bold uppercase tracking-widest text-[#EAA100]/70">
            <Users className="h-4 w-4" /> Clients
          </div>
          {clients.length === 0 && <p className="text-sm italic text-[#EAA100]/40">Aucun client.</p>}
          {clients.map((c) => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`mb-2 w-full rounded-lg border px-3 py-2 text-left text-xs transition ${selected === c.id ? "border-[#EAA100] bg-[#EAA100]/10" : "border-[#EAA100]/10 hover:border-[#EAA100]/40"}`}>
              <span className="font-bold text-[#EAA100]">{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.email}</span>
              <span className="block truncate text-[#EAA100]/50">{c.email}</span>
              <span className="block text-[#EAA100]/40">CA livré : {money(c.cumulative_revenue)}</span>
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {history && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[#EAA100]/20 bg-[#161D30] p-5">
                  <p className="text-caption uppercase tracking-widest text-[#EAA100]/50">Total identifié</p>
                  <p className="mt-2 font-headline text-2xl text-[#EAA100]">{money(history.total)}</p>
                </div>
                <div className="rounded-xl border border-[#5cb87d]/30 bg-[#161D30] p-5">
                  <p className="text-caption uppercase tracking-widest text-[#EAA100]/50">Total payé</p>
                  <p className="mt-2 font-headline text-2xl text-[#5cb87d]">{money(history.paid_total)}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#EAA100]/20 bg-[#161D30]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1e2a38] text-caption uppercase tracking-widest text-[#EAA100]/40">
                    <tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Événement</th><th className="px-5 py-4">Détail</th><th className="px-5 py-4 text-right">Montant</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAA100]/10">
                    {(history.items ?? []).map((it) => (
                      <tr key={`${it.type}-${it.id}`}>
                        <td className="px-5 py-3 text-xs text-[#EAA100]/50">{it.date ? new Date(it.date).toLocaleDateString("fr-FR") : "—"}</td>
                        <td className="px-5 py-3 font-bold text-[#EAA100]">{it.label}</td>
                        <td className="px-5 py-3 text-xs text-[#EAA100]/60">{it.detail}</td>
                        <td className="px-5 py-3 text-right text-[#EAA100]">{money(it.amount)}</td>
                      </tr>
                    ))}
                    {(!history.items || history.items.length === 0) && (
                      <tr><td colSpan={4} className="px-5 py-8 text-center italic text-[#EAA100]/40">Aucun événement.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {!history && <p className="rounded-xl border border-[#EAA100]/20 bg-[#161D30] p-8 text-center text-sm italic text-[#EAA100]/40">Sélectionnez un client.</p>}
        </div>
      </div>
    </div>
  );
}
