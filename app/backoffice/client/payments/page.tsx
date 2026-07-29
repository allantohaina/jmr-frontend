"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI } from "@/app/lib/api";
import { CreditCard, Loader } from "lucide-react";

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredPayments = statusFilter ? payments.filter((p) => p.status === statusFilter) : payments;

  const setFilter = useCallback((status: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    Promise.all([
      authAPI.get<any[]>("/quotes").catch(() => ({ data: [] })),
    ]).then(([quotes]) => {
      setPayments((quotes.data || []).filter((q: any) => q.deposit_paid || q.balance_paid).map((q: any) => ({
        ref: q.id?.toString().slice(0, 8) || "N/A",
        client: q.name || q.email,
        amount: q.amount || "0",
        status: q.balance_paid ? "payé" : "acompte",
        date: q.updated_at || q.created_at,
      })));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-[#e5ad46]" />
        <h1 className="font-headline text-2xl text-[#e5ad46]">Paiements</h1>
      </div>
      <div className="flex gap-2">
        {[null, "payé", "acompte"].map((s) => (
          <button key={s || "all"} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${statusFilter === s || (!statusFilter && !s) ? "bg-[#e5ad46] text-[#1e2a38]" : "bg-[#25303a] text-[#eccc90]/60 hover:bg-[#e5ad46]/10"}`}>
            {s === "payé" ? "Payés" : s === "acompte" ? "Acomptes" : "Tous"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader className="h-5 w-5 animate-spin text-[#e5ad46]" /></div>
      ) : payments.length === 0 ? (
        <p className="text-sm text-[#eccc90]/50">Aucun paiement enregistré.</p>
      ) : filteredPayments.length === 0 ? (
        <p className="text-sm text-[#eccc90]/50">Aucun paiement avec ce statut.</p>
      ) : (
        <div className="space-y-3">{filteredPayments.map((p, i) => (
          <div key={i} className="rounded-xl bg-[#25303a] p-4 border border-[#e5ad46]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#eccc90]">{p.ref}</p>
                <p className="text-xs text-[#eccc90]/50">{p.client}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#e5ad46]">{p.amount} €</p>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${p.status === "payé" ? "text-green-400" : "text-yellow-400"}`}>{p.status}</span>
              </div>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
