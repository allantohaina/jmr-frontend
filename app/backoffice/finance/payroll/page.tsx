"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DollarSign, Plus, X, Search as SearchIcon } from "lucide-react";
import { debounce } from "@/app/lib/utils";

export default function PayrollPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<{ employee: string; amount: string; date: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: "", amount: "" });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const onSearchChange = useMemo(() => debounce((val: string) => {
    setDebouncedSearch(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("search", val);
    else params.delete("search");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, 300), [router, searchParams]);
  const filteredPayments = payments.filter((p) => !debouncedSearch || p.employee.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const addPayment = () => {
    if (!form.employee || !form.amount) return;
    setPayments([...payments, { employee: form.employee, amount: form.amount, date: new Date().toLocaleDateString("fr-FR") }]);
    setForm({ employee: "", amount: "" });
    setShowForm(false);
  };

  const total = payments.reduce((s, p) => s + parseFloat(p.amount || "0"), 0);

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-[#FFB42D]" />
          <h1 className="font-headline text-2xl text-[#FFB42D]">Paie</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-xl bg-[#FFB42D] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#1e2a38] transition hover:bg-[#FFB42D]">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Annuler" : "Nouveau paiement"}
        </button>
      </div>

      {payments.length > 0 && (
        <div className="rounded-xl bg-[#25303a] p-4 border border-[#FFB42D]/20">
          <p className="text-xs text-[#FFB42D] uppercase tracking-widest font-bold">Total</p>
          <p className="text-3xl font-bold text-[#FFB42D] mt-1">{total.toFixed(2)} €</p>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl bg-[#25303a] p-5 border border-[#FFB42D]/20 space-y-4">
          <input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} placeholder="Nom de l'employé" className="w-full rounded-lg bg-[#1e2a38] px-4 py-3 text-sm text-[#FFB42D] placeholder:text-[#FFB42D]/30 outline-none border border-[#FFB42D]/10 focus:border-[#FFB42D]/30" />
          <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Montant (€)" type="number" step="0.01" className="w-full rounded-lg bg-[#1e2a38] px-4 py-3 text-sm text-[#FFB42D] placeholder:text-[#FFB42D]/30 outline-none border border-[#FFB42D]/10 focus:border-[#FFB42D]/30" />
          <button onClick={addPayment} className="w-full rounded-lg bg-[#FFB42D] py-3 text-[10px] font-bold uppercase tracking-widest text-[#1e2a38] transition hover:bg-[#FFB42D]">Ajouter</button>
        </div>
      )}

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FFB42D]/30" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); onSearchChange(e.target.value); }} placeholder="Rechercher un employé..." className="w-full rounded-xl bg-[#25303a] pl-11 pr-4 py-3 text-sm text-[#FFB42D] placeholder:text-[#FFB42D]/30 outline-none border border-[#FFB42D]/10 focus:border-[#FFB42D]/30" />
      </div>

      {filteredPayments.length === 0 ? (
        <p className="text-sm text-[#FFB42D]/50">{search ? "Aucun paiement trouvé." : "Aucun paiement enregistré."}</p>
      ) : (
        <div className="space-y-3">{filteredPayments.map((p, i) => (
          <div key={i} className="rounded-xl bg-[#25303a] p-4 border border-[#FFB42D]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#FFB42D]">{p.employee}</p>
                <p className="text-xs text-[#FFB42D]/50">{p.date}</p>
              </div>
              <p className="font-bold text-[#FFB42D]">{p.amount} €</p>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
