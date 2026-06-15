"use client";

import React, { useState, useMemo } from "react";
import { Package, Search, Plus, Minus, AlertTriangle } from "lucide-react";
import { useToast } from "@/app/components";
import { debounce } from "@/app/lib/utils";
import { useOptimistic } from "@/app/hooks/useOptimistic";

interface StockItem {
  id: number;
  name: string;
  category: "tissu" | "fil" | "accessoire";
  quantity: number;
  unit: string;
  minThreshold: number;
}

// Mock save function for API
const mockUpdateQuantity = async (id: number, newQty: number) => {
  // Simulate network call
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Quantity updated for id:', id, 'to:', newQty);
};

export function AtelierStock() {
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  
  const initialItems: StockItem[] = [
    { id: 1, name: "Coton Bio Bleu Marine", category: "tissu", quantity: 150, unit: "mètres", minThreshold: 50 },
    { id: 2, name: "Fil Polyester Noir #40", category: "fil", quantity: 12, unit: "bobines", minThreshold: 5 },
    { id: 3, name: "Boutons Nacre 12mm", category: "accessoire", quantity: 1200, unit: "unités", minThreshold: 200 },
    { id: 4, name: "Lin Naturel", category: "tissu", quantity: 30, unit: "mètres", minThreshold: 40 },
    { id: 5, name: "Fermeture Éclair 20cm", category: "accessoire", quantity: 15, unit: "unités", minThreshold: 50 },
  ];
  
  const { data: items, updateOptimistic } = useOptimistic<StockItem[]>({
    initialData: initialItems,
    onSuccess: () => showToast('Stock mis à jour!', 'success'),
    onError: (error, rollbackData) => {
      console.error('Update failed, rolled back', error);
      showToast('Erreur lors de la mise à jour du stock', 'error');
    }
  });

  const updateQuantity = (id: number, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + delta);
    const newItems = items.map(i => 
      i.id === id ? { ...i, quantity: newQty } : i
    );

    if (newQty < item.minThreshold && item.quantity >= item.minThreshold) {
      showToast(`Alerte stock bas : ${item.name}`, "warning");
    }
    
    updateOptimistic(
      newItems,
      () => mockUpdateQuantity(id, newQty)
    );
  };

  // Debounced search - prevent excessive re-renders!
  const handleSearchChange = useMemo(() => 
    debounce((val: string) => setSearchInput(val), 300),
    []
  );

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline text-3xl text-[#e5ad46]">Gestion des Stocks</h2>
          <p className="text-[10px] uppercase tracking-widest text-[#eccc90]/40 font-bold mt-1">Inventaire des matières premières</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#eccc90]/40" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            defaultValue={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e2a38] border border-[#e5ad46]/10 rounded-2xl text-sm text-[#eccc90] focus:outline-none focus:ring-2 focus:ring-[#e5ad46]/20 transition-all placeholder:text-[#eccc90]/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-[#25303a] p-6 rounded-[2rem] border border-[#e5ad46]/5 shadow-sm hover:shadow-2xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${
                item.category === "tissu" ? "bg-blue-500/10 text-blue-400" :
                item.category === "fil" ? "bg-purple-500/10 text-purple-400" :
                "bg-[#e5ad46]/10 text-[#e5ad46]"
              }`}>
                <Package className="w-5 h-5" />
              </div>
              {item.quantity < item.minThreshold && (
                <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-[9px] font-bold uppercase animate-pulse border border-red-500/20">
                  <AlertTriangle className="w-3 h-3" /> Stock Bas
                </div>
              )}
            </div>

            <h3 className="font-headline text-xl text-[#eccc90] mb-1">{item.name}</h3>
            <p className="text-[10px] uppercase tracking-widest text-[#eccc90]/40 font-bold mb-6">{item.category}</p>

            <div className="flex items-center justify-between bg-[#1e2a38] p-4 rounded-2xl">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#eccc90]/40 font-bold">Quantité</p>
                <p className="text-lg font-bold text-[#eccc90]">{item.quantity} <span className="text-xs font-medium opacity-60">{item.unit}</span></p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-10 h-10 rounded-xl bg-[#25303a] border border-[#e5ad46]/10 text-[#eccc90] flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-10 h-10 rounded-xl bg-[#25303a] border border-[#e5ad46]/10 text-[#eccc90] flex items-center justify-center hover:bg-green-500/10 hover:text-green-400 transition-colors"
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
