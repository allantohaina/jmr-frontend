"use client";

import React from "react";
import { useExchangeRate } from "@/app/lib/use-exchange-rate";
import { RefreshCw, CircleDollarSign } from "lucide-react";

export default function ExchangeRateWidget() {
  const { rates, date, isLoading, error, refresh } = useExchangeRate();

  if (error) {
    return (
      <div className="rounded-xl border border-[#EAA100]/10 bg-[#161D30] p-6">
        <div className="mb-3 flex items-center gap-2">
          <CircleDollarSign className="text-[#EAA100]" />
          <h3 className="font-headline text-lg text-[#FFF8EC]">Taux de Change</h3>
        </div>
        <p className="text-xs text-[#b14255]">Erreur de chargement</p>
        <button
          onClick={refresh}
          className="mt-3 rounded-lg border border-[#EAA100]/15 px-4 py-2 text-caption font-bold uppercase tracking-widest text-[#EAA100] transition-colors hover:bg-[#EAA100]/10"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#EAA100]/10 bg-[#161D30] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleDollarSign className="text-[#EAA100]" />
          <h3 className="font-headline text-lg text-[#FFF8EC]">Taux de Change</h3>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg p-2 transition-colors hover:bg-[#EAA100]/10"
          title="Rafraîchir"
        >
          <RefreshCw className={`size-4 text-[#B9C3D0] ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && !rates ? (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-xl bg-[#161D30]" />
            <div className="h-12 animate-pulse rounded-xl bg-[#161D30]" />
          </div>
        ) : rates ? (
          <>
            <div className="rounded-xl border border-[#EAA100]/5 bg-[#161D30] p-4">
              <p className="mb-1 text-caption font-bold uppercase tracking-widest text-[#B9C3D0]">USD → MGA</p>
              <p className="font-headline text-2xl font-bold text-[#FFF8EC]">
                {rates.MGA?.toLocaleString("fr-MG", { maximumFractionDigits: 2 })}{" "}
                <span className="text-sm font-normal text-[#B9C3D0]">Ar</span>
              </p>
            </div>
            <div className="rounded-xl border border-[#EAA100]/5 bg-[#161D30] p-4">
              <p className="mb-1 text-caption font-bold uppercase tracking-widest text-[#B9C3D0]">EUR → MGA</p>
              <p className="font-headline text-2xl font-bold text-[#FFF8EC]">
                {rates.MGA && rates.EUR
                  ? (rates.MGA / rates.EUR).toLocaleString("fr-MG", { maximumFractionDigits: 2 })
                  : "—"}{" "}
                <span className="text-sm font-normal text-[#B9C3D0]">Ar</span>
              </p>
            </div>
          </>
        ) : null}
      </div>

      {date && (
        <p className="mt-4 text-center text-micro font-bold uppercase tracking-widest text-[#B9C3D0]/40">
          Dernière mise à jour : {date}
        </p>
      )}
    </div>
  );
}