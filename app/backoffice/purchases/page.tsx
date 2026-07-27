"use client";

import React, { useState, useMemo } from "react";
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  FileText, 
  TrendingDown,
  Package,
  Calendar,
  Filter
} from "lucide-react";
import { debounce } from "@/app/lib/utils";
import { useToast } from "@/app/components";

interface Purchase {
  id: string;
  supplier: string;
  category: "Matière Première" | "Fournitures" | "Maintenance" | "Services";
  amount: number;
  date: string;
  status: "Payé" | "En attente" | "Annulé";
  description: string;
}

export default function AdminPurchasesPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const handleSearchChange = useMemo(() => debounce((val: string) => setDebouncedSearch(val), 300), []);
  const [purchases, setPurchases] = useState<Purchase[]>([
    { id: "PUR-2024-001", supplier: "Tissus de Lyon", category: "Matière Première", amount: 4500.50, date: "2026-03-20", status: "Payé", description: "Rouleaux de coton bio bleu marine" },
    { id: "PUR-2024-002", supplier: "Boutons & Co", category: "Fournitures", amount: 320.00, date: "2026-03-22", status: "En attente", description: "1200 boutons nacre 12mm" },
    { id: "PUR-2024-003", supplier: "TechRepar", category: "Maintenance", amount: 1250.00, date: "2026-03-15", status: "Payé", description: "Maintenance préventive machine #2" },
    { id: "PUR-2024-004", supplier: "Filature Moderne", category: "Matière Première", amount: 890.00, date: "2026-03-25", status: "En attente", description: "Bobines fil polyester noir" },
  ]);

  const filteredPurchases = purchases.filter(p => 
    p.supplier.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const totalSpent = purchases.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="px-12 py-10 space-y-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline text-4xl text-[#163526] mb-2">Gestion des Achats</h1>
          <p className="text-xs uppercase tracking-widest text-[#163526]/40 font-bold">Suivi des dépenses et fournisseurs</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#163526]/40" />
            <input
              type="text"
              placeholder="Fournisseur, article..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); handleSearchChange(e.target.value); }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#163526]/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <button 
            onClick={() => showToast("Fonction d'ajout bientôt disponible", "info")}
            className="px-6 py-3 bg-[#163526] text-white rounded-2xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#163526]/90 transition-all shadow-lg shadow-[#163526]/10"
          >
            <Plus className="w-4 h-4" /> Nouvel Achat
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-[#163526]/5 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown className="w-32 h-32 text-red-500" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40 mb-4">Total Dépenses (Mois)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-bold text-[#163526]">{totalSpent.toLocaleString()}</span>
            <span className="text-xl font-headline text-[#163526]/40">€</span>
          </div>
          <p className="mt-4 text-[9px] font-bold text-red-500 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> +5% vs MOIS DERNIER
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-[#163526]/5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40 mb-4">Commandes en attente</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-4xl font-headline font-bold text-[#163526]">2</span>
          </div>
          <p className="mt-4 text-[9px] font-bold text-[#163526]/40 uppercase tracking-widest">Valeur: 1.210 €</p>
        </div>

        <div className="bg-[#163526] p-8 rounded-[2rem] text-white relative shadow-xl overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-orange-500"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Prochain Échéancier</p>
          <div className="flex items-center gap-4 mb-4">
            <Calendar className="w-6 h-6 text-orange-400" />
            <div>
              <p className="text-sm font-bold">Tissus de Lyon</p>
              <p className="text-[10px] uppercase font-bold opacity-40">05 Avril 2026</p>
            </div>
          </div>
          <p className="text-2xl font-headline font-bold text-orange-400">2.450 €</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-[#163526]/5 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#163526]/5 flex justify-between items-center bg-[#faf9f4]/50">
          <h3 className="font-headline text-xl text-[#163526]">Historique des Achats</h3>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#163526]/5 rounded-xl transition-all">
            <Filter className="w-4 h-4 text-[#163526]/40" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Filtrer</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#163526]/5">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">ID / Date</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Fournisseur / Description</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Catégorie</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Montant</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">Statut</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-[#163526]/5 hover:bg-[#faf9f4]/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-[#163526]">{purchase.id}</p>
                    <p className="text-[10px] text-[#163526]/40 font-bold uppercase">{purchase.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-[#163526]">{purchase.supplier}</p>
                    <p className="text-[10px] text-[#163526]/40 font-medium italic truncate max-w-[200px]">{purchase.description}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-[#163526]/5 text-[#163526]/60 text-[9px] font-bold uppercase rounded-full border border-[#163526]/5">
                      {purchase.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-[#163526]">{purchase.amount.toLocaleString()} €</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full ${
                      purchase.status === "Payé" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-[#163526]/5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <FileText className="w-4 h-4 text-[#163526]/40" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
