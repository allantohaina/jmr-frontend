"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Package, Search, Plus, Minus, AlertTriangle } from "lucide-react";
import { useToast } from "@/app/components";
import { debounce } from "@/app/lib/utils";
import { useOptimistic } from "@/app/hooks/useOptimistic";
import { matieresAPI, type MatiereRecord } from "@/app/lib/api";

interface StockItem {
  id: string;
  name: string;
  category: "tissu" | "fil" | "accessoire";
  quantity: number;
  unit: string;
  minThreshold: number;
}

function toStockItem(m: MatiereRecord): StockItem {
  const raw = `${m.nom ?? ""} ${m.description ?? ""}`.toLowerCase();
  const category: StockItem["category"] = raw.includes("fil")
    ? "fil"
    : raw.includes("bouton") || raw.includes("fermeture") || raw.includes("accessoire")
      ? "accessoire"
      : "tissu";
  return {
    id: String(m.id),
    name: m.nom || "Sans nom",
    category,
    quantity: Number(m.stock_actuel ?? 0),
    unit: m.unite || "pce",
    minThreshold: Number(m.stock_seuil ?? 0),
  };
}

export function AtelierStock() {
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: items, updateOptimistic, setData } = useOptimistic<StockItem[]>({
    initialData: [],
    onSuccess: () => showToast('Stock mis à jour!', 'success'),
    onError: (error, rollbackData) => {
      console.error('Update failed, rolled back', error);
      showToast('Erreur lors de la mise à jour du stock', 'error');
    }
  });

  const fetchStock = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await matieresAPI.list();
      const list: MatiereRecord[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setData(list.map(toStockItem));
    } catch (error) {
      console.error("Erreur chargement stock atelier:", error);
      showToast("Impossible de charger le stock", "error");
    } finally {
      setIsLoading(false);
    }
  }, [setData, showToast]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const updateQuantity = (id: string, delta: number) => {
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
      () => matieresAPI.mouvement({
        matiere_id: String(id),
        type: delta >= 0 ? "entree" : "sortie",
        quantite: Math.abs(delta),
        motif: "Ajustement atelier",
      })
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
          <h2 className="font-headline text-3xl text-[#EAA100]">Gestion des Stocks</h2>
          <p className="text-caption uppercase tracking-widest text-[#EAA100]/40 font-bold mt-1">Inventaire des matières premières</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EAA100]/40" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            defaultValue={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e2a38] border border-[#EAA100]/10 rounded-2xl text-sm text-[#EAA100] focus:outline-none focus:ring-2 focus:ring-[#EAA100]/20 transition-all placeholder:text-[#EAA100]/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-sm text-[#EAA100]/40 italic md:col-span-3">Chargement du stock…</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-[#EAA100]/40 italic md:col-span-3">Aucune matière en stock pour le moment.</p>
        ) : (
        <>
        {filteredItems.map(item => (
          <div key={item.id} className="bg-[#161D30] p-6 rounded-[2rem] border border-[#EAA100]/5 shadow-sm hover:shadow-2xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${
                item.category === "tissu" ? "bg-[#5C9AD9]/10 text-[#5C9AD9]" :
                item.category === "fil" ? "bg-purple-500/10 text-purple-400" :
                "bg-[#EAA100]/10 text-[#EAA100]"
              }`}>
                <Package className="w-5 h-5" />
              </div>
              {item.quantity < item.minThreshold && (
                <div className="flex items-center gap-1 px-3 py-1 bg-[#E05252]/10 text-[#F3A3A6] rounded-full text-micro font-bold uppercase animate-pulse border border-[#E05252]/20">
                  <AlertTriangle className="w-3 h-3" /> Stock Bas
                </div>
              )}
            </div>

            <h3 className="font-headline text-xl text-[#EAA100] mb-1">{item.name}</h3>
            <p className="text-caption uppercase tracking-widest text-[#EAA100]/40 font-bold mb-6">{item.category}</p>

            <div className="flex items-center justify-between bg-[#1e2a38] p-4 rounded-2xl">
              <div>
                <p className="text-micro uppercase tracking-widest text-[#EAA100]/40 font-bold">Quantité</p>
                <p className="text-lg font-bold text-[#EAA100]">{item.quantity} <span className="text-xs font-medium opacity-60">{item.unit}</span></p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-10 h-10 rounded-xl bg-[#161D30] border border-[#EAA100]/10 text-[#EAA100] flex items-center justify-center hover:bg-[#E05252]/10 hover:text-[#F3A3A6] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-10 h-10 rounded-xl bg-[#161D30] border border-[#EAA100]/10 text-[#EAA100] flex items-center justify-center hover:bg-[#1F8457]/10 hover:text-[#5CB87D] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        </>
        )}
      </div>
    </div>
  );
}
