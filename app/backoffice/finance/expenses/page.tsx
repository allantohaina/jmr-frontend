"use client";

import { useState } from "react";
import { TrendingDown, Plus, X } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<{ label: string; amount: string; date: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", amount: "" });

  const addExpense = () => {
    if (!form.label || !form.amount) return;
    setExpenses([...expenses, { label: form.label, amount: form.amount, date: new Date().toLocaleDateString("fr-FR") }]);
    setForm({ label: "", amount: "" });
    setShowForm(false);
  };

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount || "0"), 0);

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingDown className="h-6 w-6 text-[#e5ad46]" />
          <h1 className="font-headline text-2xl text-[#e5ad46]">Dépenses</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-xl bg-[#e5ad46] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#1e2a38] transition hover:bg-[#d49a2e]">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Annuler" : "Ajouter"}
        </button>
      </div>

      {expenses.length > 0 && (
        <div className="rounded-xl bg-[#25303a] p-4 border border-red-500/20">
          <p className="text-xs text-red-400 uppercase tracking-widest font-bold">Total</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{total.toFixed(2)} €</p>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl bg-[#25303a] p-5 border border-[#e5ad46]/20 space-y-4">
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Libellé" className="w-full rounded-lg bg-[#1e2a38] px-4 py-3 text-sm text-[#eccc90] placeholder:text-[#eccc90]/30 outline-none border border-[#e5ad46]/10 focus:border-[#e5ad46]/30" />
          <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Montant (€)" type="number" step="0.01" className="w-full rounded-lg bg-[#1e2a38] px-4 py-3 text-sm text-[#eccc90] placeholder:text-[#eccc90]/30 outline-none border border-[#e5ad46]/10 focus:border-[#e5ad46]/30" />
          <button onClick={addExpense} className="w-full rounded-lg bg-[#e5ad46] py-3 text-[10px] font-bold uppercase tracking-widest text-[#1e2a38] transition hover:bg-[#d49a2e]">Ajouter</button>
        </div>
      )}

      {expenses.length === 0 ? (
        <p className="text-sm text-[#eccc90]/50">Aucune dépense enregistrée.</p>
      ) : (
        <div className="space-y-3">{expenses.map((e, i) => (
          <div key={i} className="rounded-xl bg-[#25303a] p-4 border border-[#e5ad46]/10">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold text-[#eccc90]">{e.label}</p>
                <p className="text-xs text-[#eccc90]/50">{e.date}</p>
              </div>
              <p className="font-bold text-red-400">{e.amount} €</p>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
