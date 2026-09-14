"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI, paymentsAPI, type QuoteRecord, type PaymentRecord, isPaidFlag, isQuoteSentForPayment } from "@/app/lib/api";
import { safeUrl } from "@/app/lib/utils";
import { CreditCard, Loader, CheckCircle, XCircle } from "lucide-react";

interface PaymentRow {
  ref: string;
  client: string;
  amount: string;
  status: string;
  date: string | undefined;
}

type PendingRow = PaymentRecord & {
  client_name?: string | null;
  client_email?: string | null;
  quote_amount?: string | number | null;
  quote_status?: string | null;
};

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const filteredPayments = statusFilter && statusFilter !== "attente"
    ? payments.filter((p) => p.status === statusFilter)
    : payments;

  const setFilter = useCallback((status: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const loadPending = useCallback(async () => {
    try {
      const res = await paymentsAPI.pending();
      const rows = Array.isArray(res.data) ? res.data : [];
      setPending(rows as PendingRow[]);
    } catch {
      setPending([]);
    }
  }, []);

  useEffect(() => {
    authAPI.get<{ data: QuoteRecord[] }>("/quotes")
      .then((res) => {
        const quotes: QuoteRecord[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setPayments(
          quotes
            .filter((q) => isQuoteSentForPayment(q.status) && (isPaidFlag(q.deposit_paid) || isPaidFlag(q.balance_paid)))
            .map((q): PaymentRow => ({
              ref: q.id?.toString().slice(0, 8) || "N/A",
              client: q.name || q.email || "Inconnu",
              amount: q.amount?.toString() || "0",
              status: isPaidFlag(q.balance_paid) ? "payé" : "acompte",
              date: q.updated_at || q.created_at,
            }))
        );
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
    loadPending();
  }, [loadPending]);

  const review = async (id: string, status: "verified" | "rejected") => {
    setReviewingId(id);
    try {
      await paymentsAPI.updateStatus(id, status, status === "rejected" ? reviewNote : undefined);
      await loadPending();
      // Rafraîchir aussi les totaux vérifiés
      const res = await authAPI.get<{ data: QuoteRecord[] }>("/quotes").catch(() => null);
      if (res) {
        const quotes: QuoteRecord[] = Array.isArray(res.data) ? res.data : ((res.data as unknown as { data?: QuoteRecord[] })?.data ?? []);
        setPayments(
          quotes
            .filter((q) => isQuoteSentForPayment(q.status) && (isPaidFlag(q.deposit_paid) || isPaidFlag(q.balance_paid)))
            .map((q): PaymentRow => ({
              ref: q.id?.toString().slice(0, 8) || "N/A",
              client: q.name || q.email || "Inconnu",
              amount: q.amount?.toString() || "0",
              status: isPaidFlag(q.balance_paid) ? "payé" : "acompte",
              date: q.updated_at || q.created_at,
            }))
        );
      }
      setReviewNote("");
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-[#FFB42D]" />
        <h1 className="font-headline text-2xl text-[#FFB42D]">Paiements</h1>
      </div>

      {/* Preuves en attente — l'admin doit vérifier l'image avant que la tranche passe à Payé */}
      <section className="rounded-xl bg-[#25303a] p-4 border border-[#FFB42D]/20">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFB42D]/60 mb-1">
          Preuves à vérifier ({pending.length})
        </p>
        <p className="text-xs text-[#FFB42D]/50 mb-3">
          Une tranche ne passe à « Payé » qu&apos;après vérification de la preuve image/PDF. La tranche 1 vérifiée démarre la production.
        </p>
        {pending.length === 0 ? (
          <p className="text-sm text-[#FFB42D]/50">Aucune preuve en attente.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="rounded-lg bg-[#1e2a38] p-3 border border-[#FFB42D]/10">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-[#FFB42D] text-sm">
                      {p.phase === "deposit" ? "Tranche 1 · Acompte" : "Tranche 2 · Solde"} — {Number(p.amount ?? 0).toLocaleString("fr-FR")} Ar
                    </p>
                    <p className="text-xs text-[#FFB42D]/50">
                      {(p.client_name as string) || (p.client_email as string) || p.quote_id} · Réf {p.transaction_ref || "—"} · {p.payment_type || "—"}
                    </p>
                    {p.proof_path && (
                      <a href={safeUrl(p.proof_path)} target="_blank" rel="noopener noreferrer" className="text-xs text-[#FFB42D] underline">
                        Voir la preuve image/PDF
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => review(p.id, "verified")}
                      disabled={reviewingId === p.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 text-[10px] font-bold uppercase tracking-widest hover:bg-green-500/25 disabled:opacity-50"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Valider
                    </button>
                    <button
                      onClick={() => review(p.id, "rejected")}
                      disabled={reviewingId === p.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/25 disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Rejeter
                    </button>
                  </div>
                </div>
                <input
                  value={reviewingId === p.id ? reviewNote : reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Motif du rejet (obligatoire si rejet)"
                  className="mt-2 w-full rounded-lg border border-[#FFB42D]/10 bg-[#25303a] px-3 py-2 text-xs text-[#FFB42D] placeholder:text-[#FFB42D]/30"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex gap-2">
        {[null, "payé", "acompte"].map((s) => (
          <button key={s || "all"} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${statusFilter === s || (!statusFilter && !s) ? "bg-[#FFB42D] text-[#1e2a38]" : "bg-[#25303a] text-[#FFB42D]/60 hover:bg-[#FFB42D]/10"}`}>
            {s === "payé" ? "Payés" : s === "acompte" ? "Acomptes" : "Tous"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader className="h-5 w-5 animate-spin text-[#FFB42D]" /></div>
      ) : payments.length === 0 ? (
        <p className="text-sm text-[#FFB42D]/50">Aucun paiement vérifié. Les tranches n&apos;apparaissent ici qu&apos;après validation admin.</p>
      ) : filteredPayments.length === 0 ? (
        <p className="text-sm text-[#FFB42D]/50">Aucun paiement avec ce statut.</p>
      ) : (
        <div className="space-y-3">{filteredPayments.map((p, i) => (
          <div key={i} className="rounded-xl bg-[#25303a] p-4 border border-[#FFB42D]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#FFB42D]">{p.ref}</p>
                <p className="text-xs text-[#FFB42D]/50">{p.client}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#FFB42D]">{p.amount} €</p>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${p.status === "payé" ? "text-green-400" : "text-yellow-400"}`}>{p.status}</span>
              </div>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
