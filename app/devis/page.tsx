"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

type SharedQuote = {
  id: string;
  name: string;
  category: string;
  status: string;
  amount: string;
  deposit_paid: boolean;
  balance_paid: boolean;
  created_at: string;
};

export default function SharedDevisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1e2a38] flex items-center justify-center text-[#e5ad46] text-xs font-bold uppercase tracking-[0.3em]">Chargement...</div>
    }>
      <SharedDevisContent />
    </Suspense>
  );
}

function SharedDevisContent() {
  const searchParams = useSearchParams();
  const hash = searchParams.get("hash");
  const [quote, setQuote] = useState<SharedQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hash) {
      setError("Manquant");
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/quotes/share/${hash}`, { headers: { Accept: "application/json" } })
      .then((r) => { if (!r.ok) throw new Error("Introuvable"); return r.json(); })
      .then((d) => { if (d?.data) setQuote(d.data); else throw new Error("Introuvable"); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [hash]);

  if (loading) return <div className="min-h-screen bg-[#1e2a38] flex items-center justify-center text-[#e5ad46] text-xs font-bold uppercase tracking-[0.3em]">Chargement...</div>;

  if (error || !quote) return (
    <div className="min-h-screen bg-[#1e2a38] flex flex-col items-center justify-center gap-4 px-6">
      <AlertTriangle className="h-12 w-12 text-red-400" />
      <p className="text-red-400 font-bold text-sm">Devis introuvable ou lien invalide.</p>
    </div>
  );

  const StatusIcon = quote.balance_paid ? CheckCircle : quote.deposit_paid ? Clock : Clock;
  const statusColor = quote.balance_paid ? "text-green-400" : quote.deposit_paid ? "text-yellow-400" : "text-[#e5ad46]";
  const statusLabel = quote.balance_paid ? "Payé" : quote.deposit_paid ? "Acompte versé" : "En attente";

  return (
    <div className="min-h-screen bg-[#1e2a38] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[2rem] bg-[#25303a] border border-[#e5ad46]/10 p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-headline text-xl text-[#e5ad46]">Devis</span>
          <span className="text-[9px] text-[#eccc90]/40 font-bold uppercase tracking-widest">#{quote.id.slice(0, 8)}</span>
        </div>

        <div className="flex items-center gap-3">
          <StatusIcon className={`h-5 w-5 ${statusColor}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${statusColor}`}>{statusLabel}</span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-1">Client</p>
            <p className="text-sm font-semibold text-[#eccc90]">{quote.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-1">Catégorie</p>
            <p className="text-sm font-semibold text-[#eccc90] capitalize">{quote.category}</p>
          </div>
          {quote.amount && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-1">Montant</p>
              <p className="text-2xl font-bold text-[#e5ad46]">{parseFloat(quote.amount).toFixed(2)} €</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-1">Date</p>
            <p className="text-sm text-[#eccc90]/70">{new Date(quote.created_at).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>

        <div className="h-px bg-[#e5ad46]/10" />

        <div className="flex gap-2">
          {quote.deposit_paid && <span className="flex-1 text-center py-2 rounded-lg bg-green-500/10 text-green-400 text-[9px] font-bold uppercase tracking-widest">Acompte reçu</span>}
          {quote.balance_paid && <span className="flex-1 text-center py-2 rounded-lg bg-green-500/10 text-green-400 text-[9px] font-bold uppercase tracking-widest">Solde payé</span>}
        </div>
      </div>
    </div>
  );
}