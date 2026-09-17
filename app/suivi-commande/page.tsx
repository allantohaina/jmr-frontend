"use client";

import React, { useState } from "react";
import Link from "next/link";
import { publicAPI, STATUTS_PRODUCTION, type SuiviCommandeRecord } from "@/app/lib/api";
import { Loader, Search, AlertCircle } from "lucide-react";

const STATUT_INDEX: Record<string, number> = Object.fromEntries(STATUTS_PRODUCTION.map((s, i) => [s, i]));

function formatDateLong(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

function formatDateShort(d: string | null | undefined): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

type TimelineItem = {
  date: string;
  step: string;
  title: string;
  desc: string;
  tag: string;
  tone: "success" | "current" | "warning";
};

function buildTimeline(r: SuiviCommandeRecord): TimelineItem[] {
  const items: TimelineItem[] = [];
  items.push({
    date: formatDateShort(r.date_commande),
    step: "Commande",
    title: "Commande enregistrée",
    desc: `${r.quantite} pièce(s) — ${r.designation || "Confection textile"}.`,
    tag: "EFFECTUÉ",
    tone: "success",
  });
  if (r.statut_production === "Livrée") {
    items.push({
      date: formatDateShort(r.date_livraison_reelle ?? r.date_livraison_prevue),
      step: "Livraison",
      title: "Commande livrée",
      desc: `Livrée le ${formatDateLong(r.date_livraison_reelle ?? r.date_livraison_prevue)}.`,
      tag: "EFFECTUÉ",
      tone: "success",
    });
  } else {
    items.push({
      date: "",
      step: r.statut_production,
      title: `Étape actuelle : ${r.statut_production}`,
      desc:
        r.pieces_produites > 0
          ? `${r.pieces_produites} / ${r.quantite} pièces produites.`
          : "Votre commande avance. Vous serez informé de chaque étape.",
      tag: "EN COURS",
      tone: "current",
    });
  }
  if (r.en_retard) {
    items.push({
      date: "",
      step: "Atelier",
      title: "Léger retard signalé",
      desc: "Cette commande accuse un léger retard. Notre équipe vous contacte.",
      tag: "INFORMATION",
      tone: "warning",
    });
  }
  return items;
}

export default function SuiviCommandePage() {
  const [numero, setNumero] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<SuiviCommandeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setChecked(false);
    try {
      const res = await publicAPI.suiviCommande(numero, email);
      setResult(res.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
      setChecked(true);
    }
  };

  const statutIndex = result ? (STATUT_INDEX[result.statut_production] ?? 0) : 0;
  const progressPct = result ? Math.round(((statutIndex + 1) / STATUTS_PRODUCTION.length) * 100) : 0;
  const timeline = result ? buildTimeline(result) : [];

  return (
    <div className="min-h-screen bg-[#1e2a38] text-[#FFB31B]">
      <style>{resultStyles}</style>
      <header className="border-b border-[#FFB31B]/10">
        <div className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between">
          <Link href="/" className="font-headline text-2xl text-[#FFB31B]">JMR Atelier</Link>
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFB31B]/60 hover:text-[#FFB31B]">← Retour au site</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-headline text-4xl text-[#FFB31B] text-center">Suivi de commande</h1>
        <p className="text-center text-sm text-[#FFB31B]/60 mt-3">
          Retrouvez l&apos;état d&apos;avancement de votre commande en indiquant son numéro et votre email.
        </p>

        <form onSubmit={lookup} className="mt-10 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFB31B]/50">Numéro de commande</label>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="ex : CMD-AB12CD34"
              required
              className="mt-2 w-full rounded-xl border border-[#FFB31B]/20 bg-[#25303a] px-4 py-3 text-sm text-[#FFB31B] placeholder:text-[#FFB31B]/30 focus:border-[#FFB31B] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFB31B]/50">Email utilisé lors de la commande</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              className="mt-2 w-full rounded-xl border border-[#FFB31B]/20 bg-[#25303a] px-4 py-3 text-sm text-[#FFB31B] placeholder:text-[#FFB31B]/30 focus:border-[#FFB31B] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB31B] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1204] hover:brightness-105 disabled:opacity-50"
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Suivre ma commande
          </button>
        </form>

        {error && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#e05252]/30 bg-[#e05252]/10 p-4 text-sm text-[#e05252]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Commande introuvable</p>
              <p className="text-[#e05252]/80 text-xs mt-1">
                Vérifiez le numéro et l&apos;email saisis. Pour toute question, contactez-nous à contact@jmrtextile.com.
              </p>
            </div>
          </div>
        )}

        {checked && !error && !isLoading && !result && (
          <div className="mt-8 text-center text-sm text-[#FFB31B]/50">
            Aucune commande ne correspond à ces informations.
          </div>
        )}
      </main>

      {result && (
        <div className="suivi-scope">
          <main className="suivi-main">
            <div className="breadcrumb">
              <Link href="/">Accueil</Link>
              <span>›</span>
              <span className="breadcrumb-current">Commande #{result.numero}</span>
            </div>

            <section className="page-head">
              <div>
                <p className="eyebrow">Suivi de commande</p>
                <h1>{result.designation || "Confection textile"}</h1>
                <p className="order-description">{result.quantite} pièce(s)</p>
                <p className="order-ref">Référence #{result.numero}</p>
              </div>
              <span className="status">
                <span className="status-dot" />
                {result.statut_production}
              </span>
            </section>

            <div className="layout">
              <div>
                <section className="card progress-card">
                  <div className="progress-head">
                    <div>
                      <p className="progress-label">Étape actuelle</p>
                      <p className="progress-current">{result.statut_production}</p>
                    </div>
                    <div className="progress-percent">{progressPct}%</div>
                  </div>

                  <div className="stepper">
                    <div className="stepper-track" />
                    <div className="stepper-progress" style={{ width: `${Math.max(8, ((statutIndex + 1) / STATUTS_PRODUCTION.length) * 100)}%` }} />
                    {STATUTS_PRODUCTION.map((s, i) => {
                      const done = i < statutIndex;
                      const current = i === statutIndex;
                      return (
                        <div key={s} className={`step${done ? " done" : ""}${current ? " current" : ""}`}>
                          <span className="step-circle">
                            {done ? (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
                            ) : null}
                          </span>
                          <span className="step-name">{s}</span>
                          <span className="step-date">{current ? "En cours" : done ? "Fait" : ""}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="last-update">
                    <div className="update-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></svg>
                    </div>
                    <div>
                      <p className="update-label">DERNIÈRE MISE À JOUR</p>
                      <p className="update-title">Commande {result.numero} — {result.statut_production}</p>
                      <p className="update-text">
                        {result.pieces_produites} / {result.quantite} pièces produites.
                        {result.date_livraison_prevue ? ` Livraison estimée : ${formatDateLong(result.date_livraison_prevue)}.` : ""}
                      </p>
                    </div>
                  </div>
                </section>

                {result.en_retard && (
                  <section className="card action-card">
                    <div className="card-header">
                      <div>
                        <h2 className="card-title">Action requise</h2>
                        <p className="card-subtitle">Votre intervention est nécessaire</p>
                      </div>
                    </div>
                    <div className="action-body">
                      <p className="action-label">Problème signalé</p>
                      <h3 className="action-title">Retard de production</h3>
                      <p className="action-text">
                        Cette commande accuse un léger retard. Notre équipe vous contacte directement.
                      </p>
                      <Link href="/contact" className="btn btn-primary">Contacter l&apos;atelier</Link>
                    </div>
                  </section>
                )}

                <section className="card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">Historique de la commande</h2>
                      <p className="card-subtitle">Toutes les mises à jour communiquées par l&apos;atelier</p>
                    </div>
                  </div>
                  <div className="timeline">
                    {timeline.map((t, i) => (
                      <article key={i} className={`timeline-item ${t.tone}`}>
                        <div className="timeline-date">{t.date}</div>
                        <div className="timeline-marker"><span className="timeline-dot" /></div>
                        <div>
                          <p className="timeline-step">{t.step}</p>
                          <h3 className="timeline-title">{t.title}</h3>
                          <p className="timeline-description">{t.desc}</p>
                          <div className="timeline-meta">
                            <span className={`timeline-tag tag-${t.tone === "success" ? "success" : t.tone === "current" ? "warning" : "warning"}`}>{t.tag}</span>
                            <span>Atelier JMR Textile</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside>
                <section className="card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">Commande</h2>
                      <p className="card-subtitle">Informations générales</p>
                    </div>
                  </div>
                  <div className="info-body">
                    <div className="info-row"><span className="info-label">Référence</span><span className="info-value">#{result.numero}</span></div>
                    <div className="info-row"><span className="info-label">Quantité</span><span className="info-value">{result.quantite} pièces</span></div>
                    <div className="info-row"><span className="info-label">Produit</span><span className="info-value">{result.designation || "—"}</span></div>
                    <div className="info-row"><span className="info-label">Statut</span><span className="info-value">{result.statut_production}</span></div>
                  </div>
                </section>

                <section className="card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">Livraison</h2>
                      <p className="card-subtitle">Estimation actuelle</p>
                    </div>
                  </div>
                  <div className="delivery-body">
                    <p className="delivery-date">{formatDateLong(result.date_livraison_reelle ?? result.date_livraison_prevue)}</p>
                    <div className="delivery-line" />
                    <p className="delivery-text">Cette date peut évoluer selon l&apos;avancement. Vous serez informé automatiquement.</p>
                  </div>
                </section>

                <section className="card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">Besoin d&apos;aide ?</h2>
                      <p className="card-subtitle">Une question sur cette commande ?</p>
                    </div>
                  </div>
                  <div className="response-body">
                    <p className="response-text">Contactez directement l&apos;équipe JMR Textile.</p>
                    <Link href="/contact" className="btn btn-secondary">Contacter l&apos;atelier</Link>
                  </div>
                </section>
              </aside>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

const resultStyles = `
.suivi-scope{
  --navy-950:#0f1826;
  --navy-900:#1b263c;
  --navy-850:#1e2a38;
  --navy-border:#2b3852;
  --gold:#FFB31B;
  --gold-bright:#FFC964;
  --cream:#f3efe4;
  --slate:#8b93a7;
  --slate-dim:#5c6478;
  --green:#5cb87d;
  --orange:#e08b52;
  --red:#e05252;
  --serif:'Fraunces',Georgia,serif;
  --sans:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
  background:var(--navy-950);
  color:var(--cream);
  font-family:var(--sans);
  line-height:1.5;
  border-top:1px solid var(--navy-border);
}
.suivi-scope button{cursor:pointer;}
.suivi-scope a{color:inherit;text-decoration:none;}
.suivi-main{width:min(1120px,calc(100% - 80px));margin:0 auto;padding:38px 0 80px;}
.suivi-scope .breadcrumb{display:flex;align-items:center;gap:8px;margin-bottom:22px;color:var(--slate-dim);font-size:13px;}
.suivi-scope .breadcrumb a:hover{color:var(--cream);}
.suivi-scope .breadcrumb-current{color:var(--slate);}
.suivi-scope .page-head{display:flex;justify-content:space-between;align-items:flex-start;gap:30px;padding-bottom:26px;border-bottom:1px solid var(--navy-border);}
.suivi-scope .eyebrow{margin:0 0 6px;color:var(--gold-bright);font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;}
.suivi-scope h1{margin:0;font-family:var(--serif);font-size:36px;line-height:1.15;font-weight:600;color:var(--cream);}
.suivi-scope .order-description{margin:8px 0 0;color:var(--slate);font-size:14px;}
.suivi-scope .order-ref{margin-top:8px;color:var(--slate-dim);font-family:monospace;font-size:12px;}
.suivi-scope .status{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;color:var(--gold-bright);background:rgba(255,179,27,.14);font-size:12px;font-weight:600;white-space:nowrap;}
.suivi-scope .status-dot{width:7px;height:7px;border-radius:50%;background:currentColor;}
.suivi-scope .layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(280px,.8fr);gap:24px;margin-top:28px;}
.suivi-scope .card{background:var(--navy-850);border:1px solid var(--navy-border);border-radius:11px;margin-top:24px;}
.suivi-scope .card:first-child{margin-top:0;}
.suivi-scope aside .card{margin-top:20px;}
.suivi-scope aside .card:first-child{margin-top:0;}
.suivi-scope .card-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px 17px;border-bottom:1px solid var(--navy-border);}
.suivi-scope .card-title{margin:0;font-family:var(--serif);font-size:19px;font-weight:500;color:var(--cream);}
.suivi-scope .card-subtitle{margin:4px 0 0;color:var(--slate-dim);font-size:12px;}
.suivi-scope .progress-card{padding:25px 24px 27px;}
.suivi-scope .progress-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;}
.suivi-scope .progress-label{margin:0;color:var(--slate);font-size:13px;}
.suivi-scope .progress-current{margin:4px 0 0;color:var(--cream);font-family:var(--serif);font-size:22px;}
.suivi-scope .progress-percent{color:var(--gold-bright);font-family:var(--serif);font-size:25px;}
.suivi-scope .stepper{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:0;}
.suivi-scope .stepper-track{position:absolute;left:12px;right:12px;top:10px;height:2px;background:var(--navy-border);}
.suivi-scope .stepper-progress{position:absolute;left:12px;top:10px;height:2px;background:var(--gold);}
.suivi-scope .step{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;}
.suivi-scope .step-circle{width:21px;height:21px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--navy-850);border:2px solid var(--navy-border);color:var(--navy-950);}
.suivi-scope .step.done .step-circle{background:var(--gold);border-color:var(--gold);}
.suivi-scope .step.current .step-circle{border-color:var(--gold);box-shadow:0 0 0 5px rgba(255,179,27,.15);}
.suivi-scope .step-name{max-width:105px;margin-top:11px;color:var(--slate-dim);font-size:11.5px;line-height:1.35;}
.suivi-scope .step.done .step-name,.suivi-scope .step.current .step-name{color:var(--cream);}
.suivi-scope .step-date{margin-top:3px;color:var(--slate-dim);font-size:10px;}
.suivi-scope .step.current .step-date{color:var(--gold-bright);}
.suivi-scope .last-update{display:flex;gap:13px;margin-top:30px;padding-top:18px;border-top:1px dashed var(--navy-border);}
.suivi-scope .update-icon{width:34px;height:34px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:50%;color:var(--gold-bright);background:rgba(255,179,27,.1);}
.suivi-scope .update-label{margin:0 0 2px;color:var(--slate-dim);font-size:11px;}
.suivi-scope .update-title{margin:0;color:var(--cream);font-size:14px;font-weight:500;}
.suivi-scope .update-text{margin:4px 0 0;color:var(--slate);font-size:13px;}
.suivi-scope .action-card{border-color:rgba(255,179,27,.45);background:linear-gradient(135deg,rgba(255,179,27,.08),transparent 55%),var(--navy-850);}
.suivi-scope .action-body{padding:20px 22px 22px;}
.suivi-scope .action-label{margin:0 0 3px;color:var(--orange);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;}
.suivi-scope .action-title{margin:0;font-family:var(--serif);font-size:17px;font-weight:500;color:var(--cream);}
.suivi-scope .action-text{margin:14px 0 18px;color:var(--slate);font-size:13px;line-height:1.6;}
.suivi-scope .btn{border:0;border-radius:7px;padding:10px 14px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:8px;}
.suivi-scope .btn-primary{background:var(--gold);color:#1a1204;}
.suivi-scope .btn-primary:hover{background:var(--gold-bright);}
.suivi-scope .btn-secondary{background:transparent;border:1px solid var(--navy-border);color:var(--cream);}
.suivi-scope .btn-secondary:hover{border-color:var(--gold);color:var(--gold-bright);}
.suivi-scope .timeline{padding:7px 22px 20px;}
.suivi-scope .timeline-item{position:relative;display:grid;grid-template-columns:70px 20px 1fr;gap:13px;padding:17px 0;border-bottom:1px solid var(--navy-border);}
.suivi-scope .timeline-item:last-child{border-bottom:0;}
.suivi-scope .timeline-date{padding-top:2px;color:var(--slate-dim);font-size:11px;text-align:right;}
.suivi-scope .timeline-marker{position:relative;display:flex;justify-content:center;}
.suivi-scope .timeline-marker::before{content:"";position:absolute;top:15px;bottom:-35px;width:1px;background:var(--navy-border);}
.suivi-scope .timeline-item:last-child .timeline-marker::before{display:none;}
.suivi-scope .timeline-dot{position:relative;z-index:2;width:9px;height:9px;margin-top:4px;border-radius:50%;background:var(--slate-dim);border:2px solid var(--navy-850);box-shadow:0 0 0 1px var(--navy-border);}
.suivi-scope .timeline-item.success .timeline-dot{background:var(--green);}
.suivi-scope .timeline-item.current .timeline-dot{background:var(--gold);box-shadow:0 0 0 1px var(--gold),0 0 0 5px rgba(255,179,27,.12);}
.suivi-scope .timeline-item.warning .timeline-dot{background:var(--orange);}
.suivi-scope .timeline-step{margin:0 0 3px;color:var(--slate-dim);font-size:11px;text-transform:uppercase;letter-spacing:.035em;}
.suivi-scope .timeline-title{margin:0;color:var(--cream);font-size:14px;font-weight:500;}
.suivi-scope .timeline-description{margin:5px 0 0;color:var(--slate);font-size:13px;line-height:1.55;}
.suivi-scope .timeline-meta{display:flex;align-items:center;gap:9px;margin-top:8px;color:var(--slate-dim);font-size:10.5px;}
.suivi-scope .timeline-tag{padding:3px 7px;border-radius:5px;font-size:10px;}
.suivi-scope .tag-success{color:var(--green);background:rgba(92,184,125,.1);}
.suivi-scope .tag-warning{color:var(--orange);background:rgba(224,139,82,.1);}
.suivi-scope .info-body{padding:19px 22px;}
.suivi-scope .info-row{display:flex;justify-content:space-between;gap:15px;padding:11px 0;border-bottom:1px solid var(--navy-border);}
.suivi-scope .info-row:last-child{border-bottom:0;}
.suivi-scope .info-label{color:var(--slate-dim);font-size:12px;}
.suivi-scope .info-value{color:var(--cream);font-size:12.5px;font-weight:500;text-align:right;}
.suivi-scope .delivery-body{padding:20px 22px;}
.suivi-scope .delivery-date{margin:0;color:var(--gold-bright);font-family:var(--serif);font-size:23px;}
.suivi-scope .delivery-line{height:1px;margin:12px 0 14px;background:repeating-linear-gradient(to right,var(--gold) 0 6px,transparent 6px 13px);opacity:.5;}
.suivi-scope .delivery-text{margin:0;color:var(--slate);font-size:12px;}
.suivi-scope .response-body{padding:20px 22px 22px;}
.suivi-scope .response-text{margin:0 0 15px;color:var(--slate);font-size:13px;}
@media (max-width: 850px){
  .suivi-main{width:min(100% - 40px,700px);}
  .suivi-scope .layout{grid-template-columns:1fr;}
  .suivi-scope .stepper{grid-template-columns:repeat(3,1fr);gap:26px 8px;}
  .suivi-scope .stepper-track,.suivi-scope .stepper-progress{display:none;}
}
@media (max-width: 560px){
  .suivi-main{width:calc(100% - 30px);padding-top:25px;}
  .suivi-scope .page-head{flex-direction:column;gap:15px;}
  .suivi-scope h1{font-size:29px;}
  .suivi-scope .stepper{grid-template-columns:repeat(2,1fr);gap:27px 8px;}
  .suivi-scope .timeline-item{grid-template-columns:52px 15px 1fr;gap:8px;}
  .suivi-scope .card-header{padding-left:17px;padding-right:17px;}
  .suivi-scope .info-body,.suivi-scope .delivery-body,.suivi-scope .response-body,.suivi-scope .action-body{padding-left:17px;padding-right:17px;}
}
`;
