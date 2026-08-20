"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/app/lib";
import ExchangeRateWidget from "@/app/components/exchange-rate-widget";
import { PrivilegeBadge } from "@/app/components/admin/privilege-badge";
import type { ApiResponse, UserProfile } from "@/app/lib/api";

import {
  LayoutDashboard,
  FileText,
  Package,
  CircleDollarSign,
  AlertTriangle,
  Wallet,
  Users,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  ArrowUpRight,
  Star,
  type LucideIcon,
} from "lucide-react";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface Visitor {
  id: string;
  pseudonym: string;
  page: string;
  duration: string;
  status: string;
}

type CommandeRow = {
  id: string;
  client_id?: string;
  numero?: string;
  designation?: string;
  statut_production?: string;
  pieces_produites?: number;
  quantite?: number;
  total?: number;
  client_first_name?: string;
  client_email?: string;
  en_retard?: boolean;
  created_at?: string;
  date_livraison_prevue?: string;
  notes?: string;
};

type QuoteRow = {
  id: string;
  status?: string;
  deposit_paid?: boolean;
  balance_paid?: boolean;
  deposit_amount?: number | string;
  balance_amount?: number | string;
};

type AchatRow = {
  id: string;
  created_at?: string;
  total_amount?: number | string;
  montant_total?: number | string;
  montant?: number | string;
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  progress,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: "gold" | "success" | "destructive" | "muted";
  progress?: number;
}) {
  const toneMap: Record<string, string> = {
    gold: "text-[#e5ad46] bg-[#e5ad46]/10 border-[#e5ad46]/20",
    success: "text-[#1f8457] bg-[#1f8457]/10 border-[#1f8457]/20",
    destructive: "text-[#b14255] bg-[#b14255]/10 border-[#b14255]/20",
    muted: "text-[#9aa7b4] bg-[#26313d] border-[#e5ad46]/10",
  };
  return (
    <div className="rounded-xl border border-[#e5ad46]/10 bg-[#25303a] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa7b4]">
          {label}
        </span>
        <span className={`flex size-8 items-center justify-center rounded-lg border ${toneMap[tone]}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="font-headline text-3xl font-semibold tabular-nums text-[#f3e9d6]">{value}</p>
      <p className="mt-1 text-xs text-[#9aa7b4]">{hint}</p>
      {typeof progress === "number" && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#26313d]">
          <div
            className="h-full rounded-full bg-[#e5ad46] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [filterActive, setFilterActive] = useState(false);
  const [visitors] = useState<Visitor[]>([]);
  const [commandes, setCommandes] = useState<CommandeRow[]>([]);
  const [dashboardData, setDashboardData] = useState({
    demandesEnAttente: 0,
    cotationsEnAttente: 0,
    commandesEnCours: 0,
    commandesEnRetard: 0,
    caMois: 0,
    acomptes: 0,
    soldes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<Array<{ name: string; ventes: number; depenses: number }>>([]);
  const [clientsMap, setClientsMap] = useState<Record<string, UserProfile>>({});
  const [extraStats, setExtraStats] = useState<Record<string, Record<string, number>> | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Récupérer les données de demandes
        const demandesRes = await authAPI.get<unknown[]>("/demandes-client");
        const demandesCounts = (demandesRes as ApiResponse<unknown[]> & { counts?: Record<string, number> }).counts || {};
        const demandesEnAttente = (demandesCounts['Nouvelle'] || 0) + (demandesCounts["En cours d'étude"] || 0);

        // Récupérer les données de commandes
        const commandesRes = await authAPI.get<CommandeRow[]>("/commandes");
        const commandesCounts = (commandesRes as ApiResponse<CommandeRow[]> & { counts?: Record<string, number> }).counts || {};
        const commandesData: CommandeRow[] = Array.isArray(commandesRes.data) ? commandesRes.data : [];
        const commandesEnCours = commandesData.filter((c: CommandeRow) => c.statut_production !== "Livrée").length;
        const commandesEnRetard = commandesCounts['en_retard'] || 0;
        const caMois = commandesCounts['ca_mois'] || 0;
        setCommandes(commandesData);

        // Récupérer les données de quotes pour acomptes/soldes
        const quotesRes = await authAPI.get<{ data: QuoteRow[] }>("/quotes");
        const quotes: QuoteRow[] = Array.isArray(quotesRes.data) ? quotesRes.data : (quotesRes.data?.data || []);
        let acomptes = 0;
        let soldes = 0;
        quotes.forEach((q: QuoteRow) => {
          if (q.deposit_paid) acomptes += Number(q.deposit_amount || 0);
          if (q.balance_paid) soldes += Number(q.balance_amount || 0);
        });

        setDashboardData({
          demandesEnAttente,
          cotationsEnAttente: quotes.filter((q: QuoteRow) => q.status === 'draft' || q.status === 'sent').length,
          commandesEnCours,
          commandesEnRetard,
          caMois,
          acomptes,
          soldes,
        });

        // Construire le graphique à partir des vraies données mensuelles
        const monthlyData: Record<string, { ventes: number; depenses: number }> = {};
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const now = new Date();

        // Initialiser les 6 derniers mois
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[key] = { ventes: 0, depenses: 0 };
        }

        // Agréger les commandes par mois
        commandesData.forEach((c: CommandeRow) => {
          if (c.created_at) {
            const key = c.created_at.substring(0, 7);
            if (monthlyData[key]) {
              monthlyData[key].ventes += Number(c.total || 0);
            }
          }
        });

        // Agréger les achats (dépenses) par mois
        try {
          const achatsRes = await authAPI.get<{ data: AchatRow[] }>("/achats");
          const achats: AchatRow[] = Array.isArray(achatsRes.data) ? achatsRes.data : (achatsRes.data?.data || []);
          achats.forEach((a: AchatRow) => {
            if (a.created_at) {
              const key = a.created_at.substring(0, 7);
              if (monthlyData[key]) {
                monthlyData[key].depenses += Number(a.total_amount || a.montant_total || a.montant || 0);
              }
            }
          });
        } catch {}

        const chartArray = Object.entries(monthlyData).map(([key, val]) => {
          const monthIdx = parseInt(key.split('-')[1], 10) - 1;
          return { name: monthNames[monthIdx], ventes: Math.round(val.ventes), depenses: Math.round(val.depenses) };
        });

        setChartData(chartArray);

        // Fetch clients for privilege badges
        try {
          const clientsRes = await authAPI.get<{ data: UserProfile[] }>("/users/clients-revenue");
          const clientsData = (Array.isArray(clientsRes.data) ? clientsRes.data : (clientsRes.data?.data || [])) as UserProfile[];
          const map: Record<string, UserProfile> = {};
          clientsData.forEach((u: UserProfile) => { map[u.id] = u; });
          setClientsMap(map);
        } catch {}

        // KPI supplémentaires (stock, satisfaction, relationnel)
        try {
          const statsRes = await authAPI.get<Record<string, Record<string, number>>>("/stats/dashboard");
          setExtraStats(statsRes.data);
        } catch {}
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const tauxLivraison = commandes.length > 0
    ? Math.round((commandes.filter((c) => c.statut_production === "Livrée").length / commandes.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
      {/* Page heading */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#e5ad46]/20 bg-[#e5ad46]/10 text-[#e5ad46]">
            <LayoutDashboard className="size-5" />
          </div>
          <div>
            <h2 className="font-headline text-2xl font-semibold tracking-tight text-[#f3e9d6]">
              Tableau de Bord
            </h2>
            <p className="text-sm text-[#9aa7b4]">
              Contrôle de production ·{" "}
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-md border border-[#e5ad46]/15 bg-[#25303a] px-2.5 py-1.5 font-mono text-[11px] text-[#9aa7b4]">
            v2.4
          </span>
          <Link
            href="/backoffice/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-[#e5ad46]/25 bg-[#e5ad46]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-[#e5ad46] transition-colors hover:bg-[#e5ad46]/20"
          >
            Gérer les Commandes
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          tone="gold"
          label="Devis en attente"
          value={String(dashboardData.cotationsEnAttente)}
          hint={`${dashboardData.demandesEnAttente} demandes à étudier`}
        />
        <StatCard
          icon={Package}
          tone="muted"
          label="Commandes en cours"
          value={String(dashboardData.commandesEnCours)}
          hint="En production"
        />
        <StatCard
          icon={AlertTriangle}
          tone="destructive"
          label="En retard"
          value={String(dashboardData.commandesEnRetard)}
          hint="À relancer"
        />
        <StatCard
          icon={CircleDollarSign}
          tone="success"
          label="CA du mois"
          value={dashboardData.caMois.toLocaleString("fr-FR")}
          hint="Ariary · Taux livraison"
          progress={tauxLivraison}
        />
      </div>

      {/* KPI supplémentaires : stock, satisfaction, relationnel */}
      {extraStats && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#e5ad46]/10 bg-[#25303a] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa7b4]">Stock atelier</span>
              <span className="flex size-8 items-center justify-center rounded-lg border border-[#e5ad46]/20 bg-[#e5ad46]/10 text-[#e5ad46]">
                <Package className="size-4" />
              </span>
            </div>
            <p className="font-headline text-2xl font-semibold tabular-nums text-[#f3e9d6]">
              {Number(extraStats.stock?.matieres ?? 0)}
            </p>
            <p className="mt-1 text-xs text-[#9aa7b4]">
              {Number(extraStats.stock?.alertes ?? 0)} matière(s) sous seuil
            </p>
          </div>
          <div className="rounded-xl border border-[#e5ad46]/10 bg-[#25303a] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa7b4]">Satisfaction</span>
              <span className="flex size-8 items-center justify-center rounded-lg border border-[#1f8457]/20 bg-[#1f8457]/10 text-[#1f8457]">
                <Star className="size-4" />
              </span>
            </div>
            <p className="font-headline text-2xl font-semibold tabular-nums text-[#f3e9d6]">
              {Number(extraStats.satisfaction?.note_moyenne ?? 0).toFixed(1)} / 5
            </p>
            <p className="mt-1 text-xs text-[#9aa7b4]">
              {Number(extraStats.satisfaction?.nb_avis ?? 0)} avis publiés
            </p>
          </div>
          <div className="rounded-xl border border-[#e5ad46]/10 bg-[#25303a] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa7b4]">Paiements en attente</span>
              <span className="flex size-8 items-center justify-center rounded-lg border border-[#b14255]/20 bg-[#b14255]/10 text-[#b14255]">
                <Wallet className="size-4" />
              </span>
            </div>
            <p className="font-headline text-2xl font-semibold tabular-nums text-[#f3e9d6]">
              {Number(extraStats.finance?.paiements_attente ?? 0)}
            </p>
            <p className="mt-1 text-xs text-[#9aa7b4]">
              {Number(extraStats.finance?.liens_paiement ?? 0)} lien(s) généré(s)
            </p>
          </div>
          <div className="rounded-xl border border-[#e5ad46]/10 bg-[#25303a] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa7b4]">Clients fidélisés</span>
              <span className="flex size-8 items-center justify-center rounded-lg border border-[#e5ad46]/20 bg-[#e5ad46]/10 text-[#e5ad46]">
                <Users className="size-4" />
              </span>
            </div>
            <p className="font-headline text-2xl font-semibold tabular-nums text-[#f3e9d6]">
              {Number(extraStats.relationnel?.clients_points ?? 0)}
            </p>
            <p className="mt-1 text-xs text-[#9aa7b4]">
              {Number(extraStats.relationnel?.total_points ?? 0).toLocaleString("fr-FR")} points actifs
            </p>
          </div>
        </div>
      )}

      {/* Financial overview + treasury */}
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#e5ad46]/10 bg-[#25303a] p-5 md:p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-headline text-lg font-semibold tracking-tight text-[#f3e9d6]">
                Bilan Financier Mensuel
              </h3>
              <p className="text-xs text-[#9aa7b4]">
                Ventes vs Dépenses · Derniers 6 mois
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#e5ad46]" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9aa7b4]">Ventes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#d8903c]" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9aa7b4]">Dépenses</span>
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e5ad46" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#e5ad46" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d8903c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#d8903c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(236,204,144,0.08)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9aa7b4", fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9aa7b4", fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) => `${(value / 1000).toLocaleString("fr-FR")}k€`}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(236,204,144,0.15)",
                    background: "#26313d",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
                    padding: "0.75rem 1rem",
                  }}
                  labelStyle={{ fontWeight: 700, marginBottom: "0.5rem", color: "#f3e9d6" }}
                  itemStyle={{ color: "#eccc90", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="ventes"
                  stroke="#e5ad46"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVentes)"
                />
                <Area
                  type="monotone"
                  dataKey="depenses"
                  stroke="#d8903c"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDepenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#e5ad46]/15 bg-gradient-to-b from-[#2b3744] to-[#25303a] p-5 md:p-6">
          <div className="absolute right-0 top-0 h-full w-1 bg-[#e5ad46]" />
          <div>
            <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa7b4]">
              <Wallet className="size-4 text-[#e5ad46]" />
              Trésorerie
            </p>
            <div className="space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9aa7b4]">Acomptes</span>
                <span className="font-headline text-2xl font-semibold tabular-nums text-[#f3e9d6]">
                  {dashboardData.acomptes.toLocaleString("fr-FR")}
                  <span className="ml-1 font-headline text-sm text-[#9aa7b4]">Ar</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 border-t border-[#e5ad46]/10 pt-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9aa7b4]">Soldes</span>
                <span className="font-headline text-2xl font-semibold tabular-nums text-[#e5ad46]">
                  {dashboardData.soldes.toLocaleString("fr-FR")}
                  <span className="ml-1 font-headline text-sm text-[#9aa7b4]">Ar</span>
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#e5ad46]/80">
            <ShieldCheck className="size-3.5" />
            Paiement en 2 tranches actif
          </div>
        </div>
      </section>

      {/* Visitors & exchange */}
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e5ad46]/10 bg-[#25303a] p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-headline text-lg font-semibold tracking-tight text-[#f3e9d6]">
              <Users className="size-4 text-[#e5ad46]" />
              Visiteurs Anonymes
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#1f8457]/25 bg-[#1f8457]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#1f8457]">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-current" />
              </span>
              Live
            </span>
          </div>
          {visitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <Users className="size-8 text-[#9aa7b4]/40" />
              <p className="text-sm text-[#9aa7b4]">Aucun visiteur enregistré pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visitors.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-[#e5ad46]/5 bg-[#26313d] p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`size-2 rounded-full ${
                        v.status === "online"
                          ? "bg-[#1f8457] shadow-[0_0_8px_rgba(31,132,87,0.5)]"
                          : "bg-[#9aa7b4]/40"
                      }`}
                    />
                    <span className="text-sm font-medium text-[#f3e9d6]">{v.pseudonym}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9aa7b4]">{v.page}</p>
                    <p className="text-[9px] font-semibold uppercase text-[#9aa7b4]/50">{v.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ExchangeRateWidget />
      </section>

      {/* Orders table */}
      <section className="mb-6 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="font-headline text-xl font-semibold tracking-tight text-[#f3e9d6]">
              Commandes Actives
            </h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#9aa7b4]">
              Flux de production en temps réel
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setFilterActive(!filterActive)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest transition-all ${
                filterActive
                  ? "border-[#d8903c]/40 bg-[#d8903c]/15 text-[#d8903c]"
                  : "border-[#e5ad46]/15 bg-[#25303a] text-[#9aa7b4] hover:bg-[#e5ad46]/10 hover:text-[#f3e9d6]"
              }`}
            >
              {filterActive ? "Filtres actifs" : "Filtrer"}
            </button>
            <Link
              href="/backoffice/orders"
              className="inline-flex items-center gap-2 rounded-lg bg-[#e5ad46] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#171b22] transition-all hover:bg-[#e5ad46]/90"
            >
              <Package className="size-3.5" />
              Gérer les Commandes
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e5ad46]/10 bg-[#25303a]">
          <div className="hidden grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-[#e5ad46]/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#9aa7b4] md:grid">
            <span>Client & Modèle</span>
            <span className="w-36">Statut</span>
            <span className="w-48">Progression</span>
            <span className="w-28 text-right">Alertes</span>
          </div>

          <div className="divide-y divide-[#e5ad46]/10">
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-[#9aa7b4]">
                <span className="size-4 animate-spin rounded-full border-2 border-[#e5ad46]/30 border-t-[#e5ad46]" />
                Chargement…
              </div>
            ) : commandes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <ClipboardList className="size-8 text-[#9aa7b4]/40" />
                <p className="text-sm italic text-[#9aa7b4]">Aucune commande pour le moment.</p>
              </div>
            ) : (
              commandes.slice(0, 8).map((c: CommandeRow) => {
                const enRetard = c.en_retard;
                const pct = c.quantite && c.quantite > 0 ? Math.min(100, Math.round(((c.pieces_produites || 0) / c.quantite) * 100)) : 0;
                return (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/backoffice/orders?id=${c.id}`)}
                    className="grid cursor-pointer grid-cols-1 items-center gap-4 px-5 py-4 transition-colors hover:bg-[#26313d] md:grid-cols-[1fr_auto_auto_auto]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#e5ad46]/10 bg-[#26313d] text-[#e5ad46]">
                        <ClipboardList className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#f3e9d6]">
                          {c.client_first_name || c.client_email || "Client"}
                          {c.client_id && clientsMap[c.client_id] && (
                            <PrivilegeBadge
                              isPrivileged={clientsMap[c.client_id].is_privileged}
                              cumulativeRevenue={clientsMap[c.client_id].cumulative_revenue}
                              className="ml-2"
                            />
                          )}
                        </p>
                        <p className="truncate text-[11px] uppercase tracking-wider text-[#9aa7b4]">
                          {c.designation || "Sans désignation"}
                        </p>
                      </div>
                    </div>

                    <div className="md:w-36">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                          c.statut_production === "Livrée"
                            ? "border-[#1f8457]/25 bg-[#1f8457]/10 text-[#1f8457]"
                            : enRetard
                              ? "border-[#b14255]/25 bg-[#b14255]/10 text-[#b14255]"
                              : "border-[#e5ad46]/20 bg-[#e5ad46]/10 text-[#e5ad46]"
                        }`}
                      >
                        {c.statut_production}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 md:w-48">
                      <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wide text-[#9aa7b4]">
                        <span>{c.pieces_produites} / {c.quantite} pièces</span>
                        <span className="text-[#e5ad46]">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#26313d]">
                        <div
                          className="h-full rounded-full bg-[#e5ad46] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="md:w-28 md:text-right">
                      {enRetard ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#b14255]/25 bg-[#b14255]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#b14255]">
                          <AlertTriangle className="size-3.5" />
                          En retard
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9aa7b4]/40">
                          RAS
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Bento grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-5">
        <Link
          href="/backoffice/production"
          className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-[#2b3744] to-[#1a2530] p-6 md:col-span-2 md:p-8"
        >
          <div className="relative z-10">
            <h4 className="font-headline text-2xl font-semibold italic text-[#f3e9d6]">
              Excellence Technique
            </h4>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#9aa7b4]">
              98.4% des commandes passent le contrôle qualité au premier essai ce mois-ci.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e5ad46] transition-colors group-hover:text-[#f3e9d6]">
              Suivi de Production
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
          <div className="absolute -bottom-8 -right-8 text-[120px] leading-none text-[#e5ad46]/5 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
            <ShieldCheck className="size-full" />
          </div>
        </Link>

        <div className="flex flex-col justify-between rounded-xl border border-[#e5ad46]/10 bg-[#25303a] p-6">
          <AlertTriangle className="size-8 text-[#d8903c]" />
          <div>
            <p className="font-headline text-4xl font-bold tabular-nums text-[#f3e9d6]">
              {String(dashboardData.commandesEnRetard).padStart(2, "0")}
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9aa7b4]">
              Alertes de production
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[#e5ad46]/10 bg-[#25303a] p-6">
          <div className="mb-6 flex -space-x-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex size-9 items-center justify-center rounded-full border-2 border-[#25303a] bg-[#26313d] text-[10px] font-bold text-[#eccc90]"
              >
                OP
              </div>
            ))}
            <div className="flex size-9 items-center justify-center rounded-full border-2 border-[#25303a] bg-[#e5ad46] text-[10px] font-bold text-[#171b22]">
              +8
            </div>
          </div>
          <div>
            <p className="font-headline text-xl font-semibold text-[#f3e9d6]">Atelier Actif</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9aa7b4]">
              12 Opérateurs connectés
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}