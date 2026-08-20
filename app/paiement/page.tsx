"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { publicAPI, type LienPaiementRecord } from "@/app/lib/api";
import { Loader, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";

function PaymentView() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [lien, setLien] = useState<LienPaiementRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await publicAPI.lienInfo(token);
      setLien(res.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const pay = async () => {
    setPaying(true);
    setError(null);
    try {
      const res = await publicAPI.lienPayer(token);
      setLien(res.data.data);
      setPaid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setPaying(false);
    }
  };

  const fmt = (n: number | string | undefined) => Number(n ?? 0).toLocaleString("fr-FR") + " Ar";

  return (
    <div className="min-h-screen bg-[#1e2a38] text-[#eccc90]">
      <header className="border-b border-[#e5ad46]/10">
        <div className="mx-auto max-w-lg px-6 py-6 flex items-center justify-between">
          <Link href="/" className="font-headline text-2xl text-[#e5ad46]">JMR Atelier</Link>
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/60 hover:text-[#e5ad46]">← Accueil</Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-14">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader className="h-6 w-6 animate-spin text-[#e5ad46]" /></div>
        ) : error && !lien ? (
          <div className="rounded-2xl border border-[#e05252]/30 bg-[#e05252]/10 p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-[#e05252]" />
            <h1 className="font-headline text-xl text-[#e05252] mt-4">Lien invalide</h1>
            <p className="text-sm text-[#e05252]/80 mt-2">{error}</p>
          </div>
        ) : lien && lien.etat === "déjà payé" ? (
          <div className="rounded-2xl border border-green-700/30 bg-green-900/10 p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
            <h1 className="font-headline text-2xl text-green-300 mt-4">Déjà payé</h1>
            <p className="text-sm text-[#eccc90]/60 mt-2">Ce paiement a déjà été enregistré. Merci !</p>
            <p className="text-xs text-[#eccc90]/40 mt-4">Commande {lien.commande_numero} · {fmt(lien.montant)}</p>
          </div>
        ) : lien && lien.etat === "expiré" ? (
          <div className="rounded-2xl border border-[#e05252]/30 bg-[#e05252]/10 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-[#e05252]" />
            <h1 className="font-headline text-2xl text-[#e05252] mt-4">Lien expiré</h1>
            <p className="text-sm text-[#e05252]/80 mt-2">Ce lien de paiement est expiré. Contactez-nous à contact@jmrtextile.com pour recevoir un nouveau lien.</p>
          </div>
        ) : paid && lien ? (
          <div className="rounded-2xl border border-green-700/30 bg-green-900/10 p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
            <h1 className="font-headline text-2xl text-green-300 mt-4">Paiement enregistré</h1>
            <p className="text-sm text-[#eccc90]/60 mt-2">Merci pour votre confiance. Votre paiement a bien été pris en compte.</p>
            <p className="text-xs text-[#eccc90]/40 mt-4">Commande {lien.commande_numero} · {fmt(lien.montant)}</p>
          </div>
        ) : lien ? (
          <div className="rounded-2xl border border-[#e5ad46]/15 bg-[#25303a] p-8">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-[#e5ad46]" />
              <h1 className="font-headline text-2xl text-[#e5ad46]">Paiement en ligne</h1>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#eccc90]/50">Commande</span><span className="font-bold text-[#eccc90]">{lien.commande_numero || "—"}</span></div>
              <div className="flex justify-between"><span className="text-[#eccc90]/50">Désignation</span><span className="text-[#eccc90]">{lien.commande_designation || "—"}</span></div>
              {lien.client_nom && <div className="flex justify-between"><span className="text-[#eccc90]/50">Client</span><span className="text-[#eccc90]">{lien.client_nom}</span></div>}
              <div className="flex justify-between items-center border-t border-[#e5ad46]/10 pt-3 mt-3">
                <span className="text-[#eccc90]/50">Montant à régler</span>
                <span className="font-headline text-2xl text-[#e5ad46]">{fmt(lien.montant)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-6 flex items-center gap-2 rounded-lg bg-[#e05252]/10 border border-[#e05252]/30 px-4 py-3 text-xs text-[#e05252] font-bold">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            <button
              onClick={pay}
              disabled={paying}
              className="mt-8 w-full rounded-xl bg-[#e5ad46] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1204] hover:brightness-105 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {paying ? <Loader className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Confirmer le paiement de {fmt(lien.montant)}
            </button>
            <p className="text-center text-[10px] text-[#eccc90]/40 mt-4">
              Le règlement est enregistré dans votre dossier. Un reçu est disponible auprès de l&apos;atelier.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function PaiementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1e2a38] text-[#eccc90] flex items-center justify-center"><Loader className="h-6 w-6 animate-spin text-[#e5ad46]" /></div>}>
      <PaymentView />
    </Suspense>
  );
}