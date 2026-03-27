"use client";

import React from "react";

export function AdminHeaderAlerts() {
  const handleSecurityClick = () => {
    alert("LOGS DE SÉCURITÉ :\n- Tentative d'accès /admin par IP inconnue\n- Tentative d'accès /admin par worker@test.com");
  };

  const handleProductionClick = () => {
    alert("ALERTES PRODUCTION :\n- Retard sur commande #CMD-104\n- Rupture stock filature noire\n- Maintenance machine #2");
  };

  return (
    <div className="flex items-center gap-4 md:gap-6">
      <div 
        onClick={handleSecurityClick}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/10 cursor-pointer hover:bg-red-500/20 transition-all group"
      >
        <span className="material-symbols-outlined text-red-500 text-sm animate-pulse">security</span>
        <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">2 Alertes Sécurité</span>
      </div>
      <div 
        onClick={handleProductionClick}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/10 cursor-pointer hover:bg-orange-500/20 transition-all group"
      >
        <span className="material-symbols-outlined text-orange-500 text-sm animate-pulse">notifications_active</span>
        <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest">3 Alertes Production</span>
      </div>
    </div>
  );
}
