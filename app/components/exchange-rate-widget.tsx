"use client";

import React from "react";
import { useExchangeRate } from "@/app/lib/use-exchange-rate";
import { RefreshCw, CircleDollarSign } from "lucide-react";

export default function ExchangeRateWidget() {
  const { rates, date, isLoading, error, refresh } = useExchangeRate();

  if (error) {
    return (
      <div className="rounded-xl border border-[#FFB42D]/10 bg-[#25303a] p-6">
        <div className="mb-3 flex items-center gap-2">
          <CircleDollarSign className="text-[#FFB42D]" />
          <h3 className="font-headline text-lg text-[#f3e9d6]">Taux de Change</h3>
        </div>
        <p className="text-xs text-[#b14255]">Erreur de chargement</p>
        <button
          onClick={refresh}
          className="mt-3 rounded-lg border border-[#FFB42D]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FFB42D] transition-colors hover:bg-[#FFB42D]/10"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#FFB42D]/10 bg-[#25303a] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleDollarSign className="text-[#FFB42D]" />
          <h3 className="font-headline text-lg text-[#f3e9d6]">Taux de Change</h3>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg p-2 transition-colors hover:bg-[#FFB42D]/10"
          title="Rafraîchir"
        >
          <RefreshCw className={`size-4 text-[#9aa7b4] ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && !rates ? (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-xl bg-[#26313d]" />
            <div className="h-12 animate-pulse rounded-xl bg-[#26313d]" />
          </div>
        ) : rates ? (
          <>
            <div className="rounded-xl border border-[#FFB42D]/5 bg-[#26313d] p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#9aa7b4]">USD → MGA</p>
              <p className="font-headline text-2xl font-bold text-[#f3e9d6]">
                {rates.MGA?.toLocaleString("fr-MG", { maximumFractionDigits: 2 })}{" "}
                <span className="text-sm font-normal text-[#9aa7b4]">Ar</span>
              </p>
            </div>
            <div className="rounded-xl border border-[#FFB42D]/5 bg-[#26313d] p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#9aa7b4]">EUR → MGA</p>
              <p className="font-headline text-2xl font-bold text-[#f3e9d6]">
                {rates.MGA && rates.EUR
                  ? (rates.MGA / rates.EUR).toLocaleString("fr-MG", { maximumFractionDigits: 2 })
                  : "—"}{" "}
                <span className="text-sm font-normal text-[#9aa7b4]">Ar</span>
              </p>
            </div>
          </>
        ) : null}
      </div>

      {date && (
        <p className="mt-4 text-center text-[9px] font-bold uppercase tracking-widest text-[#9aa7b4]/40">
          Dernière mise à jour : {date}
        </p>
      )}
    </div>
  );
}