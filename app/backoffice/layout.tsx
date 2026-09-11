"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClientAuthGate } from "@/app/components/client-auth-gate";
import { AdminHeaderAlerts } from "./AdminHeaderAlerts";
import { signOutClient } from "@/app/lib/auth-client";
import { getUser } from "@/app/lib/auth";
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
  ChevronRight,
  Shield,
  Ban,
  Truck,
  Users,
  Boxes,
  Kanban,
  Star,
  FileDown,
  LogOut,
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

function NavGroup({ title, icon: GroupIcon, items }: { title: string; icon: React.ElementType; items: { href: string; label: string; icon: React.ElementType }[] }) {
  const pathname = usePathname();
  const isActive = items.some((i) => pathname?.startsWith(i.href));
  const [open, setOpen] = React.useState(isActive);

  return (
    <div className="mb-[2px]">
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center gap-[11px] rounded-md border-0 bg-transparent px-3 py-[11px] text-[12.5px] font-semibold tracking-[0.5px] transition-colors ${
          open ? "text-[#F5A623]" : "text-[#7b8496] hover:bg-[#17202f] hover:text-[#ece7db]"
        }`}
      >
        <GroupIcon className="h-4 w-4 shrink-0 opacity-85" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronRight className={`h-[13px] w-[13px] shrink-0 opacity-55 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="ml-5 space-y-[1px] border-l border-dashed border-[rgba(245, 166, 35,0.14)] pl-2.5">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/backoffice/client/devis" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2.5 rounded-[5px] px-3 py-[9px] text-[13px] transition-colors ${
                  active
                    ? "bg-[linear-gradient(90deg,rgba(245, 166, 35,0.14),rgba(245, 166, 35,0.02))] text-[#ece7db]"
                    : "text-[#7b8496] hover:bg-[#17202f] hover:text-[#ece7db]"
                }`}
              >
                {active && (
                  <span className="absolute -left-[11px] top-[3px] bottom-[3px] w-[2px] rounded-sm bg-[#F5A623]" />
                )}
                <Icon className={`h-[15px] w-[15px] shrink-0 ${active ? "text-[#F5A623] opacity-100" : "opacity-80"}`} />
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
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [profileName, setProfileName] = React.useState("Utilisateur");
  const [profileInitials, setProfileInitials] = React.useState("U");
  const [profileRole, setProfileRole] = React.useState("");

  // Déconnexion auto après 7 jours d'inactivité
  useInactivityLogout({ redirectTo: "/admin-login" });

  React.useEffect(() => {
    const user = getUser();
    if (!user) return;
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    if (fullName) {
      setProfileName(fullName);
      setProfileInitials(
        fullName
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join("") || "U",
      );
    }
    if (typeof user.role === "string" && user.role.length > 0) {
      setProfileRole(user.role.charAt(0).toUpperCase() + user.role.slice(1));
    }
  }, []);

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
    <div className="min-h-screen overflow-hidden bg-[#1e2a38] font-body text-[#F5A623] md:flex">
      <aside className="z-50 flex w-full flex-col bg-[linear-gradient(180deg,#121a28,#0f1622)] shadow-2xl transition-all duration-300 md:fixed md:left-0 md:top-0 md:h-full md:w-64 border-r border-white/5">
        <div className="px-6 pt-7 pb-5 md:block">
          <div>
            <Link href="/" className="mb-[5px] block font-brand text-[23px] font-semibold tracking-[0.5px] text-[#F5A623]">
              JMR Atelier
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7b8496]">
              Admin Control
            </p>
          </div>
        </div>
        <div className="mx-6 mb-[6px] border-b border-dashed border-[rgba(245, 166, 35,0.14)]" />

        <nav className="hidden flex-1 space-y-0 overflow-y-auto px-[14px] py-[10px] md:block">
          <Link
            href="/backoffice"
            className={`relative flex items-center gap-2.5 rounded-[5px] px-3 py-[9px] text-[13px] transition-colors ${
              pathname === "/backoffice"
                ? "bg-[linear-gradient(90deg,rgba(245, 166, 35,0.14),rgba(245, 166, 35,0.02))] text-[#ece7db]"
                : "text-[#7b8496] hover:bg-[#17202f] hover:text-[#ece7db]"
            }`}
          >
            {pathname === "/backoffice" && (
              <span className="absolute -left-[11px] top-[3px] bottom-[3px] w-[2px] rounded-sm bg-[#F5A623]" />
            )}
            <LayoutDashboard className={`h-[15px] w-[15px] shrink-0 ${pathname === "/backoffice" ? "text-[#F5A623] opacity-100" : "opacity-80"}`} />
            Tableau de bord
          </Link>

          <NavGroup title="Clients" icon={Users} items={clientItems} />
          <NavGroup title="Atelier JMR" icon={Wrench} items={atelierItems} />
          <NavGroup title="Production" icon={ClipboardList} items={productionItems} />
          <NavGroup title="Employés" icon={Users} items={employeeItems} />
          <NavGroup title="Finance" icon={DollarSign} items={financeItems} />
          <NavGroup title="Administration" icon={Shield} items={adminItems} />
        </nav>

        <div className="flex gap-4 overflow-x-auto border-b border-[#F5A623]/10 bg-[#25303a] p-4 md:hidden">
          <Link href="/backoffice" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#F5A623]/5 first:bg-[#F5A623]/10">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-[#F5A623]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Tableau de bord</span>
            </div>
          </Link>
          <Link href="/backoffice/client/devis" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#F5A623]/5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#F5A623]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Devis</span>
            </div>
          </Link>
          <Link href="/backoffice/client/orders" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#F5A623]/5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#F5A623]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Commandes</span>
            </div>
          </Link>
          <Link href="/backoffice/employee/tickets" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#F5A623]/5">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[#F5A623]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Tickets</span>
            </div>
          </Link>
          <Link href="/backoffice/employee/tasks" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#F5A623]/5">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#F5A623]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Tâches</span>
            </div>
          </Link>
          <Link href="/backoffice/orders" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#F5A623]/5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#F5A623]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Prod.</span>
            </div>
          </Link>
          <Link href="/backoffice/delivery-notes" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#F5A623]/5">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#F5A623]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">BL</span>
            </div>
          </Link>
          <Link href="/backoffice/purchases" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#F5A623]/5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[#F5A623]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Achats</span>
            </div>
          </Link>
          <Link href="/backoffice/finance/invoices" className="flex-shrink-0 rounded-lg px-3 py-2 hover:bg-[#F5A623]/5">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#F5A623]" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Factures</span>
            </div>
          </Link>
        </div>

        <div className="mt-auto hidden border-t border-white/5 p-[14px] md:block">
          <div className="mb-1 flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-[#17202f]">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F5A623,#F5A623)] font-brand text-[12px] font-semibold text-[#181205]">
              {profileInitials}
            </div>
            <div>
              <p className="text-[12.5px] font-medium text-[#ece7db]">{profileName}</p>
              {profileRole !== "" && <p className="text-[10.5px] text-[#7b8496]">{profileRole}</p>}
            </div>
          </div>
          <Link
            href="/backoffice/settings"
            className="flex items-center gap-[11px] rounded-md px-3 py-2.5 text-[12.5px] font-medium tracking-[0.3px] text-[#7b8496] transition-colors hover:bg-[#17202f] hover:text-[#ece7db]"
          >
            <Settings className="h-4 w-4 shrink-0 opacity-80" />
            Paramètres
          </Link>
        </div>
      </aside>

      <div className="relative flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#F5A623]/10 bg-[#1e2a38]/80 px-6 py-4 backdrop-blur-md md:px-12 md:py-6">
          <div>
            <h1 className="font-headline text-xl text-[#F5A623] md:text-2xl">Espace de Gestion</h1>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#F5A623]/40 md:text-[10px]">
              Contrôle de production • Temps réel
            </p>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <AdminHeaderAlerts />
            <div className="hidden h-8 w-[1px] bg-[#F5A623]/10 md:block" />
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden rounded-full bg-[#F5A623]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#F5A623] md:inline-block">
                Systeme v2.4
              </span>
              <Link href="/" className="text-[#F5A623]/60 transition-colors hover:text-[#F5A623]" aria-label="Retour au site">
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
