"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClientAuthGate } from "@/app/components/client-auth-gate";
import { AdminHeaderAlerts } from "./AdminHeaderAlerts";
import { signOutClient } from "@/app/lib/auth-client";
import { useInactivityLogout } from "@/app/lib/use-inactivity-logout";
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
  Pencil,
  LogOut,
  Zap,
  Plus,
  Search,
  ArrowRight,
  Activity,
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
  { href: "/backoffice/matieres", label: "Matières premières", icon: Boxes },
  { href: "/backoffice/produits", label: "Fiches produits", icon: Wrench },
  { href: "/backoffice/clients", label: "Historique client", icon: Users },
  { href: "/backoffice/production", label: "Production", icon: ClipboardList },
  { href: "/backoffice/kanban", label: "Suivi Production", icon: Kanban },
  { href: "/backoffice/avis", label: "Avis clients", icon: Star },
];

const productionItems = [
  { href: "/backoffice/orders", label: "Commandes", icon: Package },
  { href: "/backoffice/delivery-notes", label: "Bons de livraison", icon: Truck },
  { href: "/backoffice/kanban", label: "Suivi Production", icon: Kanban },
];

const employeeItems = [
  { href: "/backoffice/employee/manage", label: "Gestion employés", icon: Users },
  { href: "/backoffice/employee/tickets", label: "Tickets réparation", icon: Wrench },
  { href: "/backoffice/employee/tasks", label: "Suivi étapes", icon: ClipboardList },
];

const financeItems = [
  { href: "/backoffice/purchases", label: "Achats", icon: ShoppingCart },
  { href: "/backoffice/finance/expenses", label: "Dépenses", icon: TrendingDown },
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

function AtelierHub() {
  const [q, setQ] = React.useState("");
  const router = useRouter();
  const pathname = usePathname();
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    // recherche unifiée : redirige vers la section la plus pertinente avec filtre
    if (/^CMD-/i.test(term) || /^\d+$/.test(term)) router.push(`/backoffice/orders?search=${encodeURIComponent(term)}`);
    else if (/@/.test(term)) router.push(`/backoffice/clients?search=${encodeURIComponent(term)}`);
    else router.push(`/backoffice/devis?search=${encodeURIComponent(term)}`);
  }
  return (
    <div className="mx-4 mb-2 rounded-2xl border border-[#e5ad46]/15 bg-gradient-to-br from-[#1e2a38] to-[#25303a] p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e5ad46]">
          <Zap className="h-3.5 w-3.5" /> Hub Atelier
        </span>
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-green-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" /> Live
        </span>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Link href="/backoffice/demandes" className={`rounded-xl border px-3 py-2.5 transition ${pathname?.startsWith("/backoffice/demandes") ? "border-[#e5ad46]/30 bg-[#e5ad46]/10" : "border-[#e5ad46]/10 bg-[#1e2a38] hover:border-[#e5ad46]/20"}`}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#eccc90]/40">Demandes</p>
          <p className="text-xs font-bold text-[#eccc90]">→ Cotation</p>
        </Link>
        <Link href="/backoffice/devis" className={`rounded-xl border px-3 py-2.5 transition ${pathname?.startsWith("/backoffice/devis") ? "border-[#e5ad46]/30 bg-[#e5ad46]/10" : "border-[#e5ad46]/10 bg-[#1e2a38] hover:border-[#e5ad46]/20"}`}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#eccc90]/40">Devis</p>
          <p className="text-xs font-bold text-[#e5ad46]">↗ Commande</p>
        </Link>
      </div>
      {/* Flux cohérent visuel */}
      <div className="mb-3 flex items-center justify-between rounded-full bg-[#1e2a38] px-3 py-1.5 border border-[#e5ad46]/10">
        <span className="text-[8px] font-bold uppercase tracking-widest text-[#eccc90]/50">Flux</span>
        <span className="flex items-center gap-1 text-[8px] font-bold text-[#eccc90]">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Demande
          <ArrowRight className="h-3 w-3 text-[#e5ad46]/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#e5ad46]" /> Cotation
          <ArrowRight className="h-3 w-3 text-[#e5ad46]/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Devis
          <ArrowRight className="h-3 w-3 text-[#e5ad46]/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Cmd
        </span>
      </div>
      <form onSubmit={handleSearch} className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#eccc90]/30" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher client, CMD-, devis..."
          className="w-full rounded-xl border border-[#e5ad46]/15 bg-[#1e2a38] py-2.5 pl-9 pr-3 text-xs text-[#eccc90] placeholder:text-[#eccc90]/30 outline-none focus:border-[#e5ad46]/30"
        />
      </form>
      <div className="grid grid-cols-2 gap-2">
        <Link href="/backoffice/devis/nouvelle" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#e5ad46] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#1e2a38] hover:bg-[#eccc90] transition">
          <Plus className="h-3.5 w-3.5" /> Cotation
        </Link>
        <Link href="/backoffice/devis/nouvelle" className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e5ad46]/20 bg-[#1e2a38] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] hover:bg-[#e5ad46]/10 transition">
          <Plus className="h-3.5 w-3.5" /> Devis
        </Link>
      </div>
      <Link href="/backoffice" className="mt-3 flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#eccc90]/40 hover:text-[#e5ad46] transition">
        <Activity className="h-3 w-3" /> Voir flux complet
      </Link>
    </div>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  // Déconnexion auto après 7 jours d'inactivité
  useInactivityLogout({ redirectTo: "/admin-login" });

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOutClient();
      router.replace("/admin-login");
    } finally {
      setIsSigningOut(false);
    }
  }

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

        <div className="hidden md:block px-2">
          <AtelierHub />
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
          <NavGroup title="Employés" items={employeeItems} />
          <NavGroup title="Finance" items={financeItems} />
          <NavGroup title="Administration" items={adminItems} />

          <Link
            href="/backoffice/site-content"
            className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-all ${
              pathname?.startsWith("/backoffice/site-content") ? "bg-[#e5ad46]/10 text-[#e5ad46]" : "hover:bg-[#e5ad46]/10"
            }`}
          >
            <Pencil className="h-5 w-5 text-[#e5ad46] transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Édition du site</span>
          </Link>

          <div className="mt-8 border-t border-[#e5ad46]/10 pt-8">
            <Link href="/backoffice/settings" className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-[#e5ad46]/10">
              <Settings className="h-5 w-5 text-[#e5ad46] transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Paramètres</span>
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
              <span className="text-[8px] font-bold uppercase tracking-widest">Tâches</span>
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
              Contrôle de production • Temps réel
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
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-60"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">{isSigningOut ? "..." : "Déconnexion"}</span>
              </button>
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
