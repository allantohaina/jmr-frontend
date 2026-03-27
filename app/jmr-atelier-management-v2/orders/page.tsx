"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { authAPI } from "../../lib/api";

export default function AdminOrdersPage() {
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<number | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await authAPI.get<any[]>("/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="px-6 md:px-12 py-10 space-y-10">
      {/* ... existing header ... */}
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="font-headline text-3xl text-[#163526]">Gestion des Commandes</h2>
          <p className="text-[#1b1c19]/40 text-xs font-bold uppercase tracking-widest mt-1">Historique et suivi des commandes clients</p>
        </div>
        <button 
          onClick={() => setShowNewOrder(true)}
          className="px-6 py-3 bg-[#163526] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg hover:bg-[#163526]/90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-sm text-orange-400">add_circle</span>
          Nouvelle Commande
        </button>
      </div>

      {showNewOrder && (
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl flex justify-between items-center animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-orange-500">info</span>
            <p className="text-xs font-bold text-orange-800 uppercase tracking-widest">Le module de création de commande est en cours de déploiement.</p>
          </div>
          <button onClick={() => setShowNewOrder(false)} className="text-orange-800 hover:rotate-90 transition-transform">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "En attente", count: orders.filter(o => o.status === 'En attente').length, color: "bg-orange-500" },
          { label: "En production", count: orders.filter(o => o.status === 'Production').length, color: "bg-[#163526]" },
          { label: "Terminées", count: orders.filter(o => o.status === 'Terminée').length, color: "bg-green-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#163526]/5 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">{stat.label}</p>
              <p className="text-3xl font-headline font-bold text-[#163526]">{isLoading ? "..." : stat.count}</p>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
              <span className="material-symbols-outlined">
                {stat.label === "En attente" ? "pending_actions" : stat.label === "En production" ? "precision_manufacturing" : "check_circle"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#163526]/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#163526]/5 border-b border-[#163526]/5">
              <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40">Commande ID</th>
              <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40">Client</th>
              <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40">Statut & Motif</th>
              <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#163526]/5 text-sm text-[#163526]">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-[#1b1c19]/40 italic">Chargement des commandes...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-[#1b1c19]/40 italic">Aucune commande enregistrée.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order.id}>
                <tr className={`hover:bg-[#163526]/[0.02] transition-colors group ${selectedOrderDetails === order.id ? 'bg-[#163526]/[0.03]' : ''}`}>
                  <td className="px-8 py-6 font-bold">#CMD-2024-00{order.id}</td>
                  <td className="px-8 py-6">
                    <p className="font-bold">{order.client}</p>
                    <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{order.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`w-fit px-3 py-1 text-[9px] font-bold uppercase rounded-full tracking-widest border ${
                        order.status === 'Retard' ? 'bg-red-50 text-red-600 border-red-100' :
                        order.status === 'En attente' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-[#163526]/10 text-[#163526] border-[#163526]/5'
                      }`}>
                        {order.status}
                      </span>
                      <p className="text-[11px] font-medium opacity-60 italic">{order.motive}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedOrderDetails(selectedOrderDetails === order.id ? null : order.id)}
                      className="text-orange-500 hover:text-orange-600 font-bold text-[10px] uppercase tracking-widest transition-all"
                    >
                      {selectedOrderDetails === order.id ? 'Fermer' : 'Détails Motif'}
                    </button>
                  </td>
                </tr>
                {selectedOrderDetails === order.id && (
                  <tr>
                    <td colSpan={4} className="px-12 py-8 bg-[#faf9f4]/50 border-y border-[#163526]/5">
                      <div className="flex gap-12 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="flex-1 space-y-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Historique des causes</h4>
                          <div className="space-y-3">
                            <div className="flex gap-4 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1"></div>
                              <div>
                                <p className="text-xs font-bold text-[#163526]">{order.motive}</p>
                                <p className="text-[9px] text-[#1b1c19]/40 uppercase font-bold mt-1">Mis à jour le {order.date} par Admin</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-64 space-y-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#163526]/40">Action requise</h4>
                          <button className="w-full py-3 bg-[#163526] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-md">
                            Résoudre l'incident
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
            )}</tbody>
        </table>
      </div>
    </div>
  );
}
