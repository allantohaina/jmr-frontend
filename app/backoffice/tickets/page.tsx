"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { workflowAPI, type ProductionTicket, type ProductionTask, type ProductionReview } from "@/app/lib/workflow-api";

export default function ProductionTicketsPage() {
  const [tickets, setTickets] = useState<ProductionTicket[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [reviews, setReviews] = useState<ProductionReview[]>([]);
  const [newTicket, setNewTicket] = useState({ commande_id: "", quote_id: "" });
  const [reviewForm, setReviewForm] = useState<Record<string, string | boolean>>({});
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    try {
      const res = await workflowAPI.tickets();
      const rows = res.data?.data ?? [];
      setTickets(rows);
      if (!selected && rows[0]) setSelected(rows[0].id);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [selected]);

  const loadTicketData = useCallback(async (ticketId: string) => {
    try {
      const [tRes, rRes] = await Promise.all([workflowAPI.tasks(ticketId), workflowAPI.reviews(ticketId)]);
      setTasks(tRes.data?.data ?? []);
      setReviews(rRes.data?.data ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Chargement du ticket impossible.");
    }
  }, []);

  useEffect(() => { void loadTickets(); }, [loadTickets]);
  useEffect(() => { if (selected) void loadTicketData(selected); }, [selected, loadTicketData]);

  const createTicket = async () => {
    if (!newTicket.commande_id) { setMessage("Renseignez l'identifiant de commande."); return; }
    try {
      await workflowAPI.createTicket(newTicket);
      setNewTicket({ commande_id: "", quote_id: "" });
      setSelected(null);
      await loadTickets();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Création impossible."); }
  };

  const submitReview = async (taskId: string) => {
    try {
      const f = reviewForm;
      await workflowAPI.review(taskId, {
        quality_score: f.quality_score ? Number(f.quality_score) : undefined,
        feedback: f.feedback || undefined,
        hours_estimated: f.hours_estimated ? Number(f.hours_estimated) : undefined,
        contretemps: !!f.contretemps,
        delay_reason: f.delay_reason || undefined,
      });
      setReviewTaskId(null);
      setReviewForm({});
      if (selected) await loadTicketData(selected);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Qualification impossible."); }
  };

  const closeTicket = async () => {
    if (!selected) return;
    try {
      await workflowAPI.closeTicket(selected);
      await loadTickets();
      await loadTicketData(selected);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Clôture impossible."); }
  };

  const inputClass = "w-full rounded-lg bg-[#1e2a38] px-3 py-2 text-sm text-[#EAA100] outline-none border border-[#EAA100]/20";

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-[#EAA100]" />
        <h1 className="font-headline text-2xl text-[#EAA100]">Tickets de production</h1>
      </div>

      {message && <p className="rounded-lg border border-[#E05252]/30 bg-[#E05252]/10 px-4 py-3 text-sm text-[#F3A3A6]">{message}</p>}

      <div className="rounded-xl border border-[#EAA100]/20 bg-[#161D30] p-5 space-y-3">
        <h2 className="text-caption font-bold uppercase tracking-widest text-[#EAA100]/70">Nouveau ticket</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input className={inputClass} placeholder="ID commande" value={newTicket.commande_id}
            onChange={(e) => setNewTicket({ ...newTicket, commande_id: e.target.value })} />
          <input className={inputClass} placeholder="ID devis (optionnel)" value={newTicket.quote_id}
            onChange={(e) => setNewTicket({ ...newTicket, quote_id: e.target.value })} />
          <button onClick={createTicket} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EAA100] px-4 py-2 text-caption font-bold uppercase tracking-widest text-[#1e2a38]">
            <Plus className="h-4 w-4" /> Créer
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-[#EAA100]/20 bg-[#161D30] p-4">
          <h2 className="mb-3 text-caption font-bold uppercase tracking-widest text-[#EAA100]/70">Tickets</h2>
          {loading ? <p className="text-sm text-[#EAA100]/50">Chargement…</p> : tickets.length === 0 ? (
            <p className="text-sm italic text-[#EAA100]/40">Aucun ticket.</p>
          ) : tickets.map((t) => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className={`mb-2 w-full rounded-lg border px-3 py-2 text-left text-xs transition ${selected === t.id ? "border-[#EAA100] bg-[#EAA100]/10" : "border-[#EAA100]/10 hover:border-[#EAA100]/40"}`}>
              <span className="font-bold text-[#EAA100]">{t.status}</span>
              <span className="block truncate text-[#EAA100]/50">{t.id}</span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-[#EAA100]/20 bg-[#161D30] p-5 space-y-5">
          {!selected ? <p className="text-sm italic text-[#EAA100]/40">Sélectionnez un ticket.</p> : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-lg text-[#EAA100]">Tâches du ticket</h2>
                <button onClick={closeTicket} className="inline-flex items-center gap-2 rounded-lg border border-[#5cb87d]/40 px-3 py-2 text-xs font-bold text-[#5cb87d]">
                  <CheckCircle2 className="h-4 w-4" /> Clôturer
                </button>
              </div>

              {tasks.length === 0 ? <p className="text-sm italic text-[#EAA100]/40">Aucune tâche.</p> : tasks.map((task) => {
                const review = reviews.find((r) => r.task_id === task.id);
                return (
                  <div key={task.id} className="rounded-lg border border-[#EAA100]/10 bg-[#1e2a38] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#EAA100]">{task.title}</p>
                        <p className="text-xs text-[#EAA100]/50">{task.description ?? "—"}</p>
                        <p className="mt-1 text-caption text-[#EAA100]/40">Statut : {task.status}</p>
                      </div>
                      <button onClick={() => { setReviewTaskId(task.id); setReviewForm({}); }}
                        className="rounded-lg border border-[#EAA100]/40 px-3 py-2 text-xs font-bold text-[#EAA100]">
                        Qualifier
                      </button>
                    </div>

                    {reviewTaskId === task.id && (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <input className={inputClass} type="number" min="0" max="20" placeholder="Note /20"
                          value={String(reviewForm.quality_score ?? "")}
                          onChange={(e) => setReviewForm({ ...reviewForm, quality_score: e.target.value })} />
                        <input className={inputClass} type="number" min="0" step="0.5" placeholder="Heures estimées"
                          value={String(reviewForm.hours_estimated ?? "")}
                          onChange={(e) => setReviewForm({ ...reviewForm, hours_estimated: e.target.value })} />
                        <input className={inputClass} placeholder="Feedback du chef"
                          value={String(reviewForm.feedback ?? "")}
                          onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })} />
                        <label className="flex items-center gap-2 text-xs text-[#EAA100]/70">
                          <input type="checkbox" checked={!!reviewForm.contretemps}
                            onChange={(e) => setReviewForm({ ...reviewForm, contretemps: e.target.checked })} />
                          Contretemps (+50 % heures)
                        </label>
                        {!!reviewForm.contretemps && (
                          <input className={inputClass} placeholder="Motif du contretemps"
                            value={String(reviewForm.delay_reason ?? "")}
                            onChange={(e) => setReviewForm({ ...reviewForm, delay_reason: e.target.value })} />
                        )}
                        <button onClick={() => submitReview(task.id)} className="rounded-lg bg-[#EAA100] px-4 py-2 text-xs font-bold text-[#1e2a38]">
                          Enregistrer
                        </button>
                      </div>
                    )}

                    {review && (
                      <div className="mt-3 flex items-center gap-3 border-t border-[#EAA100]/10 pt-3 text-xs text-[#EAA100]/70">
                        <span>Note : <b className="text-[#EAA100]">{review.quality_score ?? "—"}/20</b></span>
                        <span>Heures : <b className="text-[#EAA100]">{String(review.hours_estimated ?? "—")} → {String(review.hours_final ?? "—")}</b></span>
                        {!!review.contretemps && <span className="inline-flex items-center gap-1 text-[#e08b52]"><AlertTriangle className="h-3 w-3" /> contretemps</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
