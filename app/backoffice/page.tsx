"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/app/lib";
import ExchangeRateWidget from "@/app/components/exchange-rate-widget";

import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [filterActive, setFilterActive] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Récupérer les données de demandes
        const demandesRes = await authAPI.get<{ data: unknown[]; counts: Record<string, number> }>("/demandes-client");
        const demandesCounts = demandesRes.data?.counts || {};
        const demandesEnAttente = (demandesCounts['Nouvelle'] || 0) + (demandesCounts["En cours d'étude"] || 0);

        // Récupérer les données de commandes
        const commandesRes = await authAPI.get<{ data: CommandeRow[]; counts: Record<string, number> }>("/commandes");
        const commandesCounts = commandesRes.data?.counts || {};
        const commandesData = commandesRes.data?.data || [];
        const commandesEnCours = commandesData.filter((c: CommandeRow) => c.statut_production !== "Livrée").length;
        const commandesEnRetard = commandesCounts['en_retard'] || 0;
        const caMois = commandesCounts['ca_mois'] || 0;
        setCommandes(commandesData);

        // Récupérer les données de quotes pour acomptes/soldes
        const quotesRes = await authAPI.get<{ data: QuoteRow[] }>("/quotes");
        const quotes = quotesRes.data?.data || [];
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
          const achats = achatsRes.data?.data || [];
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
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="px-4 md:px-12 py-6 md:py-10 space-y-8 md:space-y-12">
      {/* Financial Overview with Chart */}
      <section className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-[#163526]/5 shadow-sm space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="font-headline text-3xl text-[#163526] mb-2">Bilan Financier Mensuel</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#163526]/40 font-bold">Ventes vs Dépenses (Derniers 6 mois)</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#163526]"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/60">Ventes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/60">Dépenses</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">
                {dashboardData.commandesEnCours} en cours
              </span>
            </div>
          </div>
        </div>

        <div className="h-[250px] sm:h-[300px] md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#163526" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#163526" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#16352610" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#16352640', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#16352640', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value) => `${value / 1000}k€`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '1.5rem' }}
                labelStyle={{ fontWeight: 800, marginBottom: '0.5rem', color: '#163526' }}
              />
              <Area 
                type="monotone" 
                dataKey="ventes" 
                stroke="#163526" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorVentes)" 
              />
              <Area 
                type="monotone" 
                dataKey="depenses" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorDepenses)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Visitors & Security Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-[#163526]/5 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-headline text-xl text-[#163526]">Visiteurs Anonymes</h3>
            <span className="px-3 py-1 bg-green-500/10 text-green-600 text-[9px] font-bold uppercase rounded-full animate-pulse">Live</span>
          </div>
          <div className="space-y-4">
            {visitors.map(v => (
              <div key={v.id} className="flex items-center justify-between p-4 bg-[#faf9f4] rounded-xl border border-[#163526]/5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${v.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`}></div>
                  <span className="text-xs font-bold text-[#163526]">{v.pseudonym}</span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-[#163526]/40 uppercase tracking-widest">{v.page}</p>
                  <p className="text-[8px] text-[#163526]/20 font-bold uppercase">{v.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ExchangeRateWidget />
      </section>

      {/* Financial Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/backoffice/devis" className="bg-white p-8 rounded-2xl relative overflow-hidden group border border-[#163526]/5 shadow-sm hover:shadow-md transition-all">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[120px] text-[#163526]">request_quote</span>
          </div>
          <p className="font-label font-bold uppercase text-[10px] tracking-[0.2em] text-[#1b1c19]/40 mb-4">Devis en attente</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-4xl font-bold text-[#163526]">{dashboardData.cotationsEnAttente}</span>
            <span className="font-headline text-xl text-[#1b1c19]/60">devis</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-orange-500">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>À traiter</span>
          </div>
        </Link>

        <div className="bg-[#163526] p-8 rounded-2xl text-white relative shadow-xl overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-orange-500"></div>
          <p className="font-label font-bold uppercase text-[10px] tracking-[0.2em] text-white/40 mb-4">Trésorerie (Acomptes & Soldes)</p>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-white/40 font-bold uppercase">Acomptes:</span>
              <span className="font-headline text-3xl font-bold">{dashboardData.acomptes.toLocaleString()}</span>
              <span className="font-headline text-lg opacity-40">Ar</span>
            </div>
            <div className="flex items-baseline gap-2 border-t border-white/10 pt-4">
              <span className="text-[10px] text-white/40 font-bold uppercase">Soldes:</span>
              <span className="font-headline text-2xl font-bold text-orange-400">{dashboardData.soldes.toLocaleString()}</span>
              <span className="font-headline text-lg opacity-40">Ar</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-orange-400">
            <span className="material-symbols-outlined text-sm">payments</span>
            <span>PAIEMENT EN 2 TRANCHES ACTIF</span>
          </div>
        </div>

        <Link href="/backoffice/orders" className="bg-white p-8 rounded-2xl border border-[#163526]/5 shadow-sm hover:shadow-md transition-all group">
          <p className="font-label font-bold uppercase text-[10px] tracking-[0.2em] text-[#1b1c19]/40 mb-4">CA du mois</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-4xl font-bold text-[#163526]">{dashboardData.caMois.toLocaleString()}</span>
            <span className="font-headline text-xl text-[#1b1c19]/60">Ar</span>
          </div>
          <div className="mt-6 h-1.5 w-full bg-[#163526]/5 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-[68%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all group-hover:w-[72%]"></div>
          </div>
        </Link>
      </section>

      {/* Orders Table Section */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-2">
          <div>
            <h2 className="font-headline text-3xl text-[#163526]">Commandes Actives</h2>
            <p className="text-[#1b1c19]/40 text-xs font-bold uppercase tracking-widest mt-1">Flux de production en temps réel</p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <button 
              onClick={() => setFilterActive(!filterActive)}
              className={`px-6 py-3 font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-2 border transition-all shadow-sm ${
                filterActive ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-[#163526] border-[#163526]/10 hover:bg-[#163526]/5'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{filterActive ? 'filter_alt_off' : 'filter_list'}</span>
              {filterActive ? 'Filtres actifs' : 'Filtrer'}
            </button>
            <Link href="/backoffice/orders" className="px-6 py-3 bg-[#163526] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg hover:bg-[#163526]/90 transition-all">
              <span className="material-symbols-outlined text-sm text-orange-400">add_circle</span>
              Gérer les Commandes
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-[#163526]/5 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#163526]/5 border-b border-[#163526]/5">
                <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40">Client & Modèle</th>
                <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40">Statut</th>
                <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40">Progression</th>
                <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40 text-right">Alertes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#163526]/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center">
                      <span className="text-sm text-[#1b1c19]/40">Chargement...</span>
                    </td>
                  </tr>
                ) : commandes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center">
                      <span className="text-sm italic text-[#1b1c19]/40">Aucune commande pour le moment.</span>
                    </td>
                  </tr>
                ) : (
                  commandes.slice(0, 8).map((c: CommandeRow) => {
                    const enRetard = c.en_retard;
                    const pct = c.quantite && c.quantite > 0 ? Math.min(100, Math.round(((c.pieces_produites || 0) / c.quantite) * 100)) : 0;
                    return (
                      <tr key={c.id} className="hover:bg-[#163526]/[0.02] transition-colors group cursor-pointer" onClick={() => router.push(`/backoffice/orders?id=${c.id}`)}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#faf9f4] rounded-xl flex items-center justify-center border border-[#163526]/10 group-hover:scale-110 transition-transform">
                              <span className="material-symbols-outlined text-[#163526]">checkroom</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#163526]">{c.client_first_name || c.client_email || "Client"}</p>
                              <p className="text-[10px] text-[#1b1c19]/40 uppercase font-bold tracking-widest italic">{c.designation || "Sans désignation"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-full tracking-widest border ${
                            c.statut_production === "Livrée" ? "bg-green-50 text-green-700 border-green-100" :
                            enRetard ? "bg-red-50 text-red-600 border-red-100" :
                            "bg-[#163526]/10 text-[#163526] border-[#163526]/5"
                          }`}>{c.statut_production}</span>
                        </td>
                        <td className="px-8 py-6 w-1/3">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-[9px] font-bold uppercase text-[#1b1c19]/30 tracking-tighter">
                              <span>{c.pieces_produites} / {c.quantite} pièces</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-2 w-full bg-[#163526]/5 rounded-full flex overflow-hidden p-0.5">
                              <div className="h-full bg-[#163526] rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {enRetard ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest animate-pulse border border-red-100 shadow-sm">
                              <span className="material-symbols-outlined text-xs">warning</span>
                              En retard
                            </div>
                          ) : (
                            <span className="text-[#1b1c19]/30 text-[10px] font-bold uppercase tracking-widest">RAS</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
          </table>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 pb-10 md:pb-20">
        <div className="md:col-span-2 bg-[#163526] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 text-white flex justify-between items-center group overflow-hidden relative shadow-xl">
          <div className="relative z-10">
            <h3 className="font-headline text-3xl italic mb-4">Excellence Technique</h3>
            <p className="text-white/60 text-sm max-w-xs leading-relaxed">98.4% des commandes passent le contrôle qualité au premier essai ce mois-ci.</p>
            <Link href="/backoffice/production" className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 hover:text-white transition-all flex items-center gap-2">
              Suivi de Production <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
            <span className="material-symbols-outlined text-[240px]">workspace_premium</span>
          </div>
        </div>
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 flex flex-col justify-between border border-[#163526]/5 shadow-sm group">
          <span className="material-symbols-outlined text-orange-500 text-4xl group-hover:scale-110 transition-transform">notifications_active</span>
          <div>
            <p className="text-5xl font-headline font-bold text-[#163526]">03</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c19]/40 mt-2">Alertes de production</p>
          </div>
        </div>
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 flex flex-col justify-between border border-[#163526]/5 shadow-sm">
          <div className="flex -space-x-3 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-[#163526]/10 flex items-center justify-center text-[10px] font-bold text-[#163526]">OP</div>
            ))}
            <div className="w-10 h-10 rounded-full border-4 border-white bg-orange-500 flex items-center justify-center text-[10px] text-white font-bold shadow-md">+8</div>
          </div>
          <div>
            <p className="text-2xl font-headline font-bold text-[#163526]">Atelier Actif</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c19]/40 mt-1">12 Opérateurs connectés</p>
          </div>
        </div>
      </section>
    </div>
  );
}
