"use client";

import React, { useState } from "react";
import { Package, Search, Plus, Minus, AlertTriangle } from "lucide-react";
import { useToast } from "@/app/components/toast-provider";

interface StockItem {
  id: number;
  name: string;
  category: "tissu" | "fil" | "accessoire";
  quantity: number;
  unit: string;
  minThreshold: number;
}

export function AtelierStock() {
  const { showToast } = useToast();
  const [searchTerm, setSearchType] = useState("");
  const [items, setItems] = useState<StockItem[]>([
    { id: 1, name: "Coton Bio Bleu Marine", category: "tissu", quantity: 150, unit: "mètres", minThreshold: 50 },
    { id: 2, name: "Fil Polyester Noir #40", category: "fil", quantity: 12, unit: "bobines", minThreshold: 5 },
    { id: 3, name: "Boutons Nacre 12mm", category: "accessoire", quantity: 1200, unit: "unités", minThreshold: 200 },
    { id: 4, name: "Lin Naturel", category: "tissu", quantity: 30, unit: "mètres", minThreshold: 40 },
    { id: 5, name: "Fermeture Éclair 20cm", category: "accessoire", quantity: 15, unit: "unités", minThreshold: 50 },
  ]);

  const updateQuantity = (id: number, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty < item.minThreshold && item.quantity >= item.minThreshold) {
          showToast(`Alerte stock bas : ${item.name}`, "warning");
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline text-3xl text-[#163526]">Gestion des Stocks</h2>
          <p className="text-xs uppercase tracking-widest text-[#163526]/40 font-bold mt-1">Inventaire des matières premières</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#163526]/40" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#163526]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-[#163526]/5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${
                item.category === "tissu" ? "bg-blue-50 text-blue-600" :
                item.category === "fil" ? "bg-purple-50 text-purple-600" :
                "bg-orange-50 text-orange-600"
              }`}>
                <Package className="w-5 h-5" />
              </div>
              {item.quantity < item.minThreshold && (
                <div className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-bold uppercase animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Stock Bas
                </div>
              )}
            </div>

            <h3 className="font-headline text-xl text-[#163526] mb-1">{item.name}</h3>
            <p className="text-[10px] uppercase tracking-widest text-[#163526]/40 font-bold mb-6">{item.category}</p>

            <div className="flex items-center justify-between bg-[#faf9f4] p-4 rounded-2xl">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#163526]/40 font-bold">Quantité</p>
                <p className="text-lg font-bold text-[#163526]">{item.quantity} <span className="text-xs font-medium opacity-60">{item.unit}</span></p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-10 h-10 rounded-xl bg-white border border-[#163526]/5 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-10 h-10 rounded-xl bg-white border border-[#163526]/5 flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
