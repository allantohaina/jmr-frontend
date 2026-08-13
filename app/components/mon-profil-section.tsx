"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/app/lib";
import { authAPI, type QuoteRecord, type CommandeRecord } from "@/app/lib";
import { getErrorMessage } from "@/app/lib/errors";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import { useToast } from "@/app/components/toast-provider";

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

function timeAgo(d?: string) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  if (Number.isNaN(diff)) return "";
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;
  return formatDate(d);
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
  pending: "#e5ad46",
  draft: "#5c6478",
  sent: "#8b7bd4",
  needs_info: "#d9a548",
  rejected: "#e08b52",
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

const globalStyles = `
:root{
  --bg:#1e2a38;
  --card:#25303a;
  --card-border:rgba(229,173,70,0.12);
  --input-bg:#1b263c;
  --gold:#e5ad46;
  --gold-light:#eccc90;
  --gold-dim:rgba(229,173,70,0.4);
  --text-cream:#f3efe4;
  --text-muted:rgba(229,173,70,0.6);
  --text-faint:rgba(229,173,70,0.35);
  --warn:#e08b52;
  --warn-bg:rgba(224,139,82,0.09);
  --good:#5cb87d;
  --good-bg:rgba(92,184,125,0.09);
  --font-serif:'Fraunces','Noto Serif',serif;
  --font-mono:'JetBrains Mono','IBM Plex Mono',monospace;
  --font-body:'Inter','IBM Plex Sans',system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--text-cream);font-family:var(--font-body);-webkit-font-smoothing:antialiased;}

.db-container{max-width:1100px;margin:0 auto;padding:0 40px;}
@media(max-width:760px){.db-container{padding:0 20px;}}

.db-head{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px;padding:36px 0 28px;}
.db-head h1{font-family:var(--font-serif);font-weight:500;font-size:clamp(26px,3.4vw,34px);margin:0;color:var(--gold-light);}
.eyebrow{font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:10px;display:flex;align-items:center;gap:10px;}
.eyebrow::before{content:"";width:22px;height:1px;background:var(--gold-dim);}

.db-banner{background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:28px 32px;margin-bottom:32px;position:relative;overflow:hidden;}
.db-banner::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 85% 30%,rgba(229,173,70,0.08),transparent 60%);pointer-events:none;}
.db-banner-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.db-banner-eyebrow .icon{width:32px;height:32px;border-radius:8px;background:rgba(229,173,70,0.1);display:flex;align-items:center;justify-content:center;}
.db-banner-eyebrow .icon svg{width:16px;height:16px;stroke:var(--gold);}
.db-banner-eyebrow span{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);font-weight:700;}
.db-banner h2{font-family:var(--font-serif);font-weight:500;font-size:22px;color:var(--gold-light);margin-bottom:10px;}
.db-banner p{font-size:13px;color:var(--text-muted);line-height:1.6;}
.db-banner p b{color:var(--text-cream);}

.db-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:36px;}
@media(max-width:800px){.db-metrics{grid-template-columns:1fr;}}
.db-metric{background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:24px 26px;display:flex;align-items:center;gap:18px;}
.db-metric-icon{width:44px;height:44px;border-radius:10px;background:rgba(229,173,70,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.db-metric-icon svg{width:20px;height:20px;stroke:var(--gold);}
.db-metric-value{font-family:var(--font-mono);font-size:32px;font-weight:700;color:var(--gold-light);line-height:1;}
.db-metric-info{margin-left:auto;text-align:right;}
.db-metric-label{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-faint);font-weight:700;margin-bottom:4px;}
.db-metric-detail{font-size:11px;color:var(--text-muted);}

.db-grid{display:grid;grid-template-columns:1fr 340px;gap:32px;margin-bottom:48px;}
@media(max-width:900px){.db-grid{grid-template-columns:1fr;}}

.db-panel{background:var(--card);border:1px solid var(--card-border);border-radius:12px;overflow:hidden;margin-bottom:24px;}
.db-panel-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:22px 26px;border-bottom:1px solid var(--card-border);}
.db-panel-head h2{font-family:var(--font-serif);font-weight:500;font-size:18px;color:var(--gold-light);}
.db-panel-head .hint{font-size:11px;color:var(--text-faint);}

.db-filters{display:flex;flex-wrap:wrap;gap:12px;padding:16px 26px;border-bottom:1px solid rgba(229,173,70,0.06);}
.db-filter{display:inline-flex;align-items:center;gap:6px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-faint);font-weight:600;cursor:default;}
.db-filter .dot{width:7px;height:7px;border-radius:50%;}

.db-quote-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 26px;border-bottom:1px solid rgba(229,173,70,0.06);transition:background .2s;}
.db-quote-row:last-child{border-bottom:none;}
.db-quote-row:hover{background:rgba(229,173,70,0.02);}
.db-quote-left{min-width:0;flex:1;overflow:hidden;}
.db-quote-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;}
.db-quote-name{font-size:13px;font-weight:700;color:var(--text-cream);}
.db-quote-status{display:inline-flex;align-items:center;gap:5px;font-size:9.5px;letter-spacing:0.06em;text-transform:uppercase;font-weight:700;padding:4px 10px;border-radius:100px;}
.db-quote-status .dot{width:6px;height:6px;border-radius:50%;}
.db-quote-msg{font-size:12px;color:var(--text-muted);line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.db-quote-date{font-family:var(--font-mono);font-size:9.5px;color:var(--text-faint);letter-spacing:0.04em;}
.db-draft-title{font-size:13px;font-weight:700;color:var(--text-cream);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:8px;min-height:17px;}
.db-draft-progress{display:flex;align-items:center;gap:10px;max-width:220px;}
.db-draft-progress-track{flex:1;height:5px;border-radius:100px;background:rgba(229,173,70,0.1);overflow:hidden;}
.db-draft-progress-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,var(--gold),var(--gold-light));transition:width .3s;}
.db-draft-progress span{font-family:var(--font-mono);font-size:9.5px;color:var(--text-faint);}
.db-quote-deadline{font-family:var(--font-mono);font-size:10px;margin-top:6px;font-weight:600;}
.db-quote-deadline.urgent{color:var(--warn);}
.db-quote-deadline.expired{color:#e05252;}
.db-quote-action{flex-shrink:0;}
.db-btn-sm{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:7px;border:1px solid var(--card-border);background:transparent;color:var(--text-muted);font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all .2s;text-decoration:none;}
.db-btn-sm:hover{border-color:var(--gold);color:var(--gold-light);}
.db-btn-sm svg{width:12px;height:12px;}

.db-btn-gold{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:8px;border:none;background:linear-gradient(180deg,var(--gold-light),var(--gold));color:#1a1204;font-weight:700;font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:filter .2s,transform .2s;white-space:nowrap;text-decoration:none;}
.db-btn-gold:hover{filter:brightness(1.06);transform:translateY(-1px);}

.db-see-more{width:100%;padding:14px;border:none;background:transparent;border-top:1px solid rgba(229,173,70,0.06);font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--gold);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background .2s;}
.db-see-more:hover{background:rgba(229,173,70,0.03);}

.db-empty{text-align:center;padding:40px 26px;color:var(--text-muted);font-size:13px;}

.db-sidebar{display:flex;flex-direction:column;gap:24px;}

.db-activity{background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:26px;}
.db-activity h2{font-family:var(--font-serif);font-weight:500;font-size:18px;color:var(--gold-light);margin-bottom:20px;}
.db-timeline{position:relative;padding-left:28px;}
.db-timeline::before{content:"";position:absolute;left:9px;top:4px;bottom:4px;width:1px;background:var(--card-border);}
.db-tl-item{position:relative;padding-bottom:20px;}
.db-tl-item:last-child{padding-bottom:0;}
.db-tl-dot{position:absolute;left:-28px;top:2px;width:19px;height:19px;border-radius:50%;border:2px solid var(--gold);background:var(--card);display:flex;align-items:center;justify-content:center;}
.db-tl-dot::after{content:"";width:7px;height:7px;border-radius:50%;background:var(--gold);}
.db-tl-date{font-family:var(--font-mono);font-size:9.5px;color:var(--text-faint);margin-bottom:4px;letter-spacing:0.04em;}
.db-tl-label{font-size:12.5px;font-weight:700;color:var(--text-cream);margin-bottom:3px;}
.db-tl-detail{font-size:11.5px;color:var(--text-muted);line-height:1.5;}

.db-docs{background:var(--input-bg);border:1px solid var(--card-border);border-radius:12px;padding:26px;}
.db-docs h2{font-family:var(--font-serif);font-weight:500;font-size:18px;color:var(--gold-light);margin-bottom:14px;}
.db-docs p{font-size:12px;color:var(--text-faint);margin-bottom:18px;}
.db-docs-btn{width:100%;padding:12px;border-radius:8px;border:1px dashed var(--card-border);background:transparent;color:var(--text-faint);font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:not-allowed;transition:all .2s;}

.db-alerts-empty{text-align:center;padding:32px 26px;color:var(--text-faint);font-size:12px;}

.db-alert-row{display:flex;align-items:flex-start;gap:12px;padding:16px 26px;border-bottom:1px solid rgba(229,173,70,0.06);}
.db-alert-row:last-child{border-bottom:none;}
.db-alert-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px;}
.db-alert-text{font-size:12.5px;font-weight:600;color:var(--text-cream);margin-bottom:3px;}
.db-alert-desc{font-size:11.5px;color:var(--text-muted);line-height:1.5;}

.db-modal-overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;background:rgba(11,17,26,0.8);backdrop-filter:blur(4px);padding:16px;}
@media(min-width:640px){.db-modal-overlay{align-items:center;}}
.db-modal{width:100%;max-width:560px;background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.4);}
.db-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding-bottom:18px;border-bottom:1px solid var(--card-border);margin-bottom:20px;}
.db-modal-head .label{font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-faint);font-weight:700;}
.db-modal-head h3{font-family:var(--font-serif);font-weight:500;font-size:22px;color:var(--gold-light);margin-top:6px;}
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
.db-modal-btn{width:100%;padding:12px;border-radius:8px;border:none;background:linear-gradient(180deg,var(--gold-light),var(--gold));color:#1a1204;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:filter .2s;}
.db-modal-btn:hover{filter:brightness(1.06);}

.site-footer{padding:36px 0 70px;text-align:center;font-size:12px;color:var(--text-faint);border-top:1px solid rgba(229,173,70,0.06);margin-top:40px;}
`;

export function MonProfilSection({ variant = "preview", user }: MonProfilSectionProps) {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [commandes, setCommandes] = useState<CommandeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecord | null>(null);
  const [showAllQuotes, setShowAllQuotes] = useState(false);
  const [showAllDrafts, setShowAllDrafts] = useState(false);
  const [draftFilter, setDraftFilter] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmingQuote, setConfirmingQuote] = useState(false);
  const { showToast } = useToast();

  const deleteDraft = useCallback(async (draftId: string) => {
    setDeleting(true);
    try {
      await authAPI.delete(`/quotes/${draftId}`);
      setQuotes((prev) => prev.filter((q) => String(q.id) !== draftId));
      showToast("Brouillon supprimé.");
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }, [showToast]);

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
  const submittedQuotes = quotes;
  const allDrafts = submittedQuotes
    .filter((q) => q.status === "draft")
    .map((q) => ({
      id: String(q.id),
      titre: q.titre ?? "",
      progression: q.progression ?? 0,
      updated_at: q.updated_at ?? q.created_at ?? "",
    }));
  const draftCount = allDrafts.length;
  const pendingQuotes = submittedQuotes.filter((q) => q.status === "pending" || q.status === "needs_info");
  const latestPendingQuote = [...pendingQuotes].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
  )[0];
  const alertCount = submittedQuotes.filter((q) => q.status === "sent" || q.status === "production" || q.status === "needs_info").length;

  const recentItems = [
    ...submittedQuotes.map((q) => ({ type: "quote" as const, date: q.created_at ?? "", label: "Nouveau devis", detail: `${q.name} - ${q.message?.slice(0, 80)}` })),
    ...commandes.map((c) => ({ type: "commande" as const, date: c.date_commande ?? "", label: "Commande passée", detail: `${c.numero} - ${c.designation ?? ""}` })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  if (variant === "dashboard") {
    const hasData = !isLoading && (quotes.length > 0 || commandes.length > 0 || draftCount > 0);
    const filteredQuotes = draftFilter ? submittedQuotes.filter((q) => q.status === draftFilter) : submittedQuotes;
    const showDraftRows = draftFilter === null || draftFilter === "draft";
    const quoteList = showDraftRows ? submittedQuotes.filter((q) => q.status !== "draft") : filteredQuotes;
    const draftList = showDraftRows ? allDrafts : [];
    const totalRows = draftList.length + quoteList.length;
    const rowLimit = showAllQuotes ? Number.MAX_SAFE_INTEGER : 5;
    const draftSlice = draftList.slice(0, rowLimit);
    const quoteSlice = quoteList.slice(0, Math.max(0, rowLimit - draftSlice.length));
    const hasMoreRows = totalRows > 5;

    return (
      <section style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <style>{globalStyles}</style>

        <header style={{ borderBottom: "1px solid var(--card-border)" }}>
          <div className="db-container">
            <div className="db-head">
              <div>
                <div className="eyebrow">Espace Personnel</div>
                <h1>Tableau de bord</h1>
              </div>
              <Link href="/demande-devis" className="db-btn-gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5V19M5 12H19"/></svg>
                Nouveau devis
              </Link>
            </div>
          </div>
        </header>

        <main className="db-container" style={{ paddingTop: 32 }}>
          {error && (
            <div style={{ background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)", borderRadius: 12, padding: 18, color: "#e05252", fontSize: 13, marginBottom: 28 }} role="alert">
              {error}
            </div>
          )}

          {!hasData && !isLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(229,173,70,0.08)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" style={{ width: 28, height: 28 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--gold-light)", marginBottom: 10 }}>Pas encore de demande</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.6 }}>
                Vous n&apos;avez pas encore soumis de demande de devis. Commencez dès maintenant pour suivre vos projets textile.
              </p>
              <Link href="/demande-devis" className="db-btn-gold">Faire un devis</Link>
            </div>
          ) : (
            <>
              {latestPendingQuote && (
                <div className="db-banner">
                  <div className="db-banner-eyebrow">
                    <div className="icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                    </div>
                    <span>Demande en attente</span>
                  </div>
                  <h2>Votre demande a bien été reçue.</h2>
                  <p>
                    {quoteReference(latestPendingQuote)}{latestPendingQuote.name ? ` — ${latestPendingQuote.name}` : ""} envoyée le {formatDate(latestPendingQuote.created_at ?? "")}.
                    Notre équipe vous répondra sous <b>2 à 3 jours ouvrés</b>.
                  </p>
                </div>
              )}

              <div className="db-metrics">
                {[
                  { label: "Commandes en cours", value: String(activeCommandes.length).padStart(2, "0"), detail: activeCommandes.length > 0 ? `${activeCommandes[0].numero} — ${activeCommandes[0].statut_production}` : "Aucune commande active", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01M17 12h.01M7 12h.01"/></svg> },
                  { label: "Brouillons", value: String(draftCount).padStart(2, "0"), detail: draftCount > 0 ? `${draftCount} devis non envoyé${draftCount > 1 ? "s" : ""} à finaliser` : "Aucun brouillon", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
                  { label: "Notifications", value: String(alertCount).padStart(2, "0"), detail: alertCount > 0 ? `${alertCount} devis nécessitant votre attention` : "Aucune notification", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg> },
                ].map((m, i) => (
                  <div className="db-metric" key={i}>
                    <div className="db-metric-icon">{m.icon}</div>
                    <div className="db-metric-value">{isLoading ? ".." : m.value}</div>
                    <div className="db-metric-info">
                      <div className="db-metric-label">{m.label}</div>
                      <div className="db-metric-detail">{m.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="db-grid">
                <div>
                  <div className="db-panel">
                    <div className="db-panel-head">
                      <h2>Mes devis</h2>
                      <span className="hint">{totalRows} devis</span>
                    </div>
                    <div className="db-filters">
                      {[{ s: null, l: "Tous" }, { s: "draft", l: "Brouillon" }, { s: "pending", l: "En attente" }, { s: "sent", l: "Envoyé" }, { s: "needs_info", l: "À préciser" }, { s: "accepted", l: "Accepté" }, { s: "production", l: "Production" }, { s: "rejected", l: "Annulé" }].map((f) => (
                        <button key={f.s ?? "all"} onClick={() => setDraftFilter(f.s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          <span className="db-filter" style={{ color: draftFilter === f.s ? "var(--gold-light)" : undefined }}>
                            <span className="dot" style={{ background: f.s ? (STATUS_DOT[f.s] ?? "var(--gold-dim)") : "var(--text-faint)" }} />
                            {f.l}
                          </span>
                        </button>
                      ))}
                    </div>
                    {isLoading ? (
                      <div className="db-empty">Chargement...</div>
                    ) : totalRows === 0 ? (
                      <div className="db-empty">
                        <p style={{ marginBottom: 16 }}>Aucun devis pour le moment</p>
                        <Link href="/demande-devis" className="db-btn-gold" style={{ fontSize: 10 }}>Faire une demande</Link>
                      </div>
                    ) : (
                      <>
                        {draftSlice.map((d) => (
                          <div className="db-quote-row" key={`draft-${d.id}`}>
                            <div className="db-quote-left">
                              <div className="db-quote-top">
                                <span className="db-quote-status" style={{ background: `${STATUS_DOT.draft}18`, color: STATUS_DOT.draft }}>
                                  <span className="dot" style={{ background: STATUS_DOT.draft }} />
                                  Brouillon
                                </span>
                                <span className="db-quote-date">Modifié {timeAgo(d.updated_at)}</span>
                              </div>
                              <div className="db-draft-title" title={d.titre || "Sans objet"}>
                                {d.titre || "(sans objet)"}
                              </div>
                              <div className="db-draft-progress">
                                <div className="db-draft-progress-track">
                                  <div className="db-draft-progress-fill" style={{ width: `${Math.max(0, Math.min(100, d.progression))}%` }} />
                                </div>
                                <span>{d.progression}% complété</span>
                              </div>
                            </div>
                            <div className="db-quote-action">
                              <Link href={`/demande-devis?draft=${d.id}`} className="db-btn-sm" title="Reprendre la saisie du brouillon">
                                Reprendre
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                              </Link>
                              <button className="db-btn-sm" style={{ marginLeft: 8, color: "var(--warn)", borderColor: "rgba(224,139,82,0.3)" }} onClick={() => setPendingDelete(String(d.id))} title="Supprimer">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        {quoteSlice.map((q) => (
                          <div className="db-quote-row" key={q.id}>
                            <div className="db-quote-left">
                              <div className="db-quote-top">
                                <span className="db-quote-name">{q.name ?? "Client"}</span>
                                <span className="db-quote-status" style={{ background: `${STATUS_DOT[q.status ?? ""] ?? "var(--gold-dim)"}18`, color: STATUS_DOT[q.status ?? ""] ?? "var(--gold)" }}>
                                  <span className="dot" style={{ background: STATUS_DOT[q.status ?? ""] ?? "var(--gold-dim)" }} />
                                  {quoteStatusLabel(q.status)}
                                </span>
                              </div>
                              <div className="db-quote-msg">{q.message}</div>
                              {q.status === "sent" && (() => {
                                const cd = confirmationCountdown(q.confirmation_deadline);
                                if (!cd) return null;
                                return <div className={`db-quote-deadline ${cd.expired ? "expired" : cd.urgent ? "urgent" : ""}`}>{cd.expired ? "Délai expiré" : `Confirmer dans ${cd.text}`}</div>;
                              })()}
                            </div>
                            <div className="db-quote-action">
                              <Link href={`/mon-profil/devis/detail?id=${q.id}`} className="db-btn-sm">
                                Détail
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                              </Link>
                              {q.status === "draft" && (
                                <button className="db-btn-sm" style={{ marginLeft: 8, color: "var(--warn)", borderColor: "rgba(224,139,82,0.3)" }} onClick={() => setPendingDelete(String(q.id))} title="Supprimer">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {hasMoreRows && (
                          <button className="db-see-more" onClick={() => setShowAllQuotes(!showAllQuotes)}>
                            {showAllQuotes ? "Voir moins" : `Voir plus (${totalRows - 5} autres)`}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12, transform: showAllQuotes ? "rotate(180deg)" : undefined, transition: "transform .2s" }}><path d="M6 9L12 15L18 9"/></svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="db-panel">
                    <div className="db-panel-head">
                      <h2>Dernières alertes</h2>
                      <span className="hint">{alertCount} alerte{alertCount !== 1 ? "s" : ""}</span>
                    </div>
                    {isLoading ? (
                      <div className="db-empty">Chargement...</div>
                    ) : alertCount === 0 ? (
                      <div className="db-alerts-empty">Aucune alerte pour le moment</div>
                    ) : (
                      submittedQuotes.filter((q) => q.status === "sent" || q.status === "production" || q.status === "needs_info").slice(0, 8).map((q) => (
                        <div className="db-alert-row" key={q.id}>
                          <div className="db-alert-dot" style={{ background: q.status === "production" ? "var(--warn)" : q.status === "needs_info" ? "var(--gold)" : "var(--gold-dim)" }} />
                          <div>
                            <div className="db-alert-text">{q.status === "production" ? "En production" : q.status === "needs_info" ? "À préciser" : "Devis envoyé"}</div>
                            <div className="db-alert-desc">{q.name} — {q.message?.slice(0, 100)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="db-sidebar">
                  <div className="db-activity">
                    <h2>Activité</h2>
                    {isLoading ? (
                      <p style={{ color: "var(--text-faint)", fontSize: 12 }}>Chargement...</p>
                    ) : recentItems.length === 0 ? (
                      <p style={{ color: "var(--text-faint)", fontSize: 12 }}>Aucune activité récente</p>
                    ) : (
                      <div className="db-timeline">
                        {recentItems.slice(0, 6).map((item, idx) => (
                          <div className="db-tl-item" key={idx}>
                            <div className="db-tl-dot" />
                            <div className="db-tl-date">{formatDate(item.date)}</div>
                            <div className="db-tl-label">{item.label}</div>
                            <div className="db-tl-detail">{item.detail}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="db-docs">
                    <h2>Documents</h2>
                    <p>Aucun document pour le moment</p>
                    <button className="db-docs-btn" disabled>Accéder aux archives</button>
                  </div>
                </div>
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
          open={!!pendingDelete}
          title="Supprimer ce brouillon ?"
          message="Cette action est définitive. Le brouillon sera supprimé de votre espace."
          confirmLabel="Supprimer"
          tone="danger"
          loading={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => pendingDelete && deleteDraft(pendingDelete)}
        />

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
