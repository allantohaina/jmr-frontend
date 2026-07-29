"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Wrench, Plus, X } from "lucide-react";

type Ticket = { id: number; machine: string; reportedBy: string; date: string; status: "ouvert" | "en cours" | "résolu" };

export default function TicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ machine: "", reportedBy: "" });

  const filteredTickets = statusFilter ? tickets.filter((t) => t.status === statusFilter) : tickets;

  const setFilter = useCallback((status: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const addTicket = () => {
    if (!form.machine || !form.reportedBy) return;
    setTickets([...tickets, { id: Date.now(), machine: form.machine, reportedBy: form.reportedBy, date: new Date().toLocaleDateString("fr-FR"), status: "ouvert" }]);
    setForm({ machine: "", reportedBy: "" });
    setShowForm(false);
  };

  const toggleStatus = (id: number) => {
    setTickets(tickets.map((t) => t.id === id ? { ...t, status: t.status === "ouvert" ? "en cours" : t.status === "en cours" ? "résolu" : "ouvert" } : t));
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-[#e5ad46]" />
          <h1 className="font-headline text-2xl text-[#e5ad46]">Tickets Réparation Machine</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-xl bg-[#e5ad46] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#1e2a38] transition hover:bg-[#d49a2e]">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Annuler" : "Nouveau ticket"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-[#25303a] p-5 border border-[#e5ad46]/20 space-y-4">
          <input value={form.machine} onChange={(e) => setForm({ ...form, machine: e.target.value })} placeholder="Machine concernée" className="w-full rounded-lg bg-[#1e2a38] px-4 py-3 text-sm text-[#eccc90] placeholder:text-[#eccc90]/30 outline-none border border-[#e5ad46]/10 focus:border-[#e5ad46]/30" />
          <input value={form.reportedBy} onChange={(e) => setForm({ ...form, reportedBy: e.target.value })} placeholder="Signalé par" className="w-full rounded-lg bg-[#1e2a38] px-4 py-3 text-sm text-[#eccc90] placeholder:text-[#eccc90]/30 outline-none border border-[#e5ad46]/10 focus:border-[#e5ad46]/30" />
          <button onClick={addTicket} className="w-full rounded-lg bg-[#e5ad46] py-3 text-[10px] font-bold uppercase tracking-widest text-[#1e2a38] transition hover:bg-[#d49a2e]">Créer le ticket</button>
        </div>
      )}

      <div className="flex gap-2">
        {[null, "ouvert", "en cours", "résolu"].map((s) => (
          <button key={s || "all"} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${statusFilter === s || (!statusFilter && !s) ? "bg-[#e5ad46] text-[#1e2a38]" : "bg-[#25303a] text-[#eccc90]/60 hover:bg-[#e5ad46]/10"}`}>
            {s || "Tous"}
          </button>
        ))}
      </div>

      {filteredTickets.length === 0 ? (
        <p className="text-sm text-[#eccc90]/50">{statusFilter ? "Aucun ticket avec ce statut." : "Aucun ticket de réparation."}</p>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <div key={t.id} className="rounded-xl bg-[#25303a] p-4 border border-[#e5ad46]/10 flex items-center justify-between cursor-pointer hover:bg-[#2a3642] transition-colors" onClick={() => toggleStatus(t.id)}>
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${t.status === "ouvert" ? "bg-red-400" : t.status === "en cours" ? "bg-yellow-400" : "bg-green-400"}`} />
                <div>
                  <p className="font-semibold text-[#eccc90]">{t.machine}</p>
                  <p className="text-xs text-[#eccc90]/50">Signalé par {t.reportedBy} • {t.date}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${t.status === "ouvert" ? "text-red-400" : t.status === "en cours" ? "text-yellow-400" : "text-green-400"}`}>{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
