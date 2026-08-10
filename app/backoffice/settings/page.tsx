"use client";

import React, { useState } from "react";
import { authAPI } from "@/app/lib";
import { Trash2, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [tfaEnabled, setTfaEnabled] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [truncating, setTruncating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTruncate = async () => {
    setTruncating(true);
    setResult(null);
    try {
      const res = await authAPI.post<{ message: string; truncated: string[] }>("/admin/truncate", {});
      setResult({ ok: true, message: res.data?.message || "Données supprimées." });
      setShowConfirm(false);
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Erreur lors de la suppression." });
    } finally {
      setTruncating(false);
    }
  };

  return (
    <div className="px-6 md:px-12 py-10 space-y-10">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="font-headline text-3xl text-[#163526]">Paramètres Système</h2>
          <p className="text-[#1b1c19]/40 text-xs font-bold uppercase tracking-widest mt-1">Configuration de l&apos;atelier et des accès administrateur</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-[#163526]/5 shadow-sm space-y-6">
          <h3 className="font-headline text-xl text-[#163526]">Profil de l&apos;Atelier</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">Nom de l&apos;établissement</p>
              <p className="text-[#163526] font-bold">JMR Textile - Atelier de Production</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">Localisation</p>
              <p className="text-[#163526]">Antananarivo, Madagascar</p>
            </div>
            <button
              onClick={() => alert("Interface d'édition du profil en cours de chargement...")}
              className="text-orange-500 font-bold text-[10px] uppercase tracking-widest hover:underline transition-all"
            >
              Modifier les informations
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-[#163526]/5 shadow-sm space-y-6">
          <h3 className="font-headline text-xl text-[#163526]">Sécurité & Accès</h3>
          <div className="space-y-4">
            <div
              onClick={() => setTfaEnabled(!tfaEnabled)}
              className="flex justify-between items-center p-4 bg-[#163526]/5 rounded-xl cursor-pointer hover:bg-[#163526]/10 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-[#163526]">Double Authentification</p>
                <p className="text-[10px] text-[#1b1c19]/40 uppercase font-bold tracking-widest">Recommandé pour la sécurité</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${tfaEnabled ? 'bg-orange-500/20' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${tfaEnabled ? 'right-1 bg-orange-500' : 'left-1 bg-gray-400'}`}></div>
              </div>
            </div>
            <button
              onClick={() => alert("Gestion des administrateurs réservée au super-admin.")}
              className="w-full py-4 border border-[#163526]/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#163526]/5 transition-all active:scale-95"
            >
              Gérer les administrateurs
            </button>
          </div>
        </div>
      </div>

      {/* Zone danger */}
      <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="font-headline text-xl text-red-600">Zone Danger</h3>
        </div>
        <p className="text-sm text-[#1b1c19]/60">
          Supprime toutes les données de test (commandes, devis, demandes, produits, achats, livraisons, notifications, etc.).
          Les comptes administrateurs et travailleurs sont conservés.
        </p>

        {result && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border text-xs font-bold uppercase tracking-widest ${
            result.ok ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
          }`}>
            {result.ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            {result.message}
          </div>
        )}

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer les données de test
          </button>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">Êtes-vous sûr ?</p>
              <p className="text-xs text-red-600 mt-1">Cette action est irréversible. Toutes les données de test seront supprimées.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleTruncate}
                disabled={truncating}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {truncating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                {truncating ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
