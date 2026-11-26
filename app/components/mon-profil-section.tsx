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
/* ============================================================
   JMR Textile — Espace personnel · direction "Sombre premium"
   ============================================================ */
:root{
  --bg:#0B1119;
  --card:#111926;
  --card-border:rgba(234,161,0,.14);
  --card-line:rgba(234,161,0,.08);
  --input-bg:#0E1621;
  --gold:#EAA100;
  --gold-light:#F2B632;
  --gold-dim:rgba(234,161,0,.45);
  --gold-text:rgba(234,161,0,.68);
  --text-cream:#F7F1E6;
  --text-muted:#A9B2BF;
  --text-faint:#8692A1;
  --warn:#E08B52;
  --warn-bg:rgba(224,139,82,.09);
  --good:#6FA8A0;
  --good-bg:rgba(111,168,160,.09);
  --font-serif:var(--font-brand),var(--font-noto-serif),Georgia,serif;
  --font-mono:var(--font-jbmono),'IBM Plex Mono',monospace;
  --font-body:var(--font-inter),var(--font-ibm-plex-sans),system-ui,sans-serif;
}
.dsh-root,.dsh-root *{box-sizing:border-box;margin:0;padding:0;}

/* Coque et atmosphère */
.dsh-root{
  min-height:100vh;
  color:var(--text-cream);
  font-family:var(--font-body);
  font-size:14px;line-height:1.55;
  -webkit-font-smoothing:antialiased;
  background:
    radial-gradient(1200px 620px at 88% -10%,rgba(234,161,0,.055),transparent 62%),
    radial-gradient(980px 540px at -14% 96%,rgba(111,168,160,.04),transparent 60%),
    linear-gradient(180deg,#0B1119 0%,#0D1420 46%,#121A26 100%);
}
.dsh-root button,.dsh-root input,.dsh-root select{font-family:inherit;}
.dsh-container{width:100%;max-width:1180px;margin:0 auto;padding:0 44px;}
@media(max-width:820px){.dsh-container{padding:0 20px;}}

/* Mât de tête */
.dsh-masthead{border-bottom:1px solid var(--card-line);background:linear-gradient(180deg,rgba(234,161,0,.03),transparent);}
.dsh-masthead-inner{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;padding:44px 0 34px;}
.dsh-eyebrow,.dsh-micro{display:flex;align-items:center;gap:12px;text-transform:uppercase;letter-spacing:.24em;font-size:10px;font-weight:700;color:var(--gold-text);}
.dsh-eyebrow-rule{display:inline-block;width:26px;height:1px;background:var(--gold);}
.dsh-title{font-family:var(--font-serif);font-weight:500;font-size:clamp(32px,4.4vw,46px);line-height:1.12;letter-spacing:-.02em;color:var(--text-cream);margin-top:14px;}
.dsh-subtitle{margin-top:12px;color:var(--text-muted);font-size:14px;}
.dsh-btn-primary{
  display:inline-flex;align-items:center;justify-content:center;gap:10px;
  background:var(--gold);color:#131B28;border:1px solid var(--gold);border-radius:4px;
  padding:13px 20px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;
  text-decoration:none;cursor:pointer;white-space:nowrap;
  transition:background .2s,transform .2s,box-shadow .2s;
}
.dsh-btn-primary:hover{background:var(--gold-light);transform:translateY(-1px);box-shadow:0 10px 28px rgba(234,161,0,.18);}
.dsh-btn-primary:active{transform:translateY(0);}
.dsh-btn-primary svg{width:15px;height:15px;}
.dsh-btn-ghost,.dsh-text-link{
  display:inline-flex;align-items:center;gap:7px;background:none;border:0;color:var(--gold);
  font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
  cursor:pointer;text-decoration:none;padding:4px 0;
}
.dsh-btn-ghost svg,.dsh-text-link svg{width:13px;height:13px;transition:transform .2s;}
.dsh-btn-ghost:hover,.dsh-text-link:hover{color:var(--gold-light);}
.dsh-root :focus-visible{outline:2px solid var(--gold);outline-offset:3px;}

/* Contenu */
.dsh-main{padding-top:34px;padding-bottom:12px;}
.dsh-error{border:1px solid rgba(224,139,82,.35);background:rgba(224,139,82,.07);border-radius:10px;padding:16px 18px;color:#F0A778;font-size:13px;margin-bottom:28px;}
.dsh-loading{padding:34px 24px;text-align:center;color:var(--text-faint);font-size:12px;letter-spacing:.04em;}

/* État vide */
.dsh-empty-hero{text-align:center;padding:80px 20px 96px;}
.dsh-empty-seal{width:74px;height:74px;margin:0 auto 28px;display:grid;place-items:center;border:1px solid var(--card-border);border-radius:50%;background:radial-gradient(circle,rgba(234,161,0,.09),transparent 70%);}
.dsh-empty-seal svg{width:30px;height:30px;color:var(--gold);}
.dsh-empty-hero h2{font-family:var(--font-serif);font-weight:500;font-size:28px;color:var(--text-cream);margin-bottom:12px;}
.dsh-empty-hero p{color:var(--text-muted);font-size:14px;max-width:460px;margin:0 auto 30px;line-height:1.7;}

/* Registre de statut — pièce signature */
.dsh-ledger{
  position:relative;overflow:hidden;display:flex;gap:24px;align-items:flex-start;
  border:1px solid var(--card-border);border-left:2px solid var(--gold);border-radius:14px;
  background:linear-gradient(135deg,rgba(234,161,0,.055),transparent 42%),var(--card);
  padding:28px 32px 24px;margin-bottom:26px;
  box-shadow:0 18px 44px rgba(0,0,0,.16);
}
.dsh-ledger::before{
  content:"";position:absolute;right:22px;bottom:20px;width:36px;height:36px;
  border-right:1px solid var(--gold-dim);border-bottom:1px solid var(--gold-dim);
  opacity:.5;pointer-events:none;
}
.dsh-ledger::after{
  content:"";position:absolute;right:0;top:0;width:160px;height:160px;
  background:radial-gradient(circle at 100% 0%,rgba(234,161,0,.07),transparent 70%);
  pointer-events:none;
}
.dsh-ledger-mark{flex:none;width:48px;height:48px;display:grid;place-items:center;border:1px solid var(--card-border);border-radius:10px;background:rgba(234,161,0,.06);color:var(--gold);}
.dsh-ledger-mark svg{width:20px;height:20px;}
.dsh-ledger-body{flex:1;min-width:0;}
.dsh-ledger-eyebrow{display:flex;align-items:center;gap:10px;text-transform:uppercase;letter-spacing:.22em;font-size:10px;font-weight:700;color:var(--gold);}
.dsh-ledger-eyebrow i{display:inline-block;width:18px;height:1px;background:var(--gold);}
.dsh-ledger h2{font-family:var(--font-serif);font-weight:500;font-size:clamp(20px,2.6vw,27px);line-height:1.25;color:var(--text-cream);margin:12px 0 10px;}
.dsh-ledger p{color:var(--text-muted);font-size:13.5px;line-height:1.7;max-width:720px;}
.dsh-ledger p strong{color:var(--gold);font-family:var(--font-mono);font-size:12px;font-weight:600;}
.dsh-ledger p b{color:var(--text-cream);font-weight:600;}
.dsh-ledger-rule{margin-top:22px;max-width:560px;}
.dsh-ledger-rail{position:relative;height:1px;background:rgba(234,161,0,.16);}
.dsh-ledger-rail em{position:absolute;left:0;top:-1px;height:2px;width:34%;background:var(--gold);}
.dsh-ledger-rail em::after{content:"";position:absolute;right:-3px;top:-2px;width:6px;height:6px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 4px rgba(234,161,0,.12);}
.dsh-ledger-ticks{display:flex;justify-content:space-between;margin-top:9px;text-transform:uppercase;letter-spacing:.16em;font-size:9px;color:var(--text-faint);}
.dsh-ledger-ticks span:first-child{color:var(--gold-text);}

/* Cartes de synthèse */
.dsh-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:30px;}
@media(max-width:960px){.dsh-stats{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:520px){.dsh-stats{gap:12px;}}
.dsh-stat{
  position:relative;overflow:hidden;border:1px solid var(--card-border);border-radius:14px;
  background:linear-gradient(160deg,rgba(255,255,255,.025),rgba(255,255,255,0)),var(--card);
  padding:20px;min-height:132px;transition:border-color .2s,transform .2s;
}
.dsh-stat:hover{border-color:rgba(234,161,0,.3);transform:translateY(-2px);}
.dsh-stat::after{content:"";position:absolute;left:20px;right:20px;bottom:0;height:1px;background:linear-gradient(90deg,var(--gold-dim),transparent);opacity:.35;}
.dsh-stat-icon{width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--card-border);border-radius:8px;background:rgba(234,161,0,.05);color:var(--gold);}
.dsh-stat-icon svg{width:17px;height:17px;}
.dsh-stat-label{display:block;margin-top:16px;text-transform:uppercase;letter-spacing:.14em;font-size:9.5px;font-weight:700;color:var(--text-faint);}
.dsh-stat-number{font-family:var(--font-serif);font-size:34px;line-height:1.1;color:var(--text-cream);margin:4px 0 7px;font-variant-numeric:tabular-nums;}
.dsh-stat-detail{display:block;font-size:11px;color:var(--text-muted);line-height:1.45;}

/* Grille de panneaux */
.dsh-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:24px;align-items:start;}
@media(max-width:980px){.dsh-layout{grid-template-columns:1fr;}}
.dsh-col{display:flex;flex-direction:column;gap:22px;min-width:0;}
.dsh-panel{
  border:1px solid var(--card-border);border-radius:16px;overflow:hidden;
  background:linear-gradient(180deg,rgba(255,255,255,.018),transparent 120px),var(--card);
  box-shadow:0 14px 36px rgba(0,0,0,.12);
}
.dsh-panel-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:22px 24px 18px;border-bottom:1px solid var(--card-line);}
.dsh-panel-head h2{font-family:var(--font-serif);font-weight:500;font-size:20px;letter-spacing:-.01em;color:var(--text-cream);}
.dsh-panel-head p{margin-top:5px;font-size:11px;color:var(--text-faint);}
.dsh-panel-intro{padding:16px 24px 0;font-size:12px;color:var(--text-muted);line-height:1.6;}
.dsh-drafts-inner{padding:20px;}

/* Intégration ciblée du widget BrouillonsClient — composant enfant inchangé */
.dsh-drafts-inner [class*="font-headline"]{font-family:var(--font-serif)!important;}
.dsh-drafts-inner [class*="font-mono"]{font-family:var(--font-mono)!important;}
.dsh-drafts-inner [class*="bg-[#1e2a38]"],
.dsh-drafts-inner [class*="bg-[#1E2A38]"]{background:var(--input-bg)!important;}
.dsh-drafts-inner [class*="border-[#EAA100]"]{border-color:var(--card-border)!important;}
.dsh-drafts-inner [class*="hover:border-[#EAA100]"]:hover{border-color:var(--gold-dim)!important;}
.dsh-drafts-inner [class*="text-[#FFF8EC]"]{color:var(--text-cream)!important;}
.dsh-drafts-inner [class*="text-[#8B94A3]"]{color:var(--text-muted)!important;}
.dsh-drafts-inner [class*="text-[#F3A3A6]"]{color:var(--warn)!important;}
.dsh-drafts-inner [class*="border-[#E05252]"]{border-color:rgba(224,139,82,.38)!important;}
.dsh-drafts-inner [class*="hover:bg-[#E05252]"]:hover{background:var(--warn-bg)!important;}
.dsh-drafts-inner [class*="text-[#EAA100]"]{color:var(--gold)!important;}
.dsh-drafts-inner [class*="text-[#EAA100]/"]{color:var(--gold-text)!important;}
.dsh-drafts-inner [class*="text-[#EAA100]/20"]{color:rgba(234,161,0,.38)!important;}
.dsh-drafts-inner [class*="text-[#EAA100]/40"]{color:var(--text-faint)!important;}
.dsh-drafts-inner [class*="placeholder:text-"]::placeholder{color:var(--text-faint)!important;}
.dsh-drafts-inner [class*="hover:bg-[#EAA100]"]:hover{background:var(--gold-light)!important;border-color:var(--gold-light)!important;}
.dsh-drafts-inner [class*="bg-[#0A0E19]"]{background:rgba(5,9,14,.82)!important;backdrop-filter:blur(5px)!important;}
.dsh-drafts-inner [class*="bg-[#161D30]"]{background:var(--card)!important;border-color:var(--card-border)!important;border-radius:16px!important;}

/* Lignes de devis */
.dsh-quote-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 24px;border-bottom:1px solid var(--card-line);}
.dsh-quote-row:last-child{border-bottom:0;}
.dsh-quote-main{min-width:0;flex:1;}
.dsh-quote-title{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.dsh-quote-title strong{font-size:14px;font-weight:600;color:var(--text-cream);}
.dsh-status{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid var(--card-line);border-radius:3px;text-transform:uppercase;letter-spacing:.08em;font-size:9px;font-weight:700;}
.dsh-status .dsh-dot{width:6px;height:6px;border-radius:50%;}
.dsh-quote-meta{margin-top:7px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11px;color:var(--text-faint);}
.dsh-quote-meta b{color:var(--text-muted);font-family:var(--font-mono);font-weight:500;}
.dsh-quote-meta i{width:3px;height:3px;border-radius:50%;background:var(--text-faint);opacity:.7;}
.dsh-progress{display:flex;align-items:center;gap:12px;margin-top:13px;max-width:340px;}
.dsh-progress > span{font-size:9.5px;text-transform:uppercase;letter-spacing:.12em;color:var(--text-faint);white-space:nowrap;}
.dsh-progress > i{flex:1;height:3px;border-radius:2px;background:rgba(234,161,0,.1);overflow:hidden;display:block;}
.dsh-progress > i em{display:block;height:100%;background:linear-gradient(90deg,var(--gold-dim),var(--gold));}
.dsh-progress > b{font-family:var(--font-mono);font-size:10px;color:var(--gold);font-weight:600;min-width:30px;text-align:right;}
.dsh-deadline{margin-top:8px;font-family:var(--font-mono);font-size:10px;color:var(--text-muted);}
.dsh-deadline.urgent{color:var(--warn);}
.dsh-deadline.expired{color:#E07A6A;}

/* Actions */
.dsh-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end;}
.dsh-btn-action{
  display:inline-flex;align-items:center;gap:7px;border:1px solid var(--card-border);border-radius:6px;
  background:rgba(255,255,255,.015);color:var(--text-cream);padding:9px 13px;
  font-size:11px;font-weight:600;text-decoration:none;cursor:pointer;transition:.18s;white-space:nowrap;
}
.dsh-btn-action:hover{border-color:var(--gold-dim);background:rgba(234,161,0,.05);color:var(--gold);}
.dsh-btn-action svg{width:13px;height:13px;}
.dsh-btn-action-danger{color:var(--warn);}
.dsh-btn-action-danger:hover{border-color:rgba(224,139,82,.45);background:var(--warn-bg);color:#F0A778;}

/* État vide dans un panneau */
.dsh-empty-state{
  width:calc(100% - 48px);margin:22px 24px;padding:34px 20px;
  border:1px dashed rgba(234,161,0,.22);border-radius:12px;background:rgba(234,161,0,.018);
  display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;cursor:pointer;transition:.2s;
}
.dsh-empty-state:hover{border-color:var(--gold-dim);background:rgba(234,161,0,.04);}
.dsh-empty-state svg{width:26px;height:26px;color:var(--gold);opacity:.8;}
.dsh-empty-state strong{font-family:var(--font-serif);font-size:16px;font-weight:500;color:var(--text-cream);}
.dsh-empty-state > span{font-size:11.5px;color:var(--text-muted);max-width:360px;line-height:1.6;}
.dsh-cta-line{margin-top:6px;display:inline-flex;align-items:center;gap:6px;color:var(--gold)!important;text-transform:uppercase;letter-spacing:.1em;font-size:10px;font-weight:700;}
.dsh-cta-line svg{width:13px!important;height:13px!important;}

/* Alertes */
.dsh-alert-row{display:flex;gap:13px;padding:16px 24px;border-bottom:1px solid var(--card-line);}
.dsh-alert-row:last-child{border-bottom:0;}
.dsh-alert-dot{width:7px;height:7px;border-radius:50%;flex:none;margin-top:6px;}
.dsh-alert-text{font-size:12.5px;font-weight:600;color:var(--text-cream);}
.dsh-alert-desc{margin-top:3px;font-size:11.5px;color:var(--text-muted);line-height:1.5;}
.dsh-alerts-empty{padding:34px 24px;text-align:center;color:var(--text-faint);font-size:12px;}

/* Historique */
.dsh-timeline{padding:8px 24px 4px;}
.dsh-timeline-item{position:relative;display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--card-line);}
.dsh-timeline-item:last-child{border-bottom:0;}
.dsh-timeline-item::before{content:"";position:absolute;left:4px;top:24px;bottom:-14px;width:1px;background:var(--card-line);}
.dsh-timeline-item:last-child::before{display:none;}
.dsh-timeline-dot{position:relative;z-index:1;width:9px;height:9px;border-radius:50%;flex:none;margin-top:5px;border:2px solid var(--gold);background:var(--card);}
.dsh-timeline-item small{display:block;font-family:var(--font-mono);font-size:9.5px;color:var(--text-faint);letter-spacing:.04em;margin-bottom:5px;}
.dsh-timeline-item strong{display:block;font-size:12.5px;font-weight:600;color:var(--text-cream);}
.dsh-timeline-item strong a{color:inherit;text-decoration:none;border-bottom:1px solid var(--gold-dim);padding-bottom:1px;}
.dsh-timeline-item strong a:hover{color:var(--gold);}
.dsh-timeline-item span{display:block;margin-top:3px;font-size:11.5px;color:var(--text-muted);line-height:1.5;}
.dsh-timeline-more{padding:0 24px 18px;}

/* Documents */
.dsh-doc-kinds{padding:12px 24px 0;text-transform:uppercase;letter-spacing:.14em;font-size:9px;font-weight:700;color:var(--gold-text);}
.dsh-doc-types{padding:12px 24px 20px;display:flex;flex-direction:column;gap:8px;}
.dsh-doc-types > div,.dsh-doc-types > a{display:flex;align-items:center;gap:11px;padding:11px 12px;border:1px solid var(--card-line);border-radius:8px;background:rgba(255,255,255,.014);text-decoration:none;color:inherit;transition:.2s;}
.dsh-doc-types > a:hover{border-color:var(--gold-dim);background:rgba(234,161,0,.04);}
.dsh-doc-types > div > svg,.dsh-doc-types > a > svg{width:16px;height:16px;color:var(--gold);flex:none;}
.dsh-doc-copy{display:flex;flex-direction:column;gap:3px;min-width:0;}
.dsh-doc-types b{font-size:11px;font-weight:600;color:var(--text-cream);}
.dsh-doc-types small{font-size:10px;color:var(--text-faint);}
.dsh-doc-icon{width:30px;height:34px;display:grid;place-items:center;flex:none;border:1px solid var(--card-border);border-radius:5px;background:rgba(234,161,0,.06);color:var(--gold);font-family:var(--font-mono);font-size:8px;font-weight:700;letter-spacing:.04em;}
.dsh-doc-name{display:block;font-size:11px;font-weight:600;color:var(--text-cream);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsh-doc-meta{display:block;font-size:9.5px;color:var(--text-faint);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsh-docs-empty{margin:0 24px 22px;padding:22px 16px;border:1px dashed rgba(234,161,0,.2);border-radius:10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;}
.dsh-docs-empty svg{width:22px;height:22px;color:var(--text-faint);}
.dsh-docs-empty strong{font-size:11.5px;color:var(--text-muted);}
.dsh-docs-empty span{font-size:10.5px;color:var(--text-faint);line-height:1.5;}

/* Pied de page */
.dsh-footer{border-top:1px solid var(--card-line);padding:28px 0 54px;text-align:center;}
.dsh-footer p{font-size:11px;color:var(--text-faint);letter-spacing:.02em;}
.dsh-footer p + p{margin-top:8px;}
.dsh-footer .dsh-creed{font-family:var(--font-serif);font-size:11px;color:var(--gold-text);letter-spacing:.2em;text-transform:uppercase;}

/* Modale */
.dsh-modal-overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;background:rgba(5,9,14,.82);backdrop-filter:blur(5px);padding:16px;}
@media(min-width:640px){.dsh-modal-overlay{align-items:center;}}
.dsh-modal{width:100%;max-width:540px;background:var(--card);border:1px solid var(--card-border);border-radius:16px;padding:30px;box-shadow:0 30px 80px rgba(0,0,0,.55);}
.dsh-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding-bottom:18px;border-bottom:1px solid var(--card-line);margin-bottom:18px;}
.dsh-modal-label{font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-faint);font-weight:700;}
.dsh-modal-head h3{font-family:var(--font-serif);font-weight:500;font-size:24px;color:var(--text-cream);margin-top:7px;}
.dsh-modal-close{background:none;border:0;color:var(--text-faint);cursor:pointer;padding:4px;transition:.2s;}
.dsh-modal-close:hover{color:var(--gold);}
.dsh-modal-close svg{width:18px;height:18px;}
.dsh-modal-row{margin-bottom:14px;}
.dsh-modal-row .dsh-modal-label{display:block;margin-bottom:5px;}
.dsh-modal-value{font-size:13px;color:var(--text-cream);line-height:1.6;}
.dsh-modal-value.muted{color:var(--text-muted);}
.dsh-modal-grid{display:flex;gap:32px;flex-wrap:wrap;}
.dsh-modal-actions{margin-top:20px;padding-top:18px;border-top:1px solid var(--card-line);}
.dsh-modal-actions p{font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:12px;}
.dsh-modal-actions p.expired{color:#E07A6A;}
.dsh-modal-actions p.urgent{color:var(--warn);}
.dsh-modal-actions p.normal{color:var(--text-faint);}
.dsh-modal-btn{width:100%;padding:13px;border:1px solid var(--gold);border-radius:6px;background:var(--gold);color:#131B28;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:.2s;}
.dsh-modal-btn:hover{background:var(--gold-light);}

/* Entrée en scène discrète */
@keyframes dsh-rise{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.dsh-ledger,.dsh-stat,.dsh-panel{animation:dsh-rise .5s ease both;}
.dsh-stat:nth-child(2){animation-delay:.06s;}
.dsh-stat:nth-child(3){animation-delay:.12s;}
.dsh-stat:nth-child(4){animation-delay:.18s;}
@media(prefers-reduced-motion:reduce){.dsh-ledger,.dsh-stat,.dsh-panel{animation:none;}}

/* Adaptation mobile */
@media(max-width:640px){
  .dsh-masthead-inner{padding:32px 0 26px;align-items:flex-start;}
  .dsh-btn-primary{width:100%;}
  .dsh-ledger{padding:22px 20px;gap:14px;}
  .dsh-ledger-mark{width:38px;height:38px;}
  .dsh-ledger h2{font-size:21px;}
  .dsh-stat{min-height:118px;padding:16px;}
  .dsh-stat-number{font-size:28px;}
  .dsh-quote-row{flex-direction:column;align-items:stretch;}
  .dsh-actions{justify-content:flex-start;}
  .dsh-panel-head{padding:18px 18px 14px;}
  .dsh-timeline,.dsh-doc-types{padding-left:18px;padding-right:18px;}
}
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
  const [quoteAction, setQuoteAction] = useState<{ quote: QuoteRecord; action: "cancel" | "delete" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
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
      <section className="dsh-root">
        <style>{globalStyles}</style>

        <header className="dsh-masthead">
          <div className="dsh-container">
            <div className="dsh-masthead-inner">
              <div>
                <div className="dsh-eyebrow"><span className="dsh-eyebrow-rule" />Espace personnel</div>
                <h1 className="dsh-title">Tableau de bord</h1>
                <p className="dsh-subtitle">Bienvenue dans votre atelier numérique.</p>
              </div>
              <Link href="/demande-devis" className="dsh-btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5V19M5 12H19" /></svg>
                Nouveau devis
              </Link>
            </div>
          </div>
        </header>

        <main className="dsh-container dsh-main">
          {error && (
            <div className="dsh-error" role="alert">{error}</div>
          )}

          {!hasData && !isLoading ? (
            <div className="dsh-empty-hero">
              <div className="dsh-empty-seal" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
              </div>
              <h2>Pas encore de demande</h2>
              <p>Vous n&apos;avez pas encore soumis de demande de devis. Commencez dès maintenant pour suivre vos projets textile.</p>
              <Link href="/demande-devis" className="dsh-btn-primary">Faire un devis</Link>
            </div>
          ) : (
            <>
              {latestPendingQuote && (
                <section className="dsh-ledger" aria-label="Demande en attente">
                  <div className="dsh-ledger-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></svg>
                  </div>
                  <div className="dsh-ledger-body">
                    <div className="dsh-ledger-eyebrow"><i />Demande en attente</div>
                    <h2>Votre demande a bien été reçue.</h2>
                    <p>
                      Demande <strong>#{quoteShortId(latestPendingQuote.id)}</strong> — {latestPendingQuote.name ? `${latestPendingQuote.name} envoyée` : "envoyée"} le {formatDate(latestPendingQuote.created_at ?? "")}.
                      Notre équipe vous répondra sous <b>2 à 3 jours ouvrés.</b>
                    </p>
                    <div className="dsh-ledger-rule" aria-hidden="true">
                      <div className="dsh-ledger-rail"><em /></div>
                      <div className="dsh-ledger-ticks"><span>Réception</span><span>Étude</span><span>Réponse</span></div>
                    </div>
                  </div>
                </section>
              )}

              <div className="dsh-stats" aria-label="Résumé de l'activité">
                {[
                  { label: "Commandes en cours", value: String(activeCommandes.length).padStart(2, "0"), detail: activeCommandes.length > 0 ? `${activeCommandes[0].numero} — ${activeCommandes[0].statut_production}` : "Aucune commande active", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01M17 12h.01M7 12h.01" /></svg> },
                  { label: "Brouillons", value: String(draftCount).padStart(2, "0"), detail: draftCount > 0 ? `${draftCount} devis non envoyé${draftCount > 1 ? "s" : ""} à finaliser` : "Aucun brouillon", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> },
                  { label: "Notifications", value: String(alertCount).padStart(2, "0"), detail: alertCount > 0 ? `${alertCount} devis nécessitant votre attention` : "Aucune notification", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg> },
                  { label: "Points fidélité", value: pointsSolde === null ? ".." : pointsSolde.toLocaleString("fr-FR"), detail: pointsSolde === null ? "Programme fidélité" : "1 FCFA dépensé = 1 point", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg> },
                ].map((m, i) => (
                  <article className="dsh-stat" key={i}>
                    <span className="dsh-stat-icon">{m.icon}</span>
                    <div>
                      <span className="dsh-stat-label">{m.label}</span>
                      <div className="dsh-stat-number">{isLoading ? ".." : m.value}</div>
                      <span className="dsh-stat-detail">{m.detail}</span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="dsh-layout">
                <div className="dsh-col">
                  <section className="dsh-panel">
                    <div className="dsh-drafts-inner"><BrouillonsClient onCountChange={setDraftCount} /></div>
                  </section>

                  <section className="dsh-panel">
                    <div className="dsh-panel-head">
                      <div><h2>Mes devis</h2><p>{totalRows} devis actif{totalRows > 1 ? "s" : ""}</p></div>
                      <button className="dsh-btn-ghost" onClick={() => setShowAllQuotes((v) => !v)}>
                        {showAllQuotes ? "Voir moins" : "Voir tout"}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                      </button>
                    </div>
                    {isLoading ? (
                      <div className="dsh-loading">Chargement...</div>
                    ) : totalRows === 0 ? (
                      <button className="dsh-empty-state" onClick={() => window.location.assign("/demande-devis")}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                        <strong>Aucun devis pour l&apos;instant</strong>
                        <span>Vos demandes envoyées apparaîtront ici dès que vous les soumettrez.</span>
                        <span className="dsh-cta-line">Nouvelle demande de devis
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
                            <div className="dsh-quote-row" key={q.id}>
                              <div className="dsh-quote-main">
                                <div className="dsh-quote-title">
                                  <strong>{q.name ?? "Client"}</strong>
                                  <span className="dsh-status" style={{ background: `${tone}18`, color: tone }}>
                                    <span className="dsh-dot" style={{ background: tone }} />
                                    {quoteStatusLabel(q.status)}
                                  </span>
                                </div>
                                <p className="dsh-quote-meta">
                                  Devis <b>#{quoteShortId(q.id)}</b><i />
                                  {qty ?? "Quantité à préciser"}<i />
                                  {q.tissu ?? "Matière à préciser"}
                                </p>
                                <div className="dsh-progress">
                                  <span>Avancement</span>
                                  <i><em style={{ width: `${pct}%` }} /></i>
                                  <b>{pct}%</b>
                                </div>
                                {q.status === "sent" && (() => {
                                  const cd = confirmationCountdown(q.confirmation_deadline);
                                  if (!cd) return null;
                                  return <div className={`dsh-deadline ${cd.expired ? "expired" : cd.urgent ? "urgent" : ""}`}>{cd.expired ? "Délai expiré" : `Confirmer dans ${cd.text}`}</div>;
                                })()}
                              </div>
                              <div className="dsh-actions">
                                <Link href={`/mon-profil/devis/detail?id=${q.id}`} className="dsh-btn-action">
                                  Ouvrir
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                                </Link>
                                {["pending", "needs_info", "rejected", "expired"].includes(q.status ?? "") && (
                                  <button className="dsh-btn-action dsh-btn-action-danger" onClick={() => setQuoteAction({ quote: q, action: "cancel" })}>
                                    Annuler
                                  </button>
                                )}
                                {["draft", "sent", "rejected", "expired"].includes(q.status ?? "") && (
                                  <button className="dsh-btn-action dsh-btn-action-danger" onClick={() => setQuoteAction({ quote: q, action: "delete" })}>
                                    Supprimer
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {hasMoreRows && (
                          <button className="dsh-btn-ghost" style={{ margin: "6px 24px 18px" }} onClick={() => setShowAllQuotes((v) => !v)}>
                            Voir plus ({totalRows - 5} autres)
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showAllQuotes ? "rotate(180deg)" : undefined, transition: "transform .2s" }}><path d="M6 9L12 15L18 9" /></svg>
                          </button>
                        )}
                      </>
                    )}
                  </section>

                  <section className="dsh-panel">
                    <div className="dsh-panel-head"><div><h2>Dernières alertes</h2><p>{alertCount} alerte{alertCount !== 1 ? "s" : ""}</p></div></div>
                    {isLoading ? (
                      <div className="dsh-loading">Chargement...</div>
                    ) : alertCount === 0 ? (
                      <div className="dsh-alerts-empty">Aucune alerte pour le moment</div>
                    ) : (
                      <div>
                        {submittedQuotes.filter((q) => q.status === "sent" || q.status === "production" || q.status === "needs_info").slice(0, 8).map((q) => (
                          <div className="dsh-alert-row" key={q.id}>
                            <div className="dsh-alert-dot" style={{ background: q.status === "production" ? "var(--warn)" : q.status === "needs_info" ? "var(--gold)" : "var(--gold-dim)" }} />
                            <div>
                              <div className="dsh-alert-text">{q.status === "production" ? "En production" : q.status === "needs_info" ? "À préciser" : "Devis envoyé"}</div>
                              <div className="dsh-alert-desc">{q.name} — {q.message?.slice(0, 100)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                <aside className="dsh-col">
                  <section className="dsh-panel">
                    <div className="dsh-panel-head"><div><h2>Historique</h2></div></div>
                    <p className="dsh-panel-intro">Tout ce que vous avez fait : demandes, devis reçus, confirmations et commandes.</p>
                    {isLoading ? (
                      <p className="dsh-loading">Chargement...</p>
                    ) : historyItems.length === 0 ? (
                      <p className="dsh-loading">Aucune activité pour le moment</p>
                    ) : (
                      <>
                        <div className="dsh-timeline">
                          {activitySlice.map((item) => (
                            <div className="dsh-timeline-item" key={item.key}>
                              <div className="dsh-timeline-dot" style={{ borderColor: item.tone }} />
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
                          <div className="dsh-timeline-more">
                            <button className="dsh-text-link" onClick={() => setShowAllActivity(!showAllActivity)}>
                              {showAllActivity ? "Voir moins" : `Voir l'historique (${historyItems.length - 6} autres)`}
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </section>

                  <section className="dsh-panel">
                    <div className="dsh-panel-head">
                      <div><h2>Documents</h2><p>Vos fichiers officiels</p></div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" style={{ width: 19, height: 19 }}><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                    </div>
                    <p className="dsh-panel-intro">Retrouvez ici les PDF transmis par notre atelier.</p>
                    <p className="dsh-doc-kinds">PDF · Devis validés · Bons de commande</p>
                    {documents.length === 0 ? (
                      <div className="dsh-docs-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                        <strong>Aucun document disponible</strong>
                        <span>Les PDF apparaîtront ici dès qu&apos;ils seront transmis par l&apos;atelier.</span>
                      </div>
                    ) : (
                      <div className="dsh-doc-types" style={{ paddingTop: 6 }}>
                        {documents.slice(0, 12).map((document) => {
                          const content = <><span className="dsh-doc-icon">{document.kind === "pdf" ? "PDF" : document.kind === "devis" ? "DEV" : "BC"}</span><span className="dsh-doc-copy"><b className="dsh-doc-name">{document.label}</b><small className="dsh-doc-meta">{document.detail}{document.date ? ` · ${formatDate(document.date)}` : ""}</small></span></>;
                          return document.href ? (
                            <a className="dsh-doc-row" href={document.href} key={document.id} target={document.href.startsWith("http") ? "_blank" : undefined} rel={document.href.startsWith("http") ? "noreferrer" : undefined}>{content}</a>
                          ) : <div className="dsh-doc-row" key={document.id}>{content}</div>;
                        })}
                      </div>
                    )}
                  </section>
                </aside>
              </div>
            </>
          )}
        </main>

        <footer className="dsh-container">
          <div className="dsh-footer">
            <p>© 2026 JMR Textile Atelier — Fabrication Madagascar</p>
            <p className="dsh-creed">Fiabilité • Transparence • Qualité</p>
          </div>
        </footer>

        {selectedQuote && (
          <div className="dsh-modal-overlay" role="presentation" onClick={() => setSelectedQuote(null)}>
            <div className="dsh-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <div className="dsh-modal-head">
                <div>
                  <div className="dsh-modal-label">Détail de la demande</div>
                  <h3>{quoteReference(selectedQuote)}</h3>
                </div>
                <button className="dsh-modal-close" onClick={() => setSelectedQuote(null)} aria-label="Fermer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="dsh-modal-row">
                <div className="dsh-modal-label">Statut</div>
                <div className="dsh-modal-value" style={{ fontWeight: 700 }}>{quoteStatusLabel(selectedQuote.status)}</div>
              </div>
              <div className="dsh-modal-row">
                <div className="dsh-modal-label">Demande</div>
                <div className="dsh-modal-value muted" style={{ maxHeight: 140, overflowY: "auto" }}>{selectedQuote.message || "Aucun détail complémentaire."}</div>
              </div>
              <div className="dsh-modal-grid">
                <div className="dsh-modal-row">
                  <div className="dsh-modal-label">Envoyée le</div>
                  <div className="dsh-modal-value muted">{formatDate(selectedQuote.created_at ?? "")}</div>
                </div>
                {selectedQuote.amount && (
                  <div className="dsh-modal-row">
                    <div className="dsh-modal-label">Montant</div>
                    <div className="dsh-modal-value muted" style={{ fontFamily: "var(--font-mono)" }}>{Number(selectedQuote.amount).toLocaleString("fr-FR")} Ar</div>
                  </div>
                )}
                {selectedQuote.date_livraison_prevue && (
                  <div className="dsh-modal-row">
                    <div className="dsh-modal-label">Livraison prévue</div>
                    <div className="dsh-modal-value muted">{formatDate(selectedQuote.date_livraison_prevue)}</div>
                  </div>
                )}
              </div>
              {selectedQuote.status === "sent" && (() => {
                const cd = confirmationCountdown(selectedQuote.confirmation_deadline);
                const isExpired = cd?.expired;
                return (
                  <div className="dsh-modal-actions">
                    {cd && (
                      <p className={isExpired ? "expired" : cd.urgent ? "urgent" : "normal"}>
                        {isExpired ? "Le délai de confirmation a expiré" : `Délai de confirmation : ${cd.text}`}
                      </p>
                    )}
                    {!isExpired && (
                      <button className="dsh-modal-btn" onClick={() => setConfirmingQuote(true)}>
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

        <ConfirmDialog
          open={!!quoteAction}
          title={quoteAction?.action === "delete" ? "Supprimer ce devis ?" : "Annuler ce devis ?"}
          message={quoteAction?.action === "delete"
            ? "Le devis sera retiré de votre espace client. Cette action est définitive."
            : "Le devis sera marqué comme annulé et conservé dans votre historique. L'atelier ne le traitera plus."}
          confirmLabel={quoteAction?.action === "delete" ? "Supprimer" : "Annuler le devis"}
          tone="danger"
          loading={actionLoading}
          onCancel={() => setQuoteAction(null)}
          onConfirm={async () => {
            if (!quoteAction) return;
            setActionLoading(true);
            try {
              if (quoteAction.action === "cancel") {
                await authAPI.put(`/quotes/${quoteAction.quote.id}`, { status: "rejected" });
                showToast("Devis annulé.", "success");
              } else {
                await authAPI.delete(`/quotes/${quoteAction.quote.id}`);
                showToast("Devis supprimé.", "success");
              }
              setQuoteAction(null);
              window.location.reload();
            } catch (err) {
              showToast(getErrorMessage(err), "error");
              setQuoteAction(null);
            } finally {
              setActionLoading(false);
            }
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