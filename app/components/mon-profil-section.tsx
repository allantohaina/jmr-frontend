"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/app/lib";
import { authAPI, notificationsAPI, type QuoteRecord, type CommandeRecord, type NotificationRecord } from "@/app/lib";
import { getErrorMessage } from "@/app/lib/errors";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import { useToast } from "@/app/components/toast-provider";
import BrouillonsClient from "@/app/components/brouillons-client";

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

const STATUS_DOT: Record<string, string> = {
  accepted: "#5cb87d",
  production: "#5c9ad9",
  completed: "#5cb87d",
  pending: "#EAA100",
  draft: "#8B94A3",
  sent: "#8b7bd4",
  needs_info: "#EAA100",
  rejected: "#e08b52",
};

const STATUS_PCT: Record<string, number> = {
  draft: 5,
  pending: 33,
  sent: 50,
  needs_info: 45,
  accepted: 67,
  production: 85,
  completed: 100,
  rejected: 100,
};

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

function quoteShortId(id: string | number) {
  return String(id).substring(0, 8).toUpperCase();
}

function quoteQuantity(q: QuoteRecord | CommandeRecord | null | undefined): string | null {
  const raw = (q as { quantite?: unknown } | null | undefined)?.quantite;
  if (raw === null || raw === undefined || raw === "") return null;
  const text = String(raw);
  return /pi[eè]ces?/i.test(text) ? text : `${text} pièces`;
}

type ClientDocument = {
  id: string;
  label: string;
  detail: string;
  date?: string;
  href?: string;
  kind: "pdf" | "devis" | "commande";
};

function quoteFiles(quote: QuoteRecord): Array<{ name: string; url: string; type: string }> {
  if (Array.isArray(quote.files)) return quote.files;
  if (typeof quote.files !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(quote.files);
    return Array.isArray(parsed) ? parsed.filter((file): file is { name: string; url: string; type: string } =>
      typeof file === "object" && file !== null && typeof file.name === "string" && typeof file.url === "string",
    ) : [];
  } catch {
    return [];
  }
}

const globalStyles = `
:root{
  --bg:#1e2a38;
  --card:#161D30;
  --card-border:rgba(234, 161, 0,0.12);
  --input-bg:#1E2A38;
  --gold:#EAA100;
  --gold-light:#EAA100;
  --gold-dim:rgba(234, 161, 0,0.4);
  --text-cream:#FFF8EC;
  --text-muted:rgba(234, 161, 0,0.6);
  --text-faint:rgba(234, 161, 0,0.35);
  --warn:#e08b52;
  --warn-bg:rgba(224,139,82,0.09);
  --good:#5cb87d;
  --good-bg:rgba(92,184,125,0.09);
  --font-serif:var(--font-brand),var(--font-noto-serif),Georgia,serif;
  --font-mono:var(--font-jbmono),'IBM Plex Mono',monospace;
  --font-body:var(--font-inter),var(--font-ibm-plex-sans),system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--text-cream);font-family:var(--font-body);-webkit-font-smoothing:antialiased;}

.db-container{max-width:1100px;margin:0 auto;padding:0 40px;}
@media(max-width:760px){.db-container{padding:0 20px;}}

/* Tête de page */
.page-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:32px;}
.eyebrow{color:var(--gold);text-transform:uppercase;letter-spacing:.22em;font-size:10px;font-weight:700;display:flex;gap:12px;align-items:center;margin-bottom:10px;}
.eyebrow span{width:20px;height:1px;background:var(--gold);display:inline-block;}
.page-heading h1{font-family:var(--font-serif);font-weight:500;font-size:34px;margin:0;color:var(--text-cream);letter-spacing:-.5px;}
.page-heading p{margin:4px 0 0;color:var(--text-muted);font-size:13px;}
.primary-button{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#1B2436;border:0;border-radius:8px;padding:12px 19px;font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;cursor:pointer;text-decoration:none;transition:.2s;white-space:nowrap;}
.primary-button:hover{filter:brightness(1.07);transform:translateY(-2px);box-shadow:0 8px 24px rgba(234,161,0,.25);}
.primary-button svg{width:16px;height:16px;}
.outline-button{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#1B2436;border:0;border-radius:8px;padding:10px 14px;font-size:9px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;cursor:pointer;text-decoration:none;transition:.2s;white-space:nowrap;}
.outline-button:hover{filter:brightness(1.07);}
.outline-button svg{width:15px;height:15px;}

/* Bandeau demande en attente */
.request-banner{border:1px solid var(--card-border);background:var(--card);border-radius:10px;padding:23px 25px;display:flex;align-items:flex-start;gap:17px;position:relative;overflow:hidden;margin-bottom:25px;}
.request-banner::after{content:"";position:absolute;right:-60px;top:-90px;width:220px;height:220px;border:1px solid rgba(234,161,0,.14);border-radius:50%;pointer-events:none;}
.banner-icon{background:rgba(234,161,0,.1);color:var(--gold);border-radius:8px;padding:9px;display:flex;flex:none;}
.banner-icon svg{width:17px;height:17px;}
.request-banner h2{font-family:var(--font-serif);font-weight:500;font-size:18px;margin:12px 0 7px;color:var(--text-cream);}
.request-banner p{color:var(--text-muted);font-size:11px;margin:0;line-height:1.6;}
.request-banner p b{color:var(--text-cream);}
.request-banner strong{color:var(--gold);font-weight:400;}
.banner-progress{margin-left:auto;display:flex;gap:4px;padding-top:5px;flex:none;}
.banner-progress span{height:4px;width:23px;background:var(--gold);border-radius:3px;opacity:.9;}
.banner-progress span:nth-child(2){opacity:.45;}
.banner-progress span:nth-child(3){opacity:.2;}

/* Cartes de stats */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:0 0 27px;}
@media(max-width:800px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
.stat-card{border:1px solid var(--card-border);background:var(--card);border-radius:9px;min-height:88px;padding:18px;display:flex;align-items:center;gap:14px;}
.stat-icon{background:rgba(234,161,0,.1);color:var(--gold);border-radius:8px;padding:9px;display:flex;flex:none;}
.stat-icon svg{width:19px;height:19px;}
.stat-number{color:var(--gold);font-size:25px;font-weight:800;letter-spacing:.08em;font-family:var(--font-mono);}
.stat-copy{margin-left:auto;text-align:right;}
.stat-copy span{display:block;color:var(--gold);text-transform:uppercase;font-size:9px;letter-spacing:.12em;font-weight:700;}
.stat-copy small{display:block;color:var(--text-faint);font-size:9px;margin-top:6px;}

/* Grille de contenu */
.content-grid{display:grid;grid-template-columns:2.05fr 1fr;gap:24px;}
@media(max-width:900px){.content-grid{grid-template-columns:1fr;}}
.main-column,.side-column{display:flex;flex-direction:column;gap:18px;min-width:0;}
.panel{background:var(--card);border:1px solid var(--card-border);border-radius:10px;overflow:hidden;}
.panel-heading{padding:21px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid var(--card-border);flex-wrap:wrap;}
.panel-heading h2{font-family:var(--font-serif);font-weight:500;color:var(--text-cream);font-size:17px;margin:0;}
.panel-heading p{color:var(--text-faint);font-size:10px;margin:8px 0 0;}
.panel-intro{color:var(--text-faint);font-size:10px;margin:8px 0 0;line-height:1.6;}

/* État vide */
.empty-state{margin:19px;min-height:128px;border:1px dashed rgba(234,161,0,.25);border-radius:8px;width:calc(100% - 38px);color:var(--gold);background:transparent;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:7px;cursor:pointer;font-family:inherit;transition:.2s;text-align:center;padding:20px;}
.empty-state:hover{border-color:var(--gold);background:rgba(234,161,0,.04);}
.empty-state svg{width:28px;height:28px;opacity:.7;}
.empty-state strong{font-family:var(--font-serif);font-size:14px;color:var(--gold);font-weight:500;}
.empty-state span{font-size:10px;color:var(--text-muted);}
.empty-action{display:flex;align-items:center;color:var(--gold);margin-top:6px;font-size:10px;font-weight:700;}
.empty-action svg{width:14px;height:14px;}
.ghost-button,.detail-button{color:var(--gold);background:none;border:0;font-size:10px;display:inline-flex;gap:6px;align-items:center;cursor:pointer;font-family:inherit;font-weight:700;text-decoration:none;white-space:nowrap;}
.ghost-button svg,.detail-button svg{width:14px;height:14px;}
.ghost-button:hover,.detail-button:hover{text-decoration:underline;text-underline-offset:3px;}
.detail-button{border:1px solid var(--card-border);border-radius:7px;padding:9px 10px;}
.detail-button:hover{background:rgba(234,161,0,.06);text-decoration:none;border-color:var(--gold);}

/* Lignes de devis */
.quote-row{padding:20px;display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:1px solid rgba(234,161,0,0.06);}
.quote-row:last-child{border-bottom:none;}
.quote-main{min-width:0;flex:1;}
.quote-title{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;}
.quote-title strong{font-size:13px;font-weight:700;color:var(--text-cream);}
.status{display:inline-flex;align-items:center;gap:5px;font-size:9.5px;letter-spacing:0.06em;text-transform:uppercase;font-weight:700;padding:4px 10px;border-radius:100px;}
.status .dot{width:6px;height:6px;border-radius:50%;}
.quote-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:10px;color:var(--text-faint);}
.quote-meta b{color:var(--text-muted);font-weight:600;}
.quote-meta span{width:3px;height:3px;border-radius:50%;background:var(--text-faint);display:inline-block;}
.quote-progress{display:flex;align-items:center;gap:10px;margin-top:12px;max-width:260px;}
.quote-progress > div{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:9.5px;color:var(--text-faint);min-width:120px;}
.quote-progress b{font-family:var(--font-mono);color:var(--text-muted);font-weight:600;}
.quote-progress i{flex:1;height:5px;border-radius:100px;background:rgba(234,161,0,.1);overflow:hidden;display:block;}
.quote-progress em{display:block;height:100%;border-radius:100px;background:linear-gradient(90deg,var(--gold),var(--gold-light));}
.quote-deadline{font-family:var(--font-mono);font-size:10px;margin-top:6px;font-weight:600;}
.quote-deadline.urgent{color:var(--warn);}
.quote-deadline.expired{color:#e05252;}

/* Filtres */
.db-filters{display:flex;flex-wrap:wrap;gap:12px;padding:16px 20px;border-bottom:1px solid rgba(234, 161, 0,0.06);}
.db-filter{display:inline-flex;align-items:center;gap:6px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-faint);font-weight:600;cursor:default;}
.db-filter .dot{width:7px;height:7px;border-radius:50%;}

/* Alertes */
.alerts-list{display:flex;flex-direction:column;}
.alert-row{display:flex;align-items:flex-start;gap:12px;padding:16px 20px;border-bottom:1px solid rgba(234, 161, 0,0.06);}
.alert-row:last-child{border-bottom:none;}
.alert-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px;}
.alert-text{font-size:12.5px;font-weight:600;color:var(--text-cream);margin-bottom:3px;}
.alert-desc{font-size:11.5px;color:var(--text-muted);line-height:1.5;}
.alerts-empty{text-align:center;padding:32px 20px;color:var(--text-faint);font-size:12px;}

/* Historique */
.timeline-panel h2{font-family:var(--font-serif);font-weight:500;font-size:17px;margin:0;color:var(--text-cream);}
.timeline-item{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid rgba(234,161,0,0.06);}
.timeline-item:last-child{border-bottom:none;}
.timeline-dot{width:9px;height:9px;border-radius:50%;flex:none;margin-top:4px;border:2px solid var(--gold);background:transparent;}
.timeline-item small{display:block;font-family:var(--font-mono);font-size:9px;color:var(--text-faint);margin-bottom:4px;letter-spacing:.04em;}
.timeline-item strong{display:block;font-size:12.5px;font-weight:700;color:var(--text-cream);margin-bottom:3px;}
.timeline-item strong a{color:var(--gold-light);text-decoration:none;}
.timeline-item strong a:hover{text-decoration:underline;text-underline-offset:3px;}
.timeline-item span{display:block;font-size:11.5px;color:var(--text-muted);line-height:1.5;}

/* Documents */
.documents-panel > .panel-heading > svg{color:var(--gold);width:19px;height:19px;}
.documents-panel .panel-intro{padding:0 20px;margin:14px 0;}
.document-types{display:flex;flex-direction:column;gap:8px;padding:0 20px 8px;}
.document-types > div,.document-types > a{display:flex;align-items:center;gap:10px;padding:11px 12px;border:1px solid rgba(234,161,0,.1);border-radius:8px;color:#708494;text-decoration:none;}
.document-types > a:hover{border-color:var(--gold);}
.document-types svg{color:var(--gold);flex:none;width:16px;height:16px;}
.document-types span{display:flex;flex-direction:column;gap:3px;min-width:0;}
.document-types b{color:var(--text-cream);font-size:10px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.document-types small{color:var(--text-faint);font-size:8px;}
.documents-empty{margin:0 20px 20px;padding:16px 14px;border:1px dashed rgba(234,161,0,.2);border-radius:8px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;}
.documents-empty svg{width:20px;height:20px;color:var(--text-faint);}
.documents-empty strong{font-size:11px;color:var(--text-muted);}
.documents-empty span{font-size:10px;color:var(--text-faint);line-height:1.5;}

/* Modale */
.db-modal-overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;background:rgba(11,17,26,0.8);backdrop-filter:blur(4px);padding:16px;}
@media(min-width:640px){.db-modal-overlay{align-items:center;}}
.db-modal{width:100%;max-width:560px;background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.4);}
.db-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding-bottom:18px;border-bottom:1px solid var(--card-border);margin-bottom:20px;}
.db-modal-head .label{font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-faint);font-weight:700;}
.db-modal-head h3{font-family:var(--font-serif);font-weight:500;font-size:22px;color:var(--text-cream);margin-top:6px;}
.db-modal-close{background:none;border:none;color:var(--text-faint);cursor:pointer;padding:4px;transition:color .2s;}
.db-modal-close:hover{color:var(--gold-light);}
.db-modal-close svg{width:18px;height:18px;}
.db-modal-row{margin-bottom:14px;}
.db-modal-row .label{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-faint);font-weight:600;margin-bottom:4px;}
.db-modal-row .value{font-size:13px;color:var(--text-cream);line-height:1.6;}
.db-modal-row .value.muted{color:var(--text-muted);}
.db-modal-actions{margin-top:20px;padding-top:18px;border-top:1px solid var(--card-border);}
.db-modal-actions p{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;}
.db-modal-actions p.expired{color:#e05252;}
.db-modal-actions p.urgent{color:var(--warn);}
.db-modal-actions p.normal{color:var(--text-faint);}
.db-modal-btn{width:100%;padding:12px;border-radius:8px;border:none;background:linear-gradient(180deg,var(--gold-light),var(--gold));color:#1B2436;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:filter .2s;}
.db-modal-btn:hover{filter:brightness(1.06);}

.site-footer{padding:36px 0 70px;text-align:center;font-size:12px;color:var(--text-faint);border-top:1px solid rgba(234, 161, 0,0.06);margin-top:40px;}

/* Filtres de statuts */
.db-empty{text-align:center;padding:40px 26px;color:var(--text-muted);font-size:13px;}
.quote-deadline{font-family:var(--font-mono);font-size:10px;margin-top:6px;font-weight:600;}
.quote-deadline.urgent{color:var(--warn);}
.quote-deadline.expired{color:#e05252;}

/* Lignes de documents (données live) */
.db-doc-icon{width:28px;height:32px;display:grid;place-items:center;flex:none;border-radius:6px;background:rgba(234, 161, 0,.1);color:var(--gold);font-family:var(--font-mono);font-size:8px;font-weight:800;}
.db-doc-row{display:flex;gap:10px;align-items:center;padding:10px;border-radius:8px;background:rgba(234, 161, 0,.035);text-decoration:none;color:inherit;}
.db-doc-row[href]:hover{background:rgba(234, 161, 0,.09);}
.db-doc-name{font-size:11px;font-weight:700;color:var(--text-cream);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.db-doc-meta{font-size:9px;color:var(--text-faint);margin-top:3px;}
`;

export function MonProfilSection({ variant = "preview", user }: MonProfilSectionProps) {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [commandes, setCommandes] = useState<CommandeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecord | null>(null);
  const [showAllQuotes, setShowAllQuotes] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [confirmingQuote, setConfirmingQuote] = useState(false);
  const { showToast } = useToast();
  const [pointsSolde, setPointsSolde] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [qRes, cRes, nRes] = await Promise.all([
          authAPI.get<{ data: QuoteRecord[]; total: number }>("/quotes").catch(() => null),
          authAPI.get<{ data: CommandeRecord[] }>("/commandes").catch(() => null),
          notificationsAPI.list().catch(() => null),
        ]);
        if (!active) return;
        if (qRes) setQuotes(Array.isArray(qRes.data) ? qRes.data : (qRes.data?.data ?? []));
        if (cRes) setCommandes(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data ?? []));
        if (nRes) setNotifications(Array.isArray(nRes.data) ? nRes.data : []);
        try {
          const pRes = await authAPI.get<{ solde: number }>("/moi/points");
          if (active && pRes) setPointsSolde(Number(pRes.data?.solde ?? pRes.data ?? 0));
        } catch {}
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
  const submittedQuotes = quotes;
  const pendingQuotes = submittedQuotes.filter((q) => q.status === "pending" || q.status === "needs_info");
  const latestPendingQuote = [...pendingQuotes].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
  )[0];
  const alertCount = submittedQuotes.filter((q) => q.status === "sent" || q.status === "production" || q.status === "needs_info").length;
  const sentQuotes = submittedQuotes.filter((q) => q.status === "sent");
  const underReviewQuotes = submittedQuotes.filter((q) => q.status === "pending" || q.status === "needs_info");
  const approvedQuotes = submittedQuotes.filter((q) => q.status === "accepted" || q.status === "production");
  const documents: ClientDocument[] = [
    ...submittedQuotes.flatMap((quote) => quoteFiles(quote)
      .filter((file) => file.type === "application/pdf" || /\.pdf$/i.test(file.name))
      .map((file, index) => ({
        id: `attachment-${quote.id}-${index}`,
        label: file.name,
        detail: `PDF reçu avec ${quoteReference(quote)}`,
        date: quote.created_at,
        href: file.url,
        kind: "pdf" as const,
      }))),
    ...approvedQuotes.map((quote) => ({
      id: `quote-${quote.id}`,
      label: `Devis validé — ${quoteReference(quote)}`,
      detail: quote.amount ? `${Number(quote.amount).toLocaleString("fr-FR")} Ar` : "Devis étudié et validé",
      date: quote.validated_at ?? quote.updated_at ?? quote.created_at,
      href: `/mon-profil/devis/detail?id=${quote.id}`,
      kind: "devis" as const,
    })),
    ...commandes.map((commande) => ({
      id: `order-${commande.id}`,
      label: `Bon de commande — ${commande.numero}`,
      detail: commande.designation ?? `${commande.quantite} pièces`,
      date: commande.date_commande ?? commande.created_at,
      kind: "commande" as const,
    })),
  ].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

  type HistoryItem = {
    key: string;
    date: string;
    label: string;
    detail: string;
    href?: string;
    tone: string;
  };

  // Historique complet : tout ce que le client a fait + reçu, trié par date.
  const historyItems: HistoryItem[] = [
    ...submittedQuotes.map((q) => ({
      key: `demande-${q.id}`,
      date: q.created_at ?? "",
      label: "Demande envoyée",
      detail: `${q.name ?? "Demande"}${q.message ? ` — ${q.message.slice(0, 80)}` : ""}`,
      href: `/mon-profil/devis/detail?id=${q.id}`,
      tone: "var(--gold)",
    })),
    ...submittedQuotes
      .filter((q) => q.status === "sent" || q.status === "accepted" || q.status === "production")
      .map((q) => ({
        key: `devis-${q.id}`,
        date: q.updated_at ?? q.created_at ?? "",
        label: "Devis reçu",
        detail: `${quoteReference(q)}${q.amount ? ` — ${Number(q.amount).toLocaleString("fr-FR")} Ar` : ""}`,
        href: `/mon-profil/devis/detail?id=${q.id}`,
        tone: "#8b7bd4",
      })),
    ...submittedQuotes
      .filter((q) => q.status === "accepted" || q.status === "production")
      .map((q) => ({
        key: `confirme-${q.id}`,
        date: q.validated_at ?? q.updated_at ?? q.created_at ?? "",
        label: "Devis confirmé",
        detail: quoteReference(q),
        href: `/mon-profil/devis/detail?id=${q.id}`,
        tone: "#5cb87d",
      })),
    ...submittedQuotes
      .filter((q) => q.status === "rejected")
      .map((q) => ({
        key: `annule-${q.id}`,
        date: q.updated_at ?? q.created_at ?? "",
        label: "Devis annulé",
        detail: quoteReference(q),
        href: `/mon-profil/devis/detail?id=${q.id}`,
        tone: "#e08b52",
      })),
    ...commandes.map((c) => ({
      key: `commande-${c.id}`,
      date: c.date_commande ?? c.created_at ?? "",
      label: "Commande passée",
      detail: `${c.numero} — ${c.designation ?? `${c.quantite} pièces`}`,
      href: "/suivi-commande",
      tone: "var(--gold)",
    })),
    ...commandes
      .filter((c) => c.statut_production === "Livrée")
      .map((c) => ({
        key: `livree-${c.id}`,
        date: c.date_livraison_reelle ?? c.updated_at ?? c.date_commande ?? "",
        label: "Commande livrée",
        detail: `${c.numero} — ${c.designation ?? ""}`,
        href: "/suivi-commande",
        tone: "#5cb87d",
      })),
    ...notifications.map((n) => ({
      key: `notif-${n.id}`,
      date: n.created_at,
      label: n.title || "Notification reçue",
      detail: (n.message ?? "").slice(0, 90),
      href: n.action_url ?? undefined,
      tone: "var(--gold-dim)",
    })),
  ]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activityLimit = showAllActivity ? Number.MAX_SAFE_INTEGER : 6;
  const activitySlice = historyItems.slice(0, activityLimit);
  const hasMoreActivity = historyItems.length > 6;

  if (variant === "dashboard") {
    const hasData = !isLoading && (quotes.length > 0 || commandes.length > 0 || draftCount > 0);
    const quoteList = submittedQuotes.filter((q) => q.status !== "draft");
    const totalRows = quoteList.length;
    const rowLimit = showAllQuotes ? Number.MAX_SAFE_INTEGER : 5;
    const quoteSlice = quoteList.slice(0, rowLimit);
    const hasMoreRows = totalRows > 5;

    return (
      <section style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <style>{globalStyles}</style>

        <div className="db-container">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span />Espace personnel</div>
              <h1>Tableau de bord</h1>
              <p>Bienvenue dans votre atelier numérique.</p>
            </div>
            <Link href="/demande-devis" className="primary-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5V19M5 12H19" /></svg>
              Nouveau devis
            </Link>
          </div>
        </div>

        <main className="db-container">
          {error && (
            <div style={{ background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)", borderRadius: 12, padding: 18, color: "#e05252", fontSize: 13, marginBottom: 28 }} role="alert">
              {error}
            </div>
          )}

          {!hasData && !isLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(234, 161, 0,0.08)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" style={{ width: 28, height: 28 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--text-cream)", marginBottom: 10 }}>Pas encore de demande</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.6 }}>
                Vous n&apos;avez pas encore soumis de demande de devis. Commencez dès maintenant pour suivre vos projets textile.
              </p>
              <Link href="/demande-devis" className="primary-button">Faire un devis</Link>
            </div>
          ) : (
            <>
              {latestPendingQuote && (
                <section className="request-banner" aria-label="Demande en attente">
                  <div className="banner-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></svg>
                  </div>
                  <div>
                    <div className="eyebrow gold">Demande en attente</div>
                    <h2>Votre demande a bien été reçue.</h2>
                    <p>
                      Demande <strong>#{quoteShortId(latestPendingQuote.id)}</strong> — {latestPendingQuote.name ? `${latestPendingQuote.name} envoyée` : "envoyée"} le {formatDate(latestPendingQuote.created_at ?? "")}.
                      Notre équipe vous répondra sous <b>2 à 3 jours ouvrés.</b>
                    </p>
                  </div>
                  <div className="banner-progress" aria-hidden="true"><span /><span /><span /></div>
                </section>
              )}

              <div className="stats-grid" aria-label="Résumé de l'activité">
                {[
                  { label: "Commandes en cours", value: String(activeCommandes.length).padStart(2, "0"), detail: activeCommandes.length > 0 ? `${activeCommandes[0].numero} — ${activeCommandes[0].statut_production}` : "Aucune commande active", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01M17 12h.01M7 12h.01" /></svg> },
                  { label: "Brouillons", value: String(draftCount).padStart(2, "0"), detail: draftCount > 0 ? `${draftCount} devis non envoyé${draftCount > 1 ? "s" : ""} à finaliser` : "Aucun brouillon", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> },
                  { label: "Notifications", value: String(alertCount).padStart(2, "0"), detail: alertCount > 0 ? `${alertCount} devis nécessitant votre attention` : "Aucune notification", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg> },
                  { label: "Points fidélité", value: pointsSolde === null ? ".." : pointsSolde.toLocaleString("fr-FR"), detail: pointsSolde === null ? "Programme fidélité" : "1 FCFA dépensé = 1 point", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg> },
                ].map((m, i) => (
                  <article className="stat-card" key={i}>
                    <div className="stat-icon">{m.icon}</div>
                    <div className="stat-number">{isLoading ? ".." : m.value}</div>
                    <div className="stat-copy"><span>{m.label}</span><small>{m.detail}</small></div>
                  </article>
                ))}
              </div>

              <div className="content-grid">
                <div className="main-column">
                  <section className="panel drafts-panel">
                    <div style={{ padding: "20px" }}>
                      <BrouillonsClient onCountChange={setDraftCount} />
                    </div>
                  </section>

                  <section className="panel quotes-panel">
                    <div className="panel-heading">
                      <div><h2>Mes devis</h2><p>{totalRows} devis actif{totalRows > 1 ? "s" : ""}</p></div>
                      <button className="ghost-button" onClick={() => setShowAllQuotes((v) => !v)}>
                        {showAllQuotes ? "Voir moins" : "Voir tout"}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                      </button>
                    </div>
                    {isLoading ? (
                      <div className="db-empty">Chargement...</div>
                    ) : totalRows === 0 ? (
                      <button className="empty-state" onClick={() => window.location.assign("/demande-devis")}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                        <strong>Aucun brouillon pour l&apos;instant</strong>
                        <span>Créez un brouillon pour préparer un devis avant de l&apos;envoyer.</span>
                        <span className="empty-action">Créer mon premier devis
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                        </span>
                      </button>
                    ) : (
                      <>
                        {quoteSlice.map((q) => {
                          const pct = STATUS_PCT[q.status ?? ""] ?? 10;
                          const tone = STATUS_DOT[q.status ?? ""] ?? "var(--gold-dim)";
                          const qty = quoteQuantity(q);
                          return (
                            <div className="quote-row" key={q.id}>
                              <div className="quote-main">
                                <div className="quote-title">
                                  <strong>{q.name ?? "Client"}</strong>
                                  <span className="status" style={{ background: `${tone}18`, color: tone }}>
                                    <span className="dot" style={{ background: tone }} />
                                    {quoteStatusLabel(q.status)}
                                  </span>
                                </div>
                                <p className="quote-meta">
                                  Devis <b>#{quoteShortId(q.id)}</b><span />
                                  {qty ?? "Quantité à préciser"}<span />
                                  {q.tissu ?? "Matière à préciser"}
                                </p>
                                <div className="quote-progress">
                                  <div><span>Avancement</span><b>{pct}%</b></div>
                                  <i><em style={{ width: `${pct}%` }} /></i>
                                </div>
                                {q.status === "sent" && (() => {
                                  const cd = confirmationCountdown(q.confirmation_deadline);
                                  if (!cd) return null;
                                  return <div className={`quote-deadline ${cd.expired ? "expired" : cd.urgent ? "urgent" : ""}`}>{cd.expired ? "Délai expiré" : `Confirmer dans ${cd.text}`}</div>;
                                })()}
                              </div>
                              <Link href={`/mon-profil/devis/detail?id=${q.id}`} className="detail-button">
                                Ouvrir
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                              </Link>
                            </div>
                          );
                        })}
                        {hasMoreRows && (
                          <button className="ghost-button" style={{ margin: "4px auto 16px" }} onClick={() => setShowAllQuotes((v) => !v)}>
                            Voir plus ({totalRows - 5} autres)
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showAllQuotes ? "rotate(180deg)" : undefined, transition: "transform .2s" }}><path d="M6 9L12 15L18 9" /></svg>
                          </button>
                        )}
                      </>
                    )}
                  </section>

                  <section className="panel alerts-panel">
                    <div className="panel-heading"><div><h2>Dernières alertes</h2><p>{alertCount} alerte{alertCount !== 1 ? "s" : ""}</p></div></div>
                    {isLoading ? (
                      <div className="db-empty">Chargement...</div>
                    ) : alertCount === 0 ? (
                      <div className="alerts-empty">Aucune alerte pour le moment</div>
                    ) : (
                      <div className="alerts-list">
                        {submittedQuotes.filter((q) => q.status === "sent" || q.status === "production" || q.status === "needs_info").slice(0, 8).map((q) => (
                          <div className="alert-row" key={q.id}>
                            <div className="alert-dot" style={{ background: q.status === "production" ? "var(--warn)" : q.status === "needs_info" ? "var(--gold)" : "var(--gold-dim)" }} />
                            <div>
                              <div className="alert-text">{q.status === "production" ? "En production" : q.status === "needs_info" ? "À préciser" : "Devis envoyé"}</div>
                              <div className="alert-desc">{q.name} — {q.message?.slice(0, 100)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                <aside className="side-column">
                  <section className="panel timeline-panel">
                    <div className="panel-heading"><div><h2>Historique</h2></div></div>
                    <p className="panel-intro" style={{ padding: "0 20px" }}>Tout ce que vous avez fait : demandes, devis reçus, confirmations et commandes.</p>
                    {isLoading ? (
                      <p style={{ color: "var(--text-faint)", fontSize: 12, padding: "0 20px 20px" }}>Chargement...</p>
                    ) : historyItems.length === 0 ? (
                      <p style={{ color: "var(--text-faint)", fontSize: 12, padding: "0 20px 20px" }}>Aucune activité pour le moment</p>
                    ) : (
                      <>
                        <div className="timeline-list" style={{ padding: "6px 20px 0" }}>
                          {activitySlice.map((item) => (
                            <div className="timeline-item" key={item.key}>
                              <div className="timeline-dot" style={{ borderColor: item.tone }} />
                              <div>
                                <small>{formatDate(item.date)}</small>
                                {item.href ? (
                                  <strong><Link href={item.href} style={{ textDecoration: "none", color: "inherit" }}>{item.label} →</Link></strong>
                                ) : (
                                  <strong>{item.label}</strong>
                                )}
                                <span>{item.detail}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {hasMoreActivity && (
                          <button className="text-link" style={{ margin: "4px 20px 16px" }} onClick={() => setShowAllActivity(!showAllActivity)}>
                            {showAllActivity ? "Voir moins" : `Voir l'historique (${historyItems.length - 6} autres)`}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                          </button>
                        )}
                      </>
                    )}
                  </section>

                  <section className="panel documents-panel">
                    <div className="panel-heading">
                      <div><h2>Documents</h2><p>Vos fichiers officiels</p></div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                    </div>
                    <p className="panel-intro">Retrouvez ici les PDF transmis par notre atelier.</p>
                    <div className="document-types">
                      <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg><span><b>Devis PDF</b><small>Document de chiffrage</small></span></div>
                      <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg><span><b>Facture proforma</b><small>En attente de création</small></span></div>
                      <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg><span><b>Bon de commande</b><small>En attente de création</small></span></div>
                    </div>
                    {documents.length === 0 ? (
                      <div className="documents-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                        <strong>Aucun document disponible</strong>
                        <span>Les PDF apparaîtront ici dès qu&apos;ils seront transmis par l&apos;atelier.</span>
                      </div>
                    ) : (
                      <div className="document-types" style={{ paddingTop: 0 }}>
                        {documents.slice(0, 12).map((document) => {
                          const content = <><span className="db-doc-icon">{document.kind === "pdf" ? "PDF" : document.kind === "devis" ? "DEV" : "BC"}</span><span style={{ minWidth: 0 }}><b className="db-doc-name">{document.label}</b><small className="db-doc-meta">{document.detail}{document.date ? ` · ${formatDate(document.date)}` : ""}</small></span></>;
                          return document.href ? (
                            <a className="db-doc-row" href={document.href} key={document.id} target={document.href.startsWith("http") ? "_blank" : undefined} rel={document.href.startsWith("http") ? "noreferrer" : undefined}>{content}</a>
                          ) : <div className="db-doc-row" key={document.id}>{content}</div>;
                        })}
                      </div>
                    )}
                  </section>
                </aside>
              </div>
            </>
          )}
        </main>

        <div className="db-container">
          <footer className="site-footer">
            © 2026 JMR Textile Atelier — Fabrication Madagascar
          </footer>
        </div>

        {selectedQuote && (
          <div className="db-modal-overlay" role="presentation" onClick={() => setSelectedQuote(null)}>
            <div className="db-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <div className="db-modal-head">
                <div>
                  <div className="label">Détail de la demande</div>
                  <h3>{quoteReference(selectedQuote)}</h3>
                </div>
                <button className="db-modal-close" onClick={() => setSelectedQuote(null)} aria-label="Fermer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="db-modal-row">
                <div className="label">Statut</div>
                <div className="value" style={{ fontWeight: 700 }}>{quoteStatusLabel(selectedQuote.status)}</div>
              </div>
              <div className="db-modal-row">
                <div className="label">Demande</div>
                <div className="value muted" style={{ maxHeight: 140, overflowY: "auto" }}>{selectedQuote.message || "Aucun détail complémentaire."}</div>
              </div>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div className="db-modal-row">
                  <div className="label">Envoyée le</div>
                  <div className="value muted">{formatDate(selectedQuote.created_at ?? "")}</div>
                </div>
                {selectedQuote.amount && (
                  <div className="db-modal-row">
                    <div className="label">Montant</div>
                    <div className="value muted" style={{ fontFamily: "var(--font-mono)" }}>{Number(selectedQuote.amount).toLocaleString("fr-FR")} Ar</div>
                  </div>
                )}
                {selectedQuote.date_livraison_prevue && (
                  <div className="db-modal-row">
                    <div className="label">Livraison prévue</div>
                    <div className="value muted">{formatDate(selectedQuote.date_livraison_prevue)}</div>
                  </div>
                )}
              </div>
              {selectedQuote.status === "sent" && (() => {
                const cd = confirmationCountdown(selectedQuote.confirmation_deadline);
                const isExpired = cd?.expired;
                return (
                  <div className="db-modal-actions">
                    {cd && (
                      <p className={isExpired ? "expired" : cd.urgent ? "urgent" : "normal"}>
                        {isExpired ? "Le délai de confirmation a expiré" : `Délai de confirmation : ${cd.text}`}
                      </p>
                    )}
                    {!isExpired && (
                      <button className="db-modal-btn" onClick={() => setConfirmingQuote(true)}>
                        Confirmer le devis
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        <ConfirmDialog
          open={confirmingQuote}
          title="Confirmer ce devis ?"
          message="Cette action est irréversible. Vous validez le devis et lancez la production."
          confirmLabel="Confirmer le devis"
          tone="primary"
          loading={false}
          onCancel={() => setConfirmingQuote(false)}
          onConfirm={async () => {
            if (!selectedQuote) return;
            try { await authAPI.post(`/quotes/${selectedQuote.id}/confirm`, {}); window.location.reload(); }
            catch { showToast("Erreur lors de la confirmation.", "error"); setConfirmingQuote(false); }
          }}
        />
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