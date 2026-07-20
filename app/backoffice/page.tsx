"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";

const data = [
  { name: "Jan", ventes: 45000, depenses: 32000 },
  { name: "Fév", ventes: 52000, depenses: 35000 },
  { name: "Mar", ventes: 48000, depenses: 31000 },
  { name: "Avr", ventes: 61000, depenses: 42000 },
  { name: "Mai", ventes: 55000, depenses: 38000 },
  { name: "Juin", ventes: 67000, depenses: 45000 },
];

export default function AdminDashboardPage() {
  const [filterActive, setFilterActive] = useState(false);
  const [visitors, setVisitors] = useState<any[]>([]);

  useEffect(() => {
    setVisitors([]);
  }, []);

  return (
    <div className="px-12 py-10 space-y-12">
      {/* Financial Overview with Chart */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-[#163526]/5 shadow-sm space-y-8">
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
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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

        <div className="bg-white p-8 rounded-[2rem] border border-[#163526]/5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-xl text-[#163526] mb-2">Sécurité du Portail</h3>
            <p className="text-xs text-[#163526]/40 font-bold uppercase tracking-widest">Surveillance des accès directs</p>
          </div>
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-green-500 text-5xl mb-4">verified_user</span>
            <p className="text-sm font-bold text-[#163526]">Système d'obfuscation actif</p>
            <p className="text-[10px] text-[#163526]/40 uppercase font-bold mt-1">Lien legacy /admin protégé</p>
          </div>
          <button 
            onClick={() => alert("Génération d'un nouveau lien sécurisé...")}
            className="w-full py-4 border border-[#163526]/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#163526]/5 transition-all"
          >
            Changer l'URL sécurisée
          </button>
        </div>
      </section>

      {/* Financial Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/backoffice/devis" className="bg-white p-8 rounded-2xl relative overflow-hidden group border border-[#163526]/5 shadow-sm hover:shadow-md transition-all">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[120px] text-[#163526]">request_quote</span>
          </div>
          <p className="font-label font-bold uppercase text-[10px] tracking-[0.2em] text-[#1b1c19]/40 mb-4">Devis en attente</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-4xl font-bold text-[#163526]">142.800</span>
            <span className="font-headline text-xl text-[#1b1c19]/60">€</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-orange-500">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+12% vs MOIS DERNIER</span>
          </div>
        </Link>

        <div className="bg-[#163526] p-8 rounded-2xl text-white relative shadow-xl overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-orange-500"></div>
          <p className="font-label font-bold uppercase text-[10px] tracking-[0.2em] text-white/40 mb-4">Trésorerie (Acomptes & Soldes)</p>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-white/40 font-bold uppercase">Acomptes:</span>
              <span className="font-headline text-3xl font-bold">54.210</span>
              <span className="font-headline text-lg opacity-40">€</span>
            </div>
            <div className="flex items-baseline gap-2 border-t border-white/10 pt-4">
              <span className="text-[10px] text-white/40 font-bold uppercase">Soldes:</span>
              <span className="font-headline text-2xl font-bold text-orange-400">28.150</span>
              <span className="font-headline text-lg opacity-40">€</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-orange-400">
            <span className="material-symbols-outlined text-sm">payments</span>
            <span>PAIEMENT EN 2 TRANCHES ACTIF</span>
          </div>
        </div>

        <Link href="/backoffice/production" className="bg-white p-8 rounded-2xl border border-[#163526]/5 shadow-sm hover:shadow-md transition-all group">
          <p className="font-label font-bold uppercase text-[10px] tracking-[0.2em] text-[#1b1c19]/40 mb-4">Marge estimée globale</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-4xl font-bold text-[#163526]">32.4</span>
            <span className="font-headline text-xl text-[#1b1c19]/60">%</span>
          </div>
          <div className="mt-6 h-1.5 w-full bg-[#163526]/5 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-[68%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all group-hover:w-[72%]"></div>
          </div>
        </Link>
      </section>

      {/* Orders Table Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div>
            <h2 className="font-headline text-3xl text-[#163526]">Commandes Actives</h2>
            <p className="text-[#1b1c19]/40 text-xs font-bold uppercase tracking-widest mt-1">Flux de production en temps réel</p>
          </div>
          <div className="flex gap-3">
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

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#163526]/5">
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
              <tr className="hover:bg-[#163526]/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#faf9f4] rounded-xl flex items-center justify-center border border-[#163526]/10 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[#163526]">apparel</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#163526]">Maison Haussmann</p>
                      <p className="text-[10px] text-[#1b1c19]/40 uppercase font-bold tracking-widest italic">Veste Laine "Hiver 24"</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-4 py-1.5 bg-[#163526]/10 text-[#163526] text-[10px] font-bold uppercase rounded-full tracking-widest border border-[#163526]/5">Production</span>
                </td>
                <td className="px-8 py-6 w-1/3">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-[#1b1c19]/30 tracking-tighter">
                      <span>Pré-Prod</span>
                      <span>Prod</span>
                      <span>Finition</span>
                    </div>
                    <div className="h-2 w-full bg-[#163526]/5 rounded-full flex overflow-hidden p-0.5">
                      <div className="h-full bg-[#163526] w-1/3 rounded-full mr-0.5"></div>
                      <div className="h-full bg-[#163526] w-1/3 opacity-40 rounded-full"></div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="text-[#1b1c19]/30 text-[10px] font-bold uppercase tracking-widest">RAS</span>
                </td>
              </tr>
              <tr className="hover:bg-[#163526]/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#faf9f4] rounded-xl flex items-center justify-center border border-[#163526]/10 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[#163526]">styler</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#163526]">Atelier Granville</p>
                      <p className="text-[10px] text-[#1b1c19]/40 uppercase font-bold tracking-widest italic">Robe Soie "Capucine"</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-4 py-1.5 bg-orange-500/10 text-orange-600 text-[10px] font-bold uppercase rounded-full tracking-widest border border-orange-500/10">Prêt</span>
                </td>
                <td className="px-8 py-6 w-1/3">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-[#1b1c19]/30 tracking-tighter">
                      <span>Pré-Prod</span>
                      <span>Prod</span>
                      <span>Finition</span>
                    </div>
                    <div className="h-2 w-full bg-[#163526]/5 rounded-full flex overflow-hidden p-0.5">
                      <div className="h-full bg-[#163526] w-1/3 rounded-full mr-0.5"></div>
                      <div className="h-full bg-[#163526] w-1/3 rounded-full mr-0.5"></div>
                      <div className="h-full bg-[#163526] w-1/3 opacity-20 rounded-full"></div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest animate-pulse border border-red-100 shadow-sm">
                    <span className="material-symbols-outlined text-xs">warning</span>
                    Paiement en attente
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-20">
        <div className="md:col-span-2 bg-[#163526] rounded-[2rem] p-10 text-white flex justify-between items-center group overflow-hidden relative shadow-xl">
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
        <div className="bg-white rounded-[2rem] p-10 flex flex-col justify-between border border-[#163526]/5 shadow-sm group">
          <span className="material-symbols-outlined text-orange-500 text-4xl group-hover:scale-110 transition-transform">notifications_active</span>
          <div>
            <p className="text-5xl font-headline font-bold text-[#163526]">03</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c19]/40 mt-2">Alertes de production</p>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-10 flex flex-col justify-between border border-[#163526]/5 shadow-sm">
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
