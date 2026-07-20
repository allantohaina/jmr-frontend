"use client";

import { useState, useEffect } from "react";
import { authAPI } from "@/app/lib/api";
import { CreditCard, Loader } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      {loading ? (
        <div className="flex justify-center py-8"><Loader className="h-5 w-5 animate-spin text-[#e5ad46]" /></div>
      ) : payments.length === 0 ? (
        <p className="text-sm text-[#eccc90]/50">Aucun paiement enregistré.</p>
      ) : (
        <div className="space-y-3">{payments.map((p, i) => (
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
