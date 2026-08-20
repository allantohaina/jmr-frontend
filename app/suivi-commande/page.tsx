"use client";

import React, { useState } from "react";
import Link from "next/link";
import { publicAPI, STATUTS_PRODUCTION, type SuiviCommandeRecord } from "@/app/lib/api";
import { Loader, Search, Package, CheckCircle2, AlertCircle } from "lucide-react";

const STATUT_INDEX: Record<string, number> = Object.fromEntries(STATUTS_PRODUCTION.map((s, i) => [s, i]));

export default function SuiviCommandePage() {
  const [numero, setNumero] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<SuiviCommandeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setChecked(false);
    try {
      const res = await publicAPI.suiviCommande(numero, email);
      setResult(res.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
      setChecked(true);
    }
  };

  const statutIndex = result ? (STATUT_INDEX[result.statut_production] ?? 0) : 0;

  return (
    <div className="min-h-screen bg-[#1e2a38] text-[#eccc90]">
      <header className="border-b border-[#e5ad46]/10">
        <div className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between">
          <Link href="/" className="font-headline text-2xl text-[#e5ad46]">JMR Atelier</Link>
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/60 hover:text-[#e5ad46]">← Retour au site</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-headline text-4xl text-[#e5ad46] text-center">Suivi de commande</h1>
        <p className="text-center text-sm text-[#eccc90]/60 mt-3">
          Retrouvez l&apos;état d&apos;avancement de votre commande en indiquant son numéro et votre email.
        </p>

        <form onSubmit={lookup} className="mt-10 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/50">Numéro de commande</label>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="ex : CMD-AB12CD34"
              required
              className="mt-2 w-full rounded-xl border border-[#e5ad46]/20 bg-[#25303a] px-4 py-3 text-sm text-[#eccc90] placeholder:text-[#eccc90]/30 focus:border-[#e5ad46] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/50">Email utilisé lors de la commande</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              className="mt-2 w-full rounded-xl border border-[#e5ad46]/20 bg-[#25303a] px-4 py-3 text-sm text-[#eccc90] placeholder:text-[#eccc90]/30 focus:border-[#e5ad46] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e5ad46] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1204] hover:brightness-105 disabled:opacity-50"
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Suivre ma commande
          </button>
        </form>

        {error && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#e05252]/30 bg-[#e05252]/10 p-4 text-sm text-[#e05252]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Commande introuvable</p>
              <p className="text-[#e05252]/80 text-xs mt-1">
                Vérifiez le numéro et l&apos;email saisis. Pour toute question, contactez-nous à contact@jmrtextile.com.
              </p>
            </div>
          </div>
        )}

        {checked && !error && !isLoading && !result && (
          <div className="mt-8 text-center text-sm text-[#eccc90]/50">
            Aucune commande ne correspond à ces informations.
          </div>
        )}

        {result && (
          <div className="mt-10 rounded-2xl border border-[#e5ad46]/15 bg-[#25303a] p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/50">Numéro de commande</p>
                <p className="font-headline text-2xl text-[#e5ad46] mt-1">{result.numero}</p>
              </div>
              <Package className="h-10 w-10 text-[#e5ad46]/60" />
            </div>
            <p className="mt-2 text-sm text-[#eccc90]/80">{result.designation || "Confection textile"}</p>
            <p className="text-xs text-[#eccc90]/50 mt-1">Quantité : {result.quantite} pièce(s)</p>

            <div className="mt-8">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/50 mb-3">
                <span>Statut actuel</span>
                <span className="text-[#e5ad46]">{result.statut_production}</span>
              </div>
              <div className="flex items-center gap-1">
                {STATUTS_PRODUCTION.map((s, i) => (
                  <div key={s} className="flex-1">
                    <div className={`h-1.5 rounded-full ${i <= statutIndex ? "bg-[#e5ad46]" : "bg-[#eccc90]/15"}`} />
                    <p className={`mt-1.5 text-center text-[8px] font-bold uppercase tracking-widest ${i === statutIndex ? "text-[#e5ad46]" : "text-[#eccc90]/30"}`}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
              {result.pieces_produites > 0 && (
                <p className="mt-4 text-xs text-[#eccc90]/60">Pièces produites : {result.pieces_produites} / {result.quantite}</p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/50">Date commande</p>
                <p className="text-[#eccc90]/80 mt-1">{result.date_commande || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/50">Livraison prévue</p>
                <p className="text-[#eccc90]/80 mt-1">{result.date_livraison_prevue || "—"}</p>
              </div>
            </div>

            {result.en_retard && (
              <div className="mt-6 flex items-center gap-2 rounded-lg bg-[#e05252]/10 border border-[#e05252]/30 px-4 py-3 text-xs text-[#e05252] font-bold">
                <AlertCircle className="h-4 w-4" /> Cette commande accuse un léger retard. Notre équipe vous contacte.
              </div>
            )}

            {result.statut_production === "Livrée" && (
              <div className="mt-6 flex items-center gap-2 rounded-lg bg-green-900/20 border border-green-700/30 px-4 py-3 text-xs text-green-300 font-bold">
                <CheckCircle2 className="h-4 w-4" /> Commande livrée le {result.date_livraison_reelle || result.date_livraison_prevue || "—"}.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}