"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI } from "@/app/lib/api";
import { Receipt, Loader } from "lucide-react";

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">((searchParams.get("filter") as "all" | "paid" | "unpaid") || "all");

  useEffect(() => {
    authAPI.get<any[]>("/quotes").then((res) => {
      setInvoices((res.data || []).map((q: any) => ({
        ref: q.id?.toString().slice(0, 8) || "N/A",
        client: q.name || q.email || "Inconnu",
        amount: parseFloat(q.amount || "0"),
        status: q.balance_paid ? "paid" : q.deposit_paid ? "partial" : "unpaid",
      })));
    }).catch(() => setInvoices([])).finally(() => setLoading(false));
  }, []);

  const onFilterChange = useCallback((f: "all" | "paid" | "unpaid") => {
    setFilter(f);
    const params = new URLSearchParams(searchParams.toString());
    if (f !== "all") params.set("filter", f);
    else params.delete("filter");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const filtered = invoices.filter((inv) => {
    if (filter === "paid") return inv.status === "paid";
    if (filter === "unpaid") return inv.status === "unpaid" || inv.status === "partial";
    return true;
  });

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalUnpaid = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-[#e5ad46]" />
        <h1 className="font-headline text-2xl text-[#e5ad46]">Factures</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-[#25303a] p-4 border border-green-500/20">
          <p className="text-xs text-green-400 uppercase tracking-widest font-bold">Payées</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{totalPaid.toFixed(2)} €</p>
        </div>
        <div className="rounded-xl bg-[#25303a] p-4 border border-red-500/20">
          <p className="text-xs text-red-400 uppercase tracking-widest font-bold">Impayées</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{totalUnpaid.toFixed(2)} €</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "paid", "unpaid"] as const).map((f) => (
          <button key={f} onClick={() => onFilterChange(f)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${filter === f ? "bg-[#e5ad46] text-[#1e2a38]" : "bg-[#25303a] text-[#eccc90]/60 hover:bg-[#e5ad46]/10"}`}>
            {f === "all" ? "Toutes" : f === "paid" ? "Payées" : "Impayées"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader className="h-5 w-5 animate-spin text-[#e5ad46]" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#eccc90]/50">Aucune facture.</p>
      ) : (
        <div className="space-y-3">{filtered.map((inv, i) => (
          <div key={i} className="rounded-xl bg-[#25303a] p-4 border border-[#e5ad46]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#eccc90]">{inv.ref}</p>
                <p className="text-xs text-[#eccc90]/50">{inv.client}</p>
              </div>
              <p className={`font-bold ${inv.status === "paid" ? "text-green-400" : "text-yellow-400"}`}>{inv.amount.toFixed(2)} €</p>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
