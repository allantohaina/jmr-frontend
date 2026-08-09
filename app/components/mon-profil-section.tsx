"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/app/lib";
import { authAPI, type QuoteRecord, type CommandeRecord } from "@/app/lib";
import { getErrorMessage } from "@/app/lib/errors";

type ProfileCard = {
  title: string;
  description: string;
};

type MonProfilSectionProps = {
  variant?: "preview" | "dashboard";
  user?: UserProfile | null;
};

const PROFILE_ITEMS: ProfileCard[] = [
  {
    title: "Gardez vos coordonnees pretes pour chaque demande",
    description: "Retrouvez vos contacts, adresses et informations de facturation sans tout ressaisir.",
  },
  {
    title: "Retrouvez toutes vos commandes en un coup d'oeil",
    description: "Visualisez vos devis, commandes en cours et prochaines etapes depuis le meme espace.",
  },
  {
    title: "Recevez les alertes utiles au bon moment",
    description: "Soyez prevenu des qu'un devis arrive, qu'un document est depose ou qu'une etape change.",
  },
];



function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return d; }
}

function quoteStatusLabel(s?: string | null) {
  switch (s) {
    case "pending": return "En attente";
    case "draft": return "Brouillon";
    case "sent": return "Devis envoyé";
    case "accepted": return "Accepté";
    case "production": return "En production";
    case "rejected": return "Refusé";
    default: return s ?? "Nouveau";
  }
}

export function MonProfilSection({ variant = "preview", user }: MonProfilSectionProps) {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [commandes, setCommandes] = useState<CommandeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecord | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [qRes, cRes] = await Promise.all([
          authAPI.get<{ data: QuoteRecord[]; total: number }>("/quotes").catch(() => null),
          authAPI.get<{ data: CommandeRecord[] }>("/commandes").catch(() => null),
        ]);
        if (!active) return;
        if (qRes) setQuotes(qRes.data.data ?? []);
        if (cRes) setCommandes(cRes.data.data ?? []);
      } catch (e) {
        if (active) setError(getErrorMessage(e));
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const activeCommandes = commandes.filter((c) => c.statut_production !== "Livrée");
  const pendingQuotes = quotes.filter((q) => q.status === "pending" || q.status === "draft");
  const alertCount = quotes.filter((q) => q.status === "sent" || q.status === "production").length;

  const stats = [
    {
      label: "Commandes en cours",
      value: String(activeCommandes.length).padStart(2, "0"),
      detail: activeCommandes.length > 0
        ? `${activeCommandes[0].numero} - ${activeCommandes[0].statut_production}`
        : "Aucune commande active",
      icon: "conveyor_belt",
    },
    {
      label: "Devis en attente",
      value: String(pendingQuotes.length).padStart(2, "0"),
      detail: pendingQuotes.length > 0
        ? `Dernier le ${formatDate(pendingQuotes[0].created_at ?? "")}`
        : "Aucun devis en attente",
      icon: "request_quote",
    },
    {
      label: "Notifications",
      value: String(alertCount).padStart(2, "0"),
      detail: alertCount > 0
        ? `${alertCount} devis nécessitant votre attention`
        : "Aucune notification",
      icon: "notifications_active",
    },
  ];

  const recentItems = [
    ...quotes.map((q) => ({ type: "quote" as const, date: q.created_at ?? "", label: "Nouveau devis", detail: `${q.name} - ${q.message?.slice(0, 80)}` })),
    ...commandes.map((c) => ({ type: "commande" as const, date: c.date_commande ?? "", label: "Commande passée", detail: `${c.numero} - ${c.designation ?? ""}` })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  if (variant === "dashboard") {
    const hasData = !isLoading && (quotes.length > 0 || commandes.length > 0);

    return (
      <section className="min-h-screen bg-[#25303a] pb-24">
        <div className="bg-[#25303a] border-b border-[#e5ad46]/5 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Espace Personnel</p>
                <h1 className="font-headline text-5xl text-[#e5ad46] font-bold tracking-tight leading-none mb-3">Tableau de bord</h1>
                <p className="text-[#e5ad46]/50 text-sm font-medium">Bienvenue, <span className="text-[#e5ad46] font-bold">{user?.first_name} {user?.last_name}</span></p>
              </div>
              <div className="bg-[#e5ad46]/5 px-6 py-3 rounded-full border border-[#e5ad46]/10">
                <p className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e5ad46]"></span>
                  Statut : {user?.role === 'admin' ? 'Administrateur' : user?.role === 'worker' ? 'Artisan Atelier' : 'Client Privilégié'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400 text-sm" role="alert">
              {error}
            </div>
          )}

          {!hasData && !isLoading ? (
            /* Empty state — no devis yet */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-[#e5ad46]/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-[#e5ad46]">description</span>
              </div>
              <h2 className="font-headline text-3xl text-[#e5ad46] font-bold mb-3">Pas encore de demande</h2>
              <p className="text-[#e5ad46]/50 text-sm max-w-md mb-8">
                Vous n&apos;avez pas encore soumis de demande de devis. Commencez dès maintenant pour suivre vos projets textile.
              </p>
              <Link
                href="/demande-devis"
                className="px-8 py-4 bg-[#e5ad46] text-[#1e2a38] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#eccc90] transition-all shadow-lg shadow-[#e5ad46]/20"
              >
                Faire un devis
              </Link>
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((metric, idx) => (
                  <div className="bg-[#25303a] p-8 rounded-[2rem] border border-[#e5ad46]/5 shadow-sm hover:shadow-md transition-all group" key={idx}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-[#e5ad46]/5 rounded-2xl flex items-center justify-center text-[#e5ad46] group-hover:bg-[#e5ad46] group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">{metric.icon}</span>
                      </div>
                      <span className="text-4xl font-headline font-bold text-[#e5ad46]">
                        {isLoading ? ".." : metric.value}
                      </span>
                    </div>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e5ad46] mb-2">{metric.label}</h3>
                    <p className="text-[#e5ad46]/50 text-xs leading-relaxed">{metric.detail}</p>
                  </div>
                ))}
              </div>

              {/* Main Dashboard Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left & Center: Quotes & Alerts */}
                <div className="lg:col-span-2 space-y-10">
                  {/* Devis Section */}
                  <div className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 shadow-sm overflow-hidden">
                    <div className="px-10 py-8 border-b border-[#e5ad46]/5 flex justify-between items-center">
                      <h2 className="font-headline text-2xl text-[#e5ad46] font-bold">Mes devis</h2>
                      <Link href="/demande-devis" className="text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] hover:underline">
                        Nouveau devis
                      </Link>
                    </div>
                    <div className="divide-y divide-[#e5ad46]/5">
                      {isLoading ? (
                        <div className="p-10 text-center text-[#e5ad46]/40 text-sm">Chargement...</div>
                      ) : quotes.length === 0 ? (
                        <div className="p-10 text-center">
                          <p className="text-[#e5ad46]/40 text-sm mb-4">Aucun devis pour le moment</p>
                          <Link href="/demande-devis" className="inline-block px-6 py-3 bg-[#e5ad46] text-[#1e2a38] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#eccc90] transition-all">
                            Faire une demande
                          </Link>
                        </div>
                      ) : (
                        quotes.slice(0, 5).map((q) => (
                          <div
                            key={q.id}
                            onClick={() => setSelectedQuote(q)}
                            className="group p-6 md:p-8 hover:bg-[#25303a] transition-all cursor-pointer flex flex-col md:flex-row justify-between gap-4"
                          >
                            <div className="space-y-2 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] bg-[#e5ad46]/10 px-3 py-1 rounded-full">
                                  {q.name ?? "Client"}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                                  q.status === "production" || q.status === "accepted"
                                    ? "bg-[#e5ad46] text-white" : "bg-[#e5ad46]/5 text-[#e5ad46]"
                                }`}>
                                  {quoteStatusLabel(q.status)}
                                </span>
                              </div>
                              <p className="text-sm text-[#e5ad46]/60 leading-relaxed line-clamp-2">{q.message}</p>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="text-lg font-headline font-bold text-[#e5ad46]">{q.amount ? `${Number(q.amount).toLocaleString("fr-FR")} Ar` : "-"}</span>
                              <div className="w-8 h-8 bg-[#e5ad46]/5 rounded-full flex items-center justify-center text-[#e5ad46] group-hover:bg-[#e5ad46] group-hover:text-white transition-all">
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Alerts Section */}
                  <div className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 shadow-sm overflow-hidden">
                    <div className="px-10 py-8 border-b border-[#e5ad46]/5">
                      <h2 className="font-headline text-2xl text-[#e5ad46] font-bold">Dernières alertes</h2>
                    </div>
                    {isLoading ? (
                      <div className="p-10 text-center text-[#e5ad46]/40 text-sm">Chargement...</div>
                    ) : alertCount === 0 ? (
                      <div className="p-10 text-center">
                        <p className="text-[#e5ad46]/40 text-sm">Aucune alerte pour le moment</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#e5ad46]/5">
                        {quotes.filter((q) => q.status === "sent" || q.status === "production").slice(0, 10).map((q) => (
                          <div key={q.id} className="p-6 md:p-8 flex items-start gap-4">
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                              q.status === "production" ? "bg-orange-500 animate-pulse" : "bg-[#e5ad46]"
                            }`} />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[#e5ad46]">
                                {q.status === "production" ? "En production" : "Devis envoyé"}
                              </p>
                              <p className="text-xs text-[#e5ad46]/50 mt-1">
                                {q.name} — {q.message?.slice(0, 100)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Activity & Documents */}
                <div className="space-y-10">
                  {/* Activité */}
                  <div className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 shadow-sm p-10">
                    <h2 className="font-headline text-2xl text-[#e5ad46] font-bold mb-8">Activité</h2>
                    {isLoading ? (
                      <p className="text-[#e5ad46]/40 text-sm">Chargement...</p>
                    ) : recentItems.length === 0 ? (
                      <p className="text-[#e5ad46]/40 text-sm">Aucune activité récente</p>
                    ) : (
                      <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#e5ad46]/10">
                        {recentItems.slice(0, 8).map((item, idx) => (
                          <div className="relative pl-10" key={idx}>
                            <div className="absolute left-0 top-1.5 w-[23px] h-[23px] bg-[#25303a] border-2 border-[#e5ad46] rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-[#e5ad46] rounded-full"></div>
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#e5ad46]/30 mb-1">{formatDate(item.date)}</p>
                            <h4 className="text-sm font-bold text-[#e5ad46] mb-1">{item.label}</h4>
                            <p className="text-xs text-[#e5ad46]/60 leading-relaxed line-clamp-2">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  <div className="bg-[#1e2a38] rounded-[2.5rem] p-10 text-[#e5ad46] shadow-xl border border-[#e5ad46]/10">
                    <h2 className="font-headline text-2xl font-bold mb-8">Documents</h2>
                    <p className="text-[#e5ad46]/40 text-sm">Aucun document pour le moment</p>
                    <button className="w-full mt-8 py-4 bg-[#25303a]/20 text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl border border-[#e5ad46]/10 hover:bg-[#25303a]/40 transition-all opacity-50 cursor-not-allowed">
                      Accéder aux archives
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page ui-section-shell" aria-labelledby="profile-preview-title">
      <header className="profile-page__header ui-section-header">
        <h1 className="ui-section-title" id="profile-preview-title">
          Mon espace client
        </h1>
        <span className="profile-page__underline ui-section-underline" aria-hidden="true" />
        <p className="profile-page__lead">
          Un acces unique pour centraliser vos echanges, documents techniques et le suivi de vos
          productions textile.
        </p>
      </header>

      <div className="profile-page__panel ui-panel-shell">
        <div className="profile-page__cards">
          {PROFILE_ITEMS.map((item, idx) => (
            <article
              className="profile-page__card ui-soft-card"
              key={idx}
              data-reveal
              style={{ transitionDelay: `${idx * 80 + 100}ms` }}
            >
              <div className="profile-page__card-icon" aria-hidden="true">
                <Image src="/bulle_de_compte.svg" alt="" width={100} height={100} />
              </div>
              <h2 className="profile-page__card-title">{item.title}</h2>
              <p className="profile-page__card-description">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="profile-page__cta" data-reveal style={{ transitionDelay: "350ms" }}>
          <Link className="profile-page__action" href="/mon-profil">
            Acceder a mon espace
          </Link>
        </div>
      </div>
    </section>
  );
}
