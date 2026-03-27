import React from "react";
import Link from "next/link";
import { getCurrentUser } from "../lib/auth-server";
import { redirect } from "next/navigation";
import { AdminHeaderAlerts } from "./AdminHeaderAlerts";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser(true); // Sécurité renforcée pour l'admin

  // PRIVILEGE CHECK: Only admin can access this layout
  if (!user || user.role !== "admin") {
    // If worker, redirect to atelier
    if (user?.role === "worker") {
      redirect("/atelier");
    }
    // If client or not logged in, redirect to home/login
    redirect("/");
  }

  return (
    <div className="bg-[#faf9f4] font-body text-[#1b1c19] min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Stitch Style */}
      <aside className="w-full md:w-64 bg-[#163526] text-[#faf9f4] md:h-full z-50 transition-all duration-300 shadow-2xl flex flex-col md:fixed md:left-0 md:top-0">
        <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between md:block">
          <div>
            <Link href="/" className="font-headline text-xl md:text-2xl text-white block mb-1">
              JMR Atelier
            </Link>
            <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold">Admin Control</span>
          </div>
          {/* Mobile Menu Button can go here if needed */}
        </div>
        
        <nav className="flex-1 py-4 md:py-8 px-4 space-y-2 overflow-y-auto hidden md:block">
          <Link 
            href="/jmr-atelier-management-v2" 
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
          >
            <span className="material-symbols-outlined text-orange-400 group-hover:scale-110 transition-transform">dashboard</span>
            <span className="text-xs font-bold uppercase tracking-widest">Tableau de bord</span>
          </Link>
          <Link 
            href="/jmr-atelier-management-v2/orders" 
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
          >
            <span className="material-symbols-outlined text-orange-400 group-hover:scale-110 transition-transform">inventory_2</span>
            <span className="text-xs font-bold uppercase tracking-widest">Commandes</span>
          </Link>
          <Link 
            href="/jmr-atelier-management-v2/devis" 
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
          >
            <span className="material-symbols-outlined text-orange-400 group-hover:scale-110 transition-transform">request_quote</span>
            <span className="text-xs font-bold uppercase tracking-widest">Devis</span>
          </Link>
          <Link 
            href="/jmr-atelier-management-v2/production" 
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
          >
            <span className="material-symbols-outlined text-orange-400 group-hover:scale-110 transition-transform">precision_manufacturing</span>
            <span className="text-xs font-bold uppercase tracking-widest">Production</span>
          </Link>
          <Link 
            href="/jmr-atelier-management-v2/purchases" 
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
          >
            <span className="material-symbols-outlined text-orange-400 group-hover:scale-110 transition-transform">shopping_cart</span>
            <span className="text-xs font-bold uppercase tracking-widest">Achats</span>
          </Link>
          <div className="pt-8 mt-8 border-t border-white/5">
            <Link 
              href="/jmr-atelier-management-v2/settings" 
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
            >
              <span className="material-symbols-outlined text-orange-400 group-hover:scale-110 transition-transform">settings</span>
              <span className="text-xs font-bold uppercase tracking-widest">Paramètres</span>
            </Link>
          </div>
        </nav>

        {/* Mobile Nav - visible only on small screens */}
        <div className="md:hidden flex overflow-x-auto p-4 gap-4 border-b border-white/10 bg-[#163526]">
          <Link href="/jmr-atelier-management-v2" className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
            <span className="material-symbols-outlined text-orange-400 text-sm">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
          </Link>
          <Link href="/jmr-atelier-management-v2/orders" className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
            <span className="material-symbols-outlined text-orange-400 text-sm">inventory_2</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Orders</span>
          </Link>
          <Link href="/jmr-atelier-management-v2/devis" className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
            <span className="material-symbols-outlined text-orange-400 text-sm">request_quote</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Devis</span>
          </Link>
        </div>

        <div className="p-6 bg-black/20 mt-auto hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Administrateur</span>
              <span className="text-sm font-semibold text-white">Atelier JMR</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Correctly Offset by Sidebar width on Desktop */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen relative">
        {/* Header - Stitch Style */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#163526]/5 z-40 px-6 md:px-12 py-4 md:py-6 flex justify-between items-center">
          <div>
            <h1 className="font-headline text-xl md:text-2xl text-[#163526]">Espace de Gestion</h1>
            <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-[#1b1c19]/40 font-bold mt-1">Contrôle de production • Temps réel</p>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <AdminHeaderAlerts />
            <div className="hidden md:block h-8 w-[1px] bg-[#163526]/10"></div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full">Système v2.4</span>
              <Link href="/" className="material-symbols-outlined text-[#163526]/60 hover:text-orange-500 transition-colors">home</Link>
            </div>
          </div>
        </header>
        
        {/* Content with its own scrolling if needed */}
        <main className="flex-1 relative overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
