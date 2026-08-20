"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientAuthGate } from "@/app/components/client-auth-gate";
import { AdminHeaderAlerts } from "./AdminHeaderAlerts";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Wrench,
  ClipboardList,
  TrendingDown,
  Receipt,
  DollarSign,
  Settings,
  Home,
  Package,
  ChevronDown,
  Shield,
  Ban,
  Truck,
  Users,
  Boxes,
  Kanban,
  Star,
  FileDown,
} from "lucide-react";

const clientItems = [
  { href: "/backoffice/client/devis", label: "Devis", icon: FileText },
  { href: "/backoffice/client/orders", label: "Commandes", icon: Package },
  { href: "/backoffice/client/payments", label: "Paiements", icon: CreditCard },
  { href: "/backoffice/client/complaints", label: "Plaintes", icon: MessageSquare },
];

const atelierItems = [
  { href: "/backoffice/demandes", label: "Demandes client", icon: MessageSquare },
  { href: "/backoffice/devis", label: "Cotations / Devis", icon: FileText },
  { href: "/backoffice/orders", label: "Commandes", icon: Package },
  { href: "/backoffice/matieres", label: "MatiÃ¨res premiÃ¨res", icon: Boxes },
  { href: "/backoffice/produits", label: "Fiches produits", icon: Wrench },
  { href: "/backoffice/clients", label: "Historique client", icon: Users },
  { href: "/backoffice/production", label: "Production", icon: ClipboardList },
  { href: "/backoffice/kanban", label: "Kanban production", icon: Kanban },
  { href: "/backoffice/avis", label: "Avis clients", icon: Star },
];

const productionItems = [
  { href: "/backoffice/orders", label: "Commandes", icon: Package },
  { href: "/backoffice/delivery-notes", label: "Bons de livraison", icon: Truck },
  { href: "/backoffice/kanban", label: "Kanban production", icon: Kanban },
];

const employeeItems = [
  { href: "/backoffice/employee/manage", label: "Gestion employÃ©s", icon: Users },
  { href: "/backoffice/employee/tickets", label: "Tickets rÃ©paration", icon: Wrench },
  { href: "/backoffice/employee/tasks", label: "Suivi Ã©tapes", icon: ClipboardList },
];

const financeItems = [
  { href: "/backoffice/purchases", label: "Achats", icon: ShoppingCart },
  { href: "/backoffice/finance/expenses", label: "DÃ©penses", icon: TrendingDown },
  { href: "/backoffice/finance/invoices", label: "Factures", icon: Receipt },
  { href: "/backoffice/finance/payroll", label: "Paie", icon: DollarSign },
  { href: "/backoffice/exports", label: "Exports CSV", icon: FileDown },
];

const adminItems = [
  { href: "/backoffice/admin/bans", label: "Bannissements", icon: Shield },
  { href: "/backoffice/admin/blacklist", label: "Blacklist", icon: Ban },
];

function NavGroup({ title, items }: { title: string; items: { href: string; label: string; icon: React.ElementType }[] }) {
  const pathname = usePathname();
  const isActive = items.some((i) => pathname?.startsWith(i.href));
  const [open, setOpen] = React.useState(isActive);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#eccc90]/40 transition-colors hover:text-[#e5ad46]"
      >
        {title}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-2 mt-1 space-y-1 border-l border-[#e5ad46]/10 pl-3">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/backoffice/client/devis" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-[10px] font-bold uppercase tracking-widest ${
                  active
                    ? "bg-[#e5ad46]/10 text-[#e5ad46]"
                    : "text-[#eccc90]/60 hover:bg-[#e5ad46]/5 hover:text-[#eccc90]"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-[#e5ad46]" : "text-[#eccc90]/40"} transition-transform group-hover:scale-110`} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
          <Link
            href="/backoffice"
            className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-all ${
              pathname === "/backoffice" ? "bg-[#e5ad46]/10 text-[#e5ad46]" : "hover:bg-[#e5ad46]/10"
            }`}
          >
            <LayoutDashboard className="h-5 w-5 text-[#e5ad46] transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Tableau de bord</span>
          </Link>

          <NavGroup title="Clients" items={clientItems} />
          <NavGroup title="Atelier JMR" items={atelierItems} />
          <NavGroup title="Production" items={productionItems} />
          <NavGroup title="EmployÃ©s" items={employeeItems} />
          <NavGroup title="Finance" items={financeItems} />
          <NavGroup title="Administration" items={adminItems} />

          <div className="mt-8 border-t border-[#e5ad46]/10 pt-8">
            <Link href="/backoffice/settings" className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-[#e5ad46]/10">
              <Settings className="h-5 w-5 text-[#e5ad46] transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-bold uppercase tracking-widest">ParamÃ¨tres</span>
            </Link>
          </div>
        </nav>

        <div className="flex gap-4 overflow-x-auto border-b border-[#e5ad46]/10 bg-[#25303a] p-4 md:hidden">
          <Link href="/backoffice" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#e5ad46]/5 first:bg-[#e5ad46]/10">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-[#e5ad46]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Tableau de bord</span>
            </div>
          </Link>
          <Link href="/backoffice/client/devis" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#e5ad46]/5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#e5ad46]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Devis</span>
            </div>
          </Link>
          <Link href="/backoffice/client/orders" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#e5ad46]/5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#e5ad46]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Commandes</span>
            </div>
          </Link>
          <Link href="/backoffice/employee/tickets" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#e5ad46]/5">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[#e5ad46]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Tickets</span>
            </div>
          </Link>
          <Link href="/backoffice/employee/tasks" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#e5ad46]/5">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#e5ad46]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">TÃ¢ches</span>
            </div>
          </Link>
          <Link href="/backoffice/orders" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#e5ad46]/5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#e5ad46]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Prod.</span>
            </div>
          </Link>
          <Link href="/backoffice/delivery-notes" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#e5ad46]/5">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#e5ad46]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">BL</span>
            </div>
          </Link>
          <Link href="/backoffice/purchases" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#e5ad46]/5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[#e5ad46]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Achats</span>
            </div>
          </Link>
          <Link href="/backoffice/finance/invoices" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#e5ad46]/5">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#e5ad46]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Factures</span>
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
              Controle de production â€¢ Temps reel
            </p>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <AdminHeaderAlerts />
            <div className="hidden h-8 w-[1px] bg-[#e5ad46]/10 md:block" />
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden rounded-full bg-[#e5ad46]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] md:inline-block">
                Systeme v2.4
              </span>
              <Link href="/" className="text-[#eccc90]/60 transition-colors hover:text-[#e5ad46]" aria-label="Retour au site">
                <Home className="h-5 w-5" />
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

