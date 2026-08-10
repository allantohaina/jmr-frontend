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
    case "needs_info": return "À préciser";
    case "sent": return "Devis envoyé";
    case "accepted": return "Accepté";
    case "production": return "En production";
    case "rejected": return "Refusé";
    default: return s ?? "Nouveau";
  }
}

function confirmationCountdown(deadline?: string | null): { text: string; expired: boolean; urgent: boolean } | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { text: "Délai expiré", expired: true, urgent: false };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return { text: `${days}j ${hours}h restants`, expired: false, urgent: days <= 2 };
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { text: `${hours}h ${minutes}min restants`, expired: false, urgent: true };
}

function quoteReference(quote: QuoteRecord) {
  return `Demande #${String(quote.id).padStart(5, "0")}`;
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
        if (qRes) setQuotes(Array.isArray(qRes.data) ? qRes.data : (qRes.data?.data ?? []));
        if (cRes) setCommandes(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data ?? []));
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
  const pendingQuotes = quotes.filter((q) => q.status === "pending" || q.status === "draft" || q.status === "needs_info");
  const latestPendingQuote = [...pendingQuotes].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
  )[0];
  const alertCount = quotes.filter((q) => q.status === "sent" || q.status === "production" || q.status === "needs_info").length;

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
        ? `Dernier le ${formatDate(latestPendingQuote?.created_at ?? "")}`
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
              {latestPendingQuote && (
                <section
                  className="relative overflow-hidden border border-[#e5ad46]/20 bg-[#202b35] px-6 py-7 shadow-[0_24px_60px_rgba(12,18,25,0.18)] md:px-10 md:py-9"
                  aria-labelledby="quote-pending-title"
                >
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_82%_38%,rgba(229,173,70,0.13),transparent_56%)]" />
                  <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-xl">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center border border-[#e5ad46]/30 bg-[#e5ad46]/10 text-[#e5ad46]">
                          <span className="material-symbols-outlined text-[19px]">mark_email_unread</span>
                        </span>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#e5ad46]">Demande en attente</p>
                      </div>
                      <h2 id="quote-pending-title" className="font-headline text-3xl font-bold leading-tight text-[#f1bd58] md:text-4xl">
                        Votre demande a bien été reçue.
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-[#eccc90]/65">
                        {quoteReference(latestPendingQuote)}{latestPendingQuote.name ? ` — ${latestPendingQuote.name}` : ""} envoyée le {formatDate(latestPendingQuote.created_at ?? "")}.
                        Notre équipe vous répondra sous <span className="font-bold text-[#eccc90]">2 à 3 jours ouvrés</span>.
                      </p>
                    </div>

                    <ol className="quote-progress-grid grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-3" aria-label="Suivi de votre demande de devis">
                      <li className="quote-progress-step quote-progress-step--done">
                        <span className="quote-progress-marker" aria-hidden="true"><span className="material-symbols-outlined text-[16px]">check</span></span>
                        <span className="quote-progress-line" aria-hidden="true" />
                        <p>Demande reçue</p>
                        <small>Terminée</small>
                      </li>
                      <li className="quote-progress-step quote-progress-step--current">
                        <span className="quote-progress-marker" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-[#25303a]" /></span>
                        <span className="quote-progress-line" aria-hidden="true" />
                        <p>Analyse par notre équipe</p>
                        <small>En cours</small>
                      </li>
                      <li className="quote-progress-step">
                        <span className="quote-progress-marker" aria-hidden="true" />
                        <p>Devis envoyé</p>
                        <small>À venir</small>
                      </li>
                    </ol>
                  </div>
                </section>
              )}

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
                            className="group p-6 md:p-8 transition-colors hover:bg-[#e5ad46]/[0.025] flex flex-col md:flex-row justify-between gap-4"
                          >
                            <div className="space-y-2 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] bg-[#e5ad46]/10 px-3 py-1 rounded-full">
                                  {q.name ?? "Client"}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                                  q.status === "production" || q.status === "accepted"
                                    ? "bg-[#e5ad46] text-white"
                                    : q.status === "needs_info"
                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                    : "bg-[#e5ad46]/5 text-[#e5ad46]"
                                }`}>
                                  {quoteStatusLabel(q.status)}
                                </span>
                              </div>
                              <p className="text-sm text-[#e5ad46]/60 leading-relaxed line-clamp-2">{q.message}</p>
                              {q.status === "sent" && (() => {
                                const cd = confirmationCountdown(q.confirmation_deadline);
                                if (!cd) return null;
                                return (
                                  <p className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${cd.expired ? "text-red-400" : cd.urgent ? "text-orange-400 animate-pulse" : "text-[#e5ad46]/60"}`}>
                                    {cd.expired ? "Délai de confirmation expiré" : `Confirmer dans ${cd.text}`}
                                  </p>
                                );
                              })()}
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="text-lg font-headline font-bold text-[#e5ad46]">{q.amount ? `${Number(q.amount).toLocaleString("fr-FR")} Ar` : "-"}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedQuote(q)}
                                className="inline-flex items-center gap-2 border border-[#e5ad46]/25 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#e5ad46] transition-colors hover:bg-[#e5ad46] hover:text-[#25303a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e5ad46]"
                                aria-label={`Voir le détail de ${quoteReference(q)}`}
                              >
                                Détail
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                              </button>
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
                        {quotes.filter((q) => q.status === "sent" || q.status === "production" || q.status === "needs_info").slice(0, 10).map((q) => (
                          <div key={q.id} className="p-6 md:p-8 flex items-start gap-4">
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                              q.status === "production" ? "bg-orange-500 animate-pulse" : q.status === "needs_info" ? "bg-yellow-400 animate-pulse" : "bg-[#e5ad46]"
                            }`} />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[#e5ad46]">
                                {q.status === "production" ? "En production" : q.status === "needs_info" ? "À préciser" : "Devis envoyé"}
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
        {selectedQuote && (
          <div className="fixed inset-0 z-50 flex items-end bg-[#111a22]/80 p-4 backdrop-blur-sm sm:items-center sm:justify-center" role="presentation">
            <section
              className="w-full max-w-xl border border-[#e5ad46]/25 bg-[#25303a] p-6 shadow-2xl sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby="quote-dialog-title"
            >
              <div className="flex items-start justify-between gap-5 border-b border-[#e5ad46]/10 pb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e5ad46]">Détail de la demande</p>
                  <h2 id="quote-dialog-title" className="mt-2 font-headline text-3xl font-bold text-[#eccc90]">{quoteReference(selectedQuote)}</h2>
                </div>
                <button type="button" onClick={() => setSelectedQuote(null)} className="text-[#e5ad46]/70 transition-colors hover:text-[#e5ad46] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e5ad46]" aria-label="Fermer le détail">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e5ad46]/50">Statut</dt>
                  <dd className="mt-1 text-sm font-bold text-[#eccc90]">{quoteStatusLabel(selectedQuote.status)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e5ad46]/50">Demande</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#eccc90]/70">{selectedQuote.message || "Aucun détail complémentaire."}</dd>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e5ad46]/50">Envoyée le</dt>
                    <dd className="mt-1 text-sm text-[#eccc90]/70">{formatDate(selectedQuote.created_at ?? "")}</dd>
                  </div>
                  {selectedQuote.amount && <div><dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e5ad46]/50">Montant</dt><dd className="mt-1 text-sm text-[#eccc90]/70">{Number(selectedQuote.amount).toLocaleString("fr-FR")} Ar</dd></div>}
                  {selectedQuote.date_livraison_prevue && <div><dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e5ad46]/50">Livraison prévue</dt><dd className="mt-1 text-sm text-[#eccc90]/70">{formatDate(selectedQuote.date_livraison_prevue)}</dd></div>}
                </div>
                {selectedQuote.status === "sent" && (() => {
                  const cd = confirmationCountdown(selectedQuote.confirmation_deadline);
                  const isExpired = cd?.expired;
                  return (
                    <div className="mt-6 border-t border-[#e5ad46]/10 pt-6 space-y-4">
                      {cd && (
                        <p className={`text-xs font-bold uppercase tracking-widest ${isExpired ? "text-red-400" : cd.urgent ? "text-orange-400" : "text-[#e5ad46]/60"}`}>
                          {isExpired ? "Le délai de confirmation a expiré" : `Délai de confirmation : ${cd.text}`}
                        </p>
                      )}
                      {!isExpired && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm("Confirmer ce devis ? Cette action est irréversible.")) return;
                            try {
                              await authAPI.post(`/quotes/${selectedQuote.id}/confirm`, {});
                              window.location.reload();
                            } catch { alert("Erreur lors de la confirmation."); }
                          }}
                          className="w-full py-3 bg-[#e5ad46] text-[#25303a] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#eccc90] transition-all shadow-lg shadow-[#e5ad46]/20"
                        >
                          Confirmer le devis
                        </button>
                      )}
                    </div>
                  );
                })()}
              </dl>
            </section>
          </div>
        )}
        <style jsx>{`
          .quote-progress-step {
            position: relative;
            min-width: 0;
            color: rgba(236, 204, 144, 0.42);
          }

          .quote-progress-marker {
            position: relative;
            z-index: 1;
            display: flex;
            width: 2rem;
            height: 2rem;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(229, 173, 70, 0.2);
            border-radius: 999px;
            background: #202b35;
          }

          .quote-progress-step p {
            margin-top: 0.8rem;
            color: inherit;
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            line-height: 1.35;
          }

          .quote-progress-step small {
            display: block;
            margin-top: 0.25rem;
            color: rgba(236, 204, 144, 0.32);
            font-size: 0.6rem;
            font-weight: 700;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          .quote-progress-step--done,
          .quote-progress-step--current {
            color: #eccc90;
          }

          .quote-progress-step--done .quote-progress-marker {
            border-color: #e5ad46;
            background: #e5ad46;
            color: #25303a;
            box-shadow: 0 0 0 0 rgba(229, 173, 70, 0.52);
            animation: quote-complete-pulse 2.8s ease-out infinite;
          }

          .quote-progress-step--current .quote-progress-marker {
            border-color: #e5ad46;
            background: #e5ad46;
            animation: quote-current-breathe 2.2s ease-in-out infinite;
          }

          .quote-progress-step--done small,
          .quote-progress-step--current small {
            color: rgba(236, 204, 144, 0.68);
          }

          .quote-progress-line {
            position: absolute;
            top: 1rem;
            left: 2rem;
            right: -0.8rem;
            height: 1px;
            background: rgba(229, 173, 70, 0.15);
          }

          .quote-progress-step--done .quote-progress-line {
            background: #e5ad46;
          }

          @keyframes quote-complete-pulse {
            0%, 42% { box-shadow: 0 0 0 0 rgba(229, 173, 70, 0.48); }
            72%, 100% { box-shadow: 0 0 0 9px rgba(229, 173, 70, 0); }
          }

          @keyframes quote-current-breathe {
            0%, 100% { box-shadow: 0 0 0 3px rgba(229, 173, 70, 0.08); }
            50% { box-shadow: 0 0 0 7px rgba(229, 173, 70, 0.18); }
          }

          @media (max-width: 639px) {
            .quote-progress-grid { padding-left: 0.15rem; row-gap: 0; }
            .quote-progress-step { display: grid; grid-template-columns: 2rem minmax(0, 1fr); column-gap: 0.85rem; }
            .quote-progress-step p { margin-top: 0.1rem; }
            .quote-progress-step small { grid-column: 2; margin-top: -0.75rem; }
            .quote-progress-line { top: 2rem; bottom: 0; left: 1rem; right: auto; width: 1px; height: auto; }
          }

          @media (prefers-reduced-motion: reduce) {
            .quote-progress-step--done .quote-progress-marker,
            .quote-progress-step--current .quote-progress-marker { animation: none; }
          }
        `}</style>
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
