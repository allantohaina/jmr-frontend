"use client";

import React, { useState } from "react";

export default function AdminSettingsPage() {
  const [tfaEnabled, setTfaEnabled] = useState(true);

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
    </div>
  );
}
