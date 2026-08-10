"use client";

import React from "react";
import { useExchangeRate } from "@/app/lib/use-exchange-rate";

export default function ExchangeRateWidget() {
  const { rates, date, isLoading, error, refresh } = useExchangeRate();

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#163526]/5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#163526]">currency_exchange</span>
          <h3 className="font-headline text-lg text-[#163526]">Taux de Change</h3>
        </div>
        <p className="text-xs text-red-500">Erreur de chargement</p>
        <button
          onClick={refresh}
          className="mt-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-[#163526]/10 rounded-xl hover:bg-[#163526]/5 transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#163526]/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#163526]">currency_exchange</span>
          <h3 className="font-headline text-lg text-[#163526]">Taux de Change</h3>
        </div>
        <button onClick={refresh} className="p-2 rounded-lg hover:bg-[#163526]/5 transition-all" title="Rafraîchir">
          <span className={`material-symbols-outlined text-sm text-[#163526]/40 ${isLoading ? "animate-spin" : ""}`}>
            refresh
          </span>
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && !rates ? (
          <div className="space-y-3">
            <div className="h-10 bg-[#163526]/5 rounded-xl animate-pulse" />
            <div className="h-10 bg-[#163526]/5 rounded-xl animate-pulse" />
          </div>
        ) : rates ? (
          <>
            <div className="p-4 bg-[#faf9f4] rounded-xl border border-[#163526]/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">USD → MGA</p>
              <p className="font-headline text-2xl font-bold text-[#163526]">
                {rates.MGA?.toLocaleString("fr-MG", { maximumFractionDigits: 2 })} <span className="text-sm font-normal text-[#163526]/40">Ar</span>
              </p>
            </div>
            <div className="p-4 bg-[#faf9f4] rounded-xl border border-[#163526]/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">EUR → MGA</p>
              <p className="font-headline text-2xl font-bold text-[#163526]">
                {rates.MGA && rates.EUR
                  ? (rates.MGA / rates.EUR).toLocaleString("fr-MG", { maximumFractionDigits: 2 })
                  : "—"}{" "}
                <span className="text-sm font-normal text-[#163526]/40">Ar</span>
              </p>
            </div>
          </>
        ) : null}
      </div>

      {date && (
        <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-[#163526]/30 text-center">
          Dernière mise à jour : {date}
        </p>
      )}
    </div>
  );
}
