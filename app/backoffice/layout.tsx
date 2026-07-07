"use client";

import React from "react";
import Link from "next/link";
import { ClientAuthGate } from "@/app/components/client-auth-gate";
import { AdminHeaderAlerts } from "./AdminHeaderAlerts";

function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#1e2a38] font-body text-[#eccc90] md:flex">
      <aside className="z-50 flex w-full flex-col bg-[#25303a] text-[#eccc90] shadow-2xl transition-all duration-300 md:fixed md:left-0 md:top-0 md:h-full md:w-64 border-r border-[#e5ad46]/10">
        <div className="flex items-center justify-between border-b border-[#e5ad46]/10 p-6 md:block md:p-8">
          <div>
            <Link href="/" className="mb-1 block font-headline text-xl text-[#e5ad46] md:text-2xl">
              JMR Atelier
            </Link>
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#eccc90]/60 md:text-[10px]">
              Admin Control
            </span>
          </div>
        </div>

        <nav className="hidden flex-1 space-y-2 overflow-y-auto px-4 py-4 md:block md:py-8">
          <Link href="/backoffice" className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-[#e5ad46]/10">
            <span className="material-symbols-outlined text-[#e5ad46] transition-transform group-hover:scale-110">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Tableau de bord</span>
          </Link>
          <Link href="/backoffice/orders" className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-[#e5ad46]/10">
            <span className="material-symbols-outlined text-[#e5ad46] transition-transform group-hover:scale-110">inventory_2</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Commandes</span>
          </Link>
          <Link href="/backoffice/employees/new" className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-[#e5ad46]/10">
            <span className="material-symbols-outlined text-[#e5ad46] transition-transform group-hover:scale-110">group_add</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Dossiers RH</span>
          </Link>
          <Link href="/backoffice/devis" className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-[#e5ad46]/10">
            <span className="material-symbols-outlined text-[#e5ad46] transition-transform group-hover:scale-110">request_quote</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Devis</span>
          </Link>
          <Link href="/backoffice/production" className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-[#e5ad46]/10">
            <span className="material-symbols-outlined text-[#e5ad46] transition-transform group-hover:scale-110">precision_manufacturing</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Production</span>
          </Link>
          <Link href="/backoffice/purchases" className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-[#e5ad46]/10">
            <span className="material-symbols-outlined text-[#e5ad46] transition-transform group-hover:scale-110">shopping_cart</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Achats</span>
          </Link>

          <div className="mt-8 border-t border-[#e5ad46]/10 pt-8">
            <Link href="/backoffice/settings" className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-[#e5ad46]/10">
              <span className="material-symbols-outlined text-[#e5ad46] transition-transform group-hover:scale-110">settings</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Parametres</span>
            </Link>
          </div>
        </nav>

        <div className="flex gap-4 overflow-x-auto border-b border-[#e5ad46]/10 bg-[#25303a] p-4 md:hidden">
          <Link href="/backoffice" className="flex-shrink-0 rounded-lg bg-[#e5ad46]/10 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#e5ad46]">dashboard</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">Dashboard</span>
            </div>
          </Link>
          <Link href="/backoffice/orders" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#e5ad46]/5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#e5ad46]">inventory_2</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">Orders</span>
            </div>
          </Link>
        </div>

        <div className="mt-auto hidden bg-black/20 p-6 md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5ad46] font-bold text-[#1e2a38] shadow-lg">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5ad46]">Administrateur</span>
              <span className="text-sm font-semibold text-[#eccc90]">Atelier JMR</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="relative flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#e5ad46]/10 bg-[#1e2a38]/80 px-6 py-4 backdrop-blur-md md:px-12 md:py-6">
          <div>
            <h1 className="font-headline text-xl text-[#e5ad46] md:text-2xl">Espace de Gestion</h1>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#eccc90]/40 md:text-[10px]">
              Controle de production • Temps reel
            </p>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <AdminHeaderAlerts />
            <div className="hidden h-8 w-[1px] bg-[#e5ad46]/10 md:block" />
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                href="/backoffice/employees/new"
                className="hidden items-center gap-2 rounded-full bg-[#e5ad46] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#1e2a38] shadow-sm transition hover:bg-[#eccc90] lg:inline-flex"
              >
                <span className="material-symbols-outlined text-sm text-[#1e2a38]">person_add</span>
                Nouveau dossier RH
              </Link>
              <span className="hidden rounded-full bg-[#e5ad46]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] md:inline-block">
                Systeme v2.4
              </span>
              <Link href="/" className="material-symbols-outlined text-[#eccc90]/60 transition-colors hover:text-[#e5ad46]">
                home
              </Link>
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthGate allowedRoles={["admin"]}>
      <AdminShell>{children}</AdminShell>
    </ClientAuthGate>
  );
}
