"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getUser, getToken } from "@/app/lib/auth";
import { authAPI, draftsAPI } from "@/app/lib/api";
import { checkpointsAPI, addonsAPI, paymentsAPI } from "@/app/lib/api";
import type { QuoteRecord, CommandeRecord, QuoteCheckpoint, QuoteAddon, PaymentRecord } from "@/app/lib/api";
import { STATUTS_PRODUCTION } from "@/app/lib/api";

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function formatCurrency(val: string | number | null | undefined): string {
  if (val == null) return "—";
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return String(val);
  return n.toLocaleString("fr-FR") + " Ar";
}

function shortId(id: string | number): string {
  return String(id).substring(0, 8);
}

function statutToStepIndex(statut: string | null | undefined): number {
  if (!statut) return 0;
  if (statut === "Livrée") return 4; // Terminé
  if (statut === "Prête") return 3; // Livraison
  const idx = STATUTS_PRODUCTION.indexOf(statut as any);
  if (idx >= 0 && idx < 4) return 2; // Production
  return 0;
}

function daysBetween(from: string | null | undefined, to: string | null | undefined): number | null {
  if (!from || !to) return null;
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (isNaN(a) || isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  pending: "En attente",
  accepted: "Acceptée",
  refused: "Refusée",
  expired: "Expirée",
  production: "En production",
  completed: "Terminée",
};

const STEP_LABELS = ["Envoyé", "Accepté", "Production", "Livraison", "Terminé"];

interface Checkpoint {
  id: string;
  title: string;
  desc: string;
  meta: string;
  state: "done" | "action" | "upcoming";
}

interface Addon {
  id: string;
  title: string;
  desc: string;
  price: number;
  status: "included" | "pending" | "rejected";
}

interface Feedback {
  id: string;
  avatar: string;
  name: string;
  date: string;
  text: string;
}

interface Alert {
  type: "warn" | "info";
  text: string;
}

function DevisDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [commandes, setCommandes] = useState<CommandeRecord[]>([]);
  const [checkpoints, setCheckpoints] = useState<QuoteCheckpoint[]>([]);
  const [addons, setAddons] = useState<QuoteAddon[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCards, setOpenCards] = useState<Set<string>>(new Set());
  const [warnExtraOpen, setWarnExtraOpen] = useState(false);
  const [goodExtraOpen, setGoodExtraOpen] = useState(false);
  const [addonFormOpen, setAddonFormOpen] = useState(false);
  const [addonText, setAddonText] = useState("");
  const [addonSending, setAddonSending] = useState(false);
  const [addonMessage, setAddonMessage] = useState<string | null>(null);
  const [reportingCp, setReportingCp] = useState<string | null>(null);
  const [reportText, setReportText] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [validatingCp, setValidatingCp] = useState<string | null>(null);

  const loadQuote = useCallback(async (token: string) => {
    let quoteData: QuoteRecord | null = null;
    try {
      const quoteRes = await authAPI.get<QuoteRecord>(`/quotes/${id}`);
      quoteData = (quoteRes as any).data ?? quoteRes;
    } catch {
      try {
        const draftRes = await authAPI.get<{ id: string; payload: Record<string, unknown>; created_at?: string; updated_at?: string }>(`/quote-drafts/${id}`);
        const draft = (draftRes as any).data ?? draftRes;
        const payload = draft.payload ?? {};
        quoteData = {
          id: draft.id,
          name: (payload.name as string) ?? "",
          message: (payload.message as string) ?? "",
          category: (payload.category as string) ?? "",
          quantite: payload.quantite != null ? String(payload.quantite) : undefined,
          status: "draft",
          created_at: draft.created_at ?? null,
          updated_at: draft.updated_at ?? null,
          email: (payload.email as string) ?? "",
          phone: (payload.phone as string) ?? null,
          notifications: [],
        } as QuoteRecord;
      } catch {
        throw new Error("NOT_FOUND");
      }
    }
    setQuote(quoteData);

    const commandesRes = await authAPI.get<CommandeRecord[]>("/commandes/").catch(() => ({ data: [] as CommandeRecord[] }));
    const allCommandes: CommandeRecord[] = (commandesRes as any).data ?? commandesRes;
    const filtered = allCommandes.filter((c) => c.cotation_id === id);
    setCommandes(filtered);
    if (filtered.length > 0) {
      setOpenCards(new Set([filtered[0].id]));
    }

    if (quoteData?.status !== "draft") {
      const [cpRes, addonRes, payRes] = await Promise.all([
        checkpointsAPI.list(id as string).catch(() => ({ data: [] })),
        addonsAPI.list(id as string).catch(() => ({ data: [], total_validated: 0 })),
        paymentsAPI.list(id as string).catch(() => ({ data: [], total_verified: 0 })),
      ]);
      setCheckpoints((cpRes as any).data ?? []);
      setAddons(((addonRes as any).data ?? []) as QuoteAddon[]);
      setPayments(((payRes as any).data ?? []) as PaymentRecord[]);
    }
  }, [id]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace(`/mon-profil?next=/mon-profil/devis/detail?id=${id}`);
      return;
    }
    if (!id) {
      setError("Aucun ID de devis fourni.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.replace(`/mon-profil?next=/mon-profil/devis/detail?id=${id}`);
          return;
        }
        await loadQuote(token);
      } catch {
        setError("Impossible de charger les données du devis.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, loadQuote]);

  const toggleCard = useCallback((cardId: string) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }, []);

  const sendQuote = async () => {
    if (!quote) return;
    try {
      if (quote.status === "draft") {
        await draftsAPI.submit(String(quote.id));
      } else {
        await authAPI.put(`/quotes/${quote.id}`, { status: "pending" });
      }
      setQuote({ ...quote, status: "pending" });
    } catch {
      // ignored
    }
  };

  const validateCheckpoint = async (cpId: string) => {
    setValidatingCp(cpId);
    try {
      await checkpointsAPI.validate(cpId);
      const token = getToken();
      if (token) await loadQuote(token);
    } catch {
      // ignored
    } finally {
      setValidatingCp(null);
    }
  };

  const submitAddon = async () => {
    if (!quote || !addonText.trim()) return;
    setAddonSending(true);
    setAddonMessage(null);
    try {
      await addonsAPI.create({
        quote_id: String(quote.id),
        title: addonText.trim().slice(0, 120) || "Demande d'ajout",
        description: addonText.trim(),
      });
      setAddonText("");
      setAddonFormOpen(false);
      setAddonMessage("Votre demande d'ajout a été transmise à l'atelier.");
      const token = getToken();
      if (token) await loadQuote(token);
    } catch {
      setAddonMessage("Impossible d'envoyer la demande. Réessayez.");
    } finally {
      setAddonSending(false);
    }
  };

  const submitReport = async () => {
    if (!quote || !reportText.trim()) return;
    const user = getUser();
    setReportSending(true);
    setReportMessage(null);
    try {
      await authAPI.post("/demandes-client/", {
        nom_client: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Client",
        email: user?.email ?? quote.email ?? "",
        description: reportText.trim(),
        cotation_id: String(quote.id),
      });
      setReportText("");
      setReportingCp(null);
      setReportMessage("Votre signalement a été transmis à l'atelier.");
    } catch {
      setReportMessage("Impossible d'envoyer le signalement. Réessayez.");
    } finally {
      setReportSending(false);
    }
  };

  const showConfirm = quote && ["accepted", "production", "completed"].includes(quote.status ?? "");
  const showPayment = quote && Number(quote.amount ?? 0) > 0;
  const showActions = quote?.status === "draft";

  const defaults: Checkpoint[] = [
    { id: "cp1", title: "Prototype validé", desc: "Le modèle final a été approuvé avant lancement de la série.", meta: `Validé par vous le ${formatDate(quote?.created_at)}`, state: "done" },
    { id: "cp2", title: "Premier lot — contrôle qualité", desc: "L'atelier a terminé le contrôle qualité du premier lot et attend votre retour avant de poursuivre la finition du reste de la commande.", meta: "", state: "action" },
    { id: "cp3", title: "Lot complet avant expédition", desc: "Vérification finale des pièces avant mise en livraison.", meta: "À venir", state: "upcoming" },
  ];

  const defaultAddons: Addon[] = [
    { id: "a1", title: "Bouton doré supplémentaire", desc: "Ajout d'un second bouton en laiton doré.", price: 15000, status: "included" },
    { id: "a2", title: "Broderie motif floral", desc: "Petit motif brodé main sur la poche.", price: 42000, status: "pending" },
  ];

  const displayCheckpoints: Checkpoint[] = checkpoints.length > 0
    ? checkpoints.map((cp) => ({
        id: cp.id,
        title: cp.title,
        desc: cp.description ?? "",
        meta: cp.validated_at
          ? `Validé par ${cp.validated_by ?? "—"} le ${formatDate(cp.validated_at)}`
          : cp.status === "upcoming" ? "À venir" : "",
        state: cp.status === "done" ? "done" : cp.status === "upcoming" ? "upcoming" : ("action" as const),
      }))
    : defaults;

  const displayAddons: Addon[] = addons.length > 0
    ? addons.map((a) => ({
        id: a.id,
        title: a.title,
        desc: a.description ?? "",
        price: Number(a.price ?? 0),
        status: (a.status ?? "pending") as Addon["status"],
      }))
    : defaultAddons;

  const depositPayment = payments.find((p) => p.phase === "deposit");
  const balancePayment = payments.find((p) => p.phase === "balance");

  if (loading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="loading-screen">
          <div className="loading-text">Chargement…</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="loading-screen">
          <div className="error-text">{error}</div>
          <Link href="/mon-profil/devis" className="back-link">← Retour à mes devis</Link>
        </div>
      </>
    );
  }

  if (!quote) return null;

  const quoteNotifications = Array.isArray(quote.notifications) ? quote.notifications : [];
  const warnItems = quoteNotifications.filter((n: any) => n.type === "delay" || n.type === "error");
  const goodItems = quoteNotifications.filter((n: any) => n.type === "info");
  const allMessages = [...goodItems, ...warnItems];

  const pendingAddonCount = displayAddons.filter((a) => a.status === "pending").length;
  const totalAddons = displayAddons.reduce((s, a) => s + (a.status === "included" ? a.price : 0), 0);
  const sumAllAddons = displayAddons.reduce((s, a) => s + (a.price > 0 ? a.price : 0), 0);
  const balanceAmount = balancePayment?.amount ?? quote.balance_amount ?? Number(quote.amount ?? 0) / 2;

  const buildAlerts = (cmd: CommandeRecord): Alert[] => {
    const list: Alert[] = [];
    if ((cmd as any).en_retard) list.push({ type: "warn", text: "Retard sur la date de livraison prévue" });
    if (pendingAddonCount > 0) list.push({ type: "warn", text: `${pendingAddonCount} ajout${pendingAddonCount > 1 ? "s" : ""} en attente de chiffrage` });
    if (cmd.notes) list.push({ type: "warn", text: cmd.notes });
    return list;
  };

  const formatNumber = (n: number) => n.toLocaleString("fr-FR");

  return (
    <>
      <style>{globalStyles}</style>
      <div className="page">
        {/* Header */}
        <header className="site-header">
          <div className="container site-nav">
            <Link href="/" className="logo">
              <svg viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="#d9a548" strokeWidth="1.6" strokeLinecap="round"/><circle cx="6" cy="6" r="1.6" fill="#d9a548"/><circle cx="6" cy="18" r="1.6" fill="#d9a548"/></svg>
              JMR TEXTILE
            </Link>
          </div>
        </header>

        <main className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/mon-profil">Tableau de bord</Link> / <Link href="/mon-profil/devis">Mes devis</Link> / <span style={{ color: "var(--text-cream)" }}>Devis #{shortId(quote.id)}</span>
          </div>

          {/* Page Head */}
          <div className="page-head">
            <div className="head-left">
              <div className="eyebrow">Suivi de devis</div>
              <h1>{quote.name || quote.category || "Devis"}</h1>
              <div className="ref">Réf. <b>#{shortId(quote.id)}</b> · envoyé le {formatDate(quote.created_at)}</div>
            </div>
            <span className={`status-pill-lg ${quote.status ?? ""}`}>
              <span className="dot" />{STATUS_LABELS[quote.status ?? ""] ?? quote.status}
            </span>
          </div>

          {/* Action bar — visible uniquement quand le devis est encore au stade brouillon */}
          {showActions && (
            <div className="action-bar">
              <div className="msg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 8V13M12 16H12.01M10.3 3.9L2.8 17A2 2 0 004.5 20H19.5A2 2 0 0021.2 17L13.7 3.9A2 2 0 0010.3 3.9Z"/></svg>
                Ce devis est encore <b>en brouillon</b> — vous pouvez le modifier avant de l&apos;envoyer à l&apos;atelier.
              </div>
              <div className="action-buttons">
                <Link href="/demande-devis" className="btn-outline">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H6A2 2 0 004 6V18A2 2 0 006 20H18A2 2 0 0020 18V13"/><path d="M18.5 2.5A2.1 2.1 0 0121.5 5.5L12 15L8 16L9 12L18.5 2.5Z"/></svg>
                  Modifier le brouillon
                </Link>
                <button className="btn-gold" onClick={sendQuote}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                  Envoyer le devis
                </button>
              </div>
            </div>
          )}

          {/* Quote Confirm Panel */}
          {showConfirm && (
            <div className="quote-confirm">
              <div className="quote-confirm-top">
                <span className="icon-box"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M4 12L9 17L20 6"/></svg></span>
                <span>Prix validé — commande définitive</span>
              </div>
              <div className="quote-figures">
                <div className="quote-figure"><b>{formatCurrency(quote.amount)}</b><span>Montant total chiffré</span></div>
                <div className="quote-figure"><b>{formatDate(quote.date_livraison_prevue)}</b><span>Date de rendu</span></div>
                <div className="quote-figure"><b>{quote.admin_signature_name || quote.validated_by || "—"}</b><span>Validé par</span></div>
              </div>
              <div className="quote-confirm-note">
                Chiffré par l&apos;atelier le <b>{formatDate(quote.created_at)}</b>, puis validé par vos soins le <b>{formatDate(quote.admin_signature_at ?? quote.validated_at ?? quote.created_at)}</b>. L&apos;acompte de la <b>tranche 1</b> a déclenché le lancement de la production.
              </div>
            </div>
          )}

          {/* Payment Grid */}
          {showPayment && (
            <div className="panel">
              <div className="panel-header">
                <h3>Paiement</h3>
                <span className="hint">2 tranches</span>
              </div>
              <div className="payment-grid">
                <div className="payment-card">
                  <div className="payment-card-top">
                    <span className="payment-tag">Tranche 1 · Acompte (50%)</span>
                    <span className={`payment-status ${depositPayment?.status === "verified" ? "paid" : "waiting"}`}>
                      {depositPayment?.status === "verified" ? "Payé" : depositPayment?.status === "submitted" ? "En attente" : "À créer"}
                    </span>
                  </div>
                  <div className="payment-amount">{formatCurrency(depositPayment?.amount ?? quote.deposit_amount ?? Number(quote.amount ?? 0) / 2)}</div>
                  <div className="payment-desc">
                    {depositPayment?.status === "verified"
                      ? `Réglé le ${formatDate(depositPayment.reviewed_at ?? depositPayment.created_at)}`
                      : depositPayment
                        ? "En attente de vérification par l'atelier"
                        : "Sera créée automatiquement après validation du devis"}
                  </div>
                </div>
                <div className="payment-card">
                  <div className="payment-card-top">
                    <span className="payment-tag">Tranche 2 · Solde (50%)</span>
                    <span className={`payment-status ${balancePayment?.status === "verified" ? "paid" : "waiting"}`}>
                      {balancePayment?.status === "verified" ? "Payé" : "En attente"}
                    </span>
                  </div>
                  <div className="payment-amount">{formatCurrency(balancePayment?.amount ?? balanceAmount)}</div>
                  <div className="payment-desc">
                    {balancePayment?.status === "verified"
                      ? `Réglé le ${formatDate(balancePayment.reviewed_at ?? balancePayment.created_at)}`
                      : totalAddons > 0
                        ? `Solde de base + ${formatCurrency(totalAddons)} d'ajouts validés`
                        : "Exigible à la livraison finale du dernier lot"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commandes liées */}
          <div className="section-head">
            <h2>Commandes liées à ce devis</h2>
            <span className="hint">{commandes.length} commande{commandes.length > 1 ? "s" : ""}</span>
          </div>

          {commandes.length === 0 && (
            <div className="empty-msg">Aucune commande associée à ce devis.</div>
          )}

          {commandes.map((cmd) => {
            const isOpen = openCards.has(cmd.id);
            const stepIdx = statutToStepIndex(cmd.statut_production);
            const alerts = buildAlerts(cmd);
            const delayDays = daysBetween(quote.date_livraison_prevue, cmd.date_livraison_prevue);

            return (
              <div key={cmd.id} className={`order-card ${isOpen ? "open" : ""}`}>
                <div className="order-summary" onClick={() => toggleCard(cmd.id)}>
                  <div className="order-summary-left">
                    <span className="order-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><rect x="4" y="7" width="16" height="13" rx="1.5"/><path d="M8 7V5A2 2 0 0110 3H14A2 2 0 0116 5V7"/></svg></span>
                    <div>
                      <div className="order-title">Commande #{cmd.numero}</div>
                      <div className="order-sub">{cmd.quantite} pièces · créée le {formatDate(cmd.date_commande)}</div>
                    </div>
                  </div>
                  <div className="order-summary-right">
                    {alerts.length > 0 ? (
                      <span className="alert-count">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8V13M12 16.5H12.01M10.3 3.9L2.8 17A2 2 0 004.5 20H19.5A2 2 0 0021.2 17L13.7 3.9A2 2 0 0010.3 3.9Z"/></svg>
                        {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="alert-count none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12L9 17L20 6"/></svg>
                        Aucune alerte
                      </span>
                    )}
                    <div className="mini-progress">
                      <div className="segs">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <span key={i} className={`seg ${i < stepIdx ? "filled" : i === stepIdx ? "current" : ""}`} />
                        ))}
                      </div>
                      <span className="stage-label">{STEP_LABELS[stepIdx] ?? "—"}</span>
                    </div>
                    <svg className={`order-chevron ${isOpen ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9"/></svg>
                  </div>
                </div>

                {isOpen && (
                  <div className="order-body">
                    {/* Stepper */}
                    <div className="panel-header">
                      <h3>Avancement</h3>
                      <span className="hint">Mis à jour le {formatDate(cmd.updated_at ?? cmd.date_commande)}</span>
                    </div>
                    <div className="stepper">
                      <div className="stepper-line" />
                      <div className="stepper-line-fill" style={{ width: `${Math.min(88, 8 + stepIdx * 15)}%` }} />
                      {STEP_LABELS.map((label, i) => {
                        let state: "done" | "current" | "upcoming" = "upcoming";
                        if (i < stepIdx) state = "done";
                        else if (i === stepIdx) state = "current";
                        return (
                          <div key={i} className={`step ${state}`}>
                            <div className="step-dot">
                              {state === "done" && <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12L9 17L20 6"/></svg>}
                              {state === "current" && <span className="pulse" />}
                            </div>
                            <div className="step-label">{label}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Étapes à valider */}
                    <div className="panel-header">
                      <h3>Étapes à valider</h3>
                      <span className="hint">{displayCheckpoints.filter((c) => c.state === "action").length} en attente de votre validation</span>
                    </div>
                    <div className="checkpoint-list">
                      {displayCheckpoints.map((cp) => (
                        <div key={cp.id} className={`checkpoint-item ${cp.state}`}>
                          <div className="cp-marker">
                            {cp.state === "done" && <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12L9 17L20 6"/></svg>}
                            {cp.state === "action" && <span className="dot-pulse" />}
                          </div>
                          <div className="cp-body">
                            <div className="cp-title">{cp.title}</div>
                            <div className="cp-desc">{cp.desc}</div>
                            {cp.meta && <div className="cp-meta">{cp.meta}</div>}
                            {cp.state === "action" && (
                              <>
                                <div className="cp-actions">
                                  <button className="btn-sm-gold" onClick={() => validateCheckpoint(cp.id)} disabled={validatingCp === cp.id}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M4 12L9 17L20 6"/></svg>
                                    {validatingCp === cp.id ? "Validation…" : "Valider cette étape"}
                                  </button>
                                  <button className="btn-sm-outline" onClick={() => { setReportingCp(reportingCp === cp.id ? null : cp.id); setReportMessage(null); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8V13M12 16.5H12.01M10.3 3.9L2.8 17A2 2 0 004.5 20H19.5A2 2 0 0021.2 17L13.7 3.9A2 2 0 0010.3 3.9Z"/></svg>
                                    Signaler un problème
                                  </button>
                                </div>
                                {reportingCp === cp.id && (
                                  <div className="addon-form open" style={{ marginTop: 12 }}>
                                    <label>Décrivez le problème rencontré</label>
                                    <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Ex. : La couleur du tissu ne correspond pas au prototype…" />
                                    <div className="form-actions">
                                      <button className="btn-sm-gold" onClick={submitReport} disabled={reportSending || !reportText.trim()}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                                        {reportSending ? "Envoi…" : "Envoyer le signalement"}
                                      </button>
                                      <button className="btn-sm-outline" onClick={() => setReportingCp(null)}>Annuler</button>
                                    </div>
                                    {reportMessage && <p className="form-status">{reportMessage}</p>}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Points d'attention / Avancées */}
                    <div className="highlights-grid">
                      <div className="hl-panel warn">
                        <div className="hl-head">
                          <span className="icon-box"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M12 9V13M12 16.5H12.01M10.3 3.9L2.8 17A2 2 0 004.5 20H19.5A2 2 0 0021.2 17L13.7 3.9A2 2 0 0010.3 3.9Z"/></svg></span>
                          <h4>Points d&apos;attention</h4>
                          <span>{Math.min(warnItems.length, 3)} sur {warnItems.length}</span>
                        </div>
                        {warnItems.length === 0 ? (
                          <div className="hl-empty">Aucun point d&apos;attention</div>
                        ) : (
                          <>
                            {warnItems.slice(0, warnExtraOpen ? warnItems.length : 3).map((a: any, i: number) => (
                              <div key={i} className="hl-item">
                                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                                <div className="hl-item-body">
                                  <b>{a.message}</b>
                                  {a.detail && <p>{a.detail}</p>}
                                  <span className="impact">{a.impact ?? (a.type === "delay" ? "Retard" : "À surveiller")}</span>
                                </div>
                              </div>
                            ))}
                            {warnItems.length > 3 && (
                              <button className="see-more" onClick={() => setWarnExtraOpen(!warnExtraOpen)}>
                                {warnExtraOpen ? "Voir moins " : `Voir plus (+${warnItems.length - 3}) `}
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9"/></svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      <div className="hl-panel good">
                        <div className="hl-head">
                          <span className="icon-box"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M4 12L9 17L20 6"/></svg></span>
                          <h4>Avancées</h4>
                          <span>{Math.min(goodItems.length, 3)} sur {goodItems.length}</span>
                        </div>
                        {goodItems.length === 0 ? (
                          <div className="hl-empty">Aucune avancée signalée</div>
                        ) : (
                          <>
                            {goodItems.slice(0, goodExtraOpen ? goodItems.length : 3).map((a: any, i: number) => (
                              <div key={i} className="hl-item">
                                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                                <div className="hl-item-body">
                                  <b>{a.message}</b>
                                  {a.detail && <p>{a.detail}</p>}
                                  <span className="impact">{a.impact ?? "Terminé"}</span>
                                </div>
                              </div>
                            ))}
                            {goodItems.length > 3 && (
                              <button className="see-more" onClick={() => setGoodExtraOpen(!goodExtraOpen)}>
                                {goodExtraOpen ? "Voir moins " : `Voir plus (+${goodItems.length - 3}) `}
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9"/></svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Ajouts demandés */}
                    <div className="panel-header">
                      <h3>Ajouts demandés</h3>
                      <span className="hint">+{formatNumber(sumAllAddons)} Ar au total</span>
                    </div>
                    <div className="addon-section">
                      {displayAddons.map((addon) => (
                        <div key={addon.id} className="addon-item">
                          <div className="addon-left">
                            <b>{addon.title}</b>
                            <p>{addon.desc}</p>
                          </div>
                          <div className="addon-right">
                            <span className="addon-price">+{formatNumber(addon.price)} Ar</span>
                            <span className={`addon-status ${addon.status}`}>
                              {addon.status === "included" ? "Inclus au total" : addon.status === "rejected" ? "Refusé" : "En attente de chiffrage"}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="addon-total">
                        <span>Total des ajouts validés, ajouté au solde de livraison</span>
                        <b>+{formatNumber(totalAddons)} Ar</b>
                      </div>
                      {addonMessage && <p className="form-status">{addonMessage}</p>}
                      <button className="addon-add-btn" onClick={() => { setAddonFormOpen(!addonFormOpen); setAddonMessage(null); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5V19M5 12H19"/></svg>
                        Demander un ajout
                      </button>
                      {addonFormOpen && (
                        <div className="addon-form open">
                          <label>Décrivez ce que vous souhaitez ajouter ou modifier</label>
                          <textarea value={addonText} onChange={(e) => setAddonText(e.target.value)} placeholder="Ex. : Ajouter un motif brodé sur la manche gauche, changer la couleur des boutons…" />
                          <p className="hint-sm">L&apos;atelier vous répondra avec un chiffrage de l&apos;ajout avant de l&apos;intégrer à la commande.</p>
                          <button className="btn-sm-gold" onClick={submitAddon} disabled={addonSending || !addonText.trim()}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                            {addonSending ? "Envoi…" : "Envoyer la demande"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Retour de l'atelier */}
                    <div className="panel-header">
                      <h3>Retour de l&apos;atelier</h3>
                      <span className="hint">{allMessages.length} message{allMessages.length > 1 ? "s" : ""}</span>
                    </div>
                    <div>
                      {allMessages.length === 0 ? (
                        <div className="hl-empty" style={{ padding: "20px 0" }}>Aucun message de l&apos;atelier pour le moment.</div>
                      ) : (
                        allMessages.map((msg: any, i: number) => (
                          <div key={i} className="feedback-item">
                            <div className="fb-avatar">A</div>
                            <div className="fb-body">
                              <div className="fb-top">
                                <span className="fb-name">Atelier JMR</span>
                                <span className="fb-date">{formatDate(msg.date ?? msg.created_at)}</span>
                              </div>
                              <p className="fb-text">{msg.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comparatif */}
                    <div className="panel-header">
                      <h3>Comparatif devis · commande · livraison</h3>
                      <span className="hint">Se complète automatiquement</span>
                    </div>
                    <table className="compare-table">
                      <thead>
                        <tr>
                          <th />
                          <th>Devis</th>
                          <th className="col-active">Bon de commande</th>
                          <th>Livraison</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Quantité</td>
                          <td>{quote.quantite ?? "—"} pièces</td>
                          <td className="col-active">{cmd.quantite} pièces</td>
                          <td>
                            {cmd.date_livraison_reelle ? (
                              `${cmd.pieces_produites ?? "—"} pièces`
                            ) : (
                              <span className="pending-tag">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7V12L15 14"/></svg>
                                À venir
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Prix unitaire</td>
                          <td>{formatCurrency(cmd.quantite ? Number(quote.amount ?? 0) / cmd.quantite : null)}</td>
                          <td className="col-active">{formatCurrency(cmd.prix_unitaire)}</td>
                          <td>
                            {cmd.date_livraison_reelle ? (
                              formatCurrency(cmd.total)
                            ) : (
                              <span className="pending-tag">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7V12L15 14"/></svg>
                                À venir
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Date de rendu</td>
                          <td>{formatDate(quote.date_livraison_prevue)}</td>
                          <td className="col-active">
                            {formatDate(cmd.date_livraison_prevue)}
                            {delayDays !== null && delayDays > 0 && <span style={{ color: "var(--warn)", fontSize: "11px" }}> (+{delayDays}j)</span>}
                          </td>
                          <td>
                            {cmd.date_livraison_reelle ? (
                              formatDate(cmd.date_livraison_reelle)
                            ) : (
                              <span className="pending-tag">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7V12L15 14"/></svg>
                                À venir
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Statut</td>
                          <td>{STATUS_LABELS[quote.status ?? ""] ?? quote.status}</td>
                          <td className="col-active">{cmd.statut_production ?? "—"}</td>
                          <td>
                            {cmd.date_livraison_reelle ? (
                              "Livré"
                            ) : (
                              <span className="pending-tag">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7V12L15 14"/></svg>
                                Non généré
                              </span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </main>

        <footer className="site-footer">JMR Textile © 2026 — Suivi mis à jour automatiquement par l&apos;atelier</footer>
      </div>
    </>
  );
}

export default function DevisDetailPage() {
  return (
    <Suspense fallback={
      <div className="loading-screen">
        <div className="loading-text">Chargement…</div>
      </div>
    }>
      <DevisDetailContent />
    </Suspense>
  );
}

const globalStyles = `
:root{
  --bg-deep:#131c2b;
  --bg-panel:#0f1826;
  --card:#1b263c;
  --card-border:#2b3852;
  --input-bg:#141e30;
  --gold:#d9a548;
  --gold-light:#f0c674;
  --gold-dim:#8c7038;
  --text-cream:#f3efe4;
  --text-muted:#8b93a7;
  --text-faint:#5c6478;
  --warn:#e08b52;
  --warn-bg:rgba(224,139,82,0.09);
  --warn-border:rgba(224,139,82,0.28);
  --good:#5cb87d;
  --good-bg:rgba(92,184,125,0.09);
  --good-border:rgba(92,184,125,0.28);
  --font-serif:'Fraunces',serif;
  --font-mono:'JetBrains Mono',monospace;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg-deep);font-family:'Inter',system-ui,sans-serif;color:var(--text-cream);-webkit-font-smoothing:antialiased;}
a{color:inherit;}
.container{max-width:1100px;margin:0 auto;padding:0 40px;}
@media(max-width:760px){.container{padding:0 20px;}}

.loading-screen{min-height:100vh;background:var(--bg-deep);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;}
.loading-text{color:var(--gold);font-size:18px;}
.error-text{color:var(--warn);font-size:18px;}
.back-link{color:var(--gold);text-decoration:underline;font-size:16px;}

.site-header{border-bottom:1px solid rgba(255,255,255,0.06);}
.site-nav{display:flex;align-items:center;justify-content:space-between;padding:20px 0;}
.logo{display:flex;align-items:center;gap:10px;font-family:var(--font-serif);font-weight:600;font-size:20px;letter-spacing:0.08em;color:var(--gold-light);text-decoration:none;}
.logo svg{width:26px;height:26px;}

.breadcrumb{display:flex;align-items:center;gap:8px;padding:28px 0 0;font-size:12px;color:var(--text-faint);}
.breadcrumb a{color:var(--text-muted);text-decoration:none;}
.breadcrumb a:hover{color:var(--gold-light);}

.page-head{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:20px;padding:18px 0 36px;}
.head-left .eyebrow{font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:12px;display:flex;align-items:center;gap:10px;}
.head-left .eyebrow::before{content:"";width:22px;height:1px;background:var(--gold-dim);}
.head-left h1{font-family:var(--font-serif);font-weight:500;font-size:clamp(26px,3.4vw,34px);margin:0 0 10px;color:var(--gold-light);}
.head-left .ref{font-family:var(--font-mono);font-size:12px;color:var(--text-faint);}
.head-left .ref b{color:var(--text-muted);font-weight:500;}

.status-pill-lg{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:100px;background:var(--input-bg);border:1px solid var(--card-border);font-size:11.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);font-weight:600;}
.status-pill-lg .dot{width:8px;height:8px;border-radius:50%;background:#8b93a7;}
.status-pill-lg.accepted .dot{background:var(--good);}
.status-pill-lg.production .dot{background:#5c9ad9;}
.status-pill-lg.completed .dot{background:var(--good);}
.status-pill-lg.draft .dot{background:var(--text-faint);}
.status-pill-lg.pending .dot{background:var(--gold);}

.action-bar{background:linear-gradient(135deg,rgba(217,165,72,0.08),rgba(217,165,72,0.02));border:1px solid rgba(217,165,72,0.22);border-radius:12px;padding:18px 24px;margin-bottom:36px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;}
.msg{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-muted);}
.msg svg{width:16px;height:16px;color:var(--gold-light);flex-shrink:0;}
.msg b{color:var(--text-cream);}
.action-buttons{display:flex;gap:10px;flex-wrap:wrap;}

.btn-gold{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:8px;border:none;background:linear-gradient(180deg,var(--gold-light),var(--gold));color:#1a1204;font-weight:700;font-size:11.5px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:filter .2s,transform .2s;white-space:nowrap;}
.btn-gold:hover{filter:brightness(1.06);transform:translateY(-1px);}
.btn-gold svg{width:14px;height:14px;}

.btn-outline{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:8px;border:1px solid var(--card-border);background:transparent;color:var(--text-muted);font-weight:600;font-size:11.5px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all .2s;white-space:nowrap;text-decoration:none;}
.btn-outline:hover{border-color:var(--gold-dim);color:var(--gold-light);}
.btn-outline svg{width:14px;height:14px;}

.quote-confirm{background:var(--good-bg);border:1px solid var(--good-border);border-radius:12px;padding:26px 28px;margin-bottom:24px;}
.quote-confirm-top{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.quote-confirm-top .icon-box{width:30px;height:30px;border-radius:8px;background:rgba(92,184,125,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.quote-confirm-top .icon-box svg{width:15px;height:15px;stroke:var(--good);}
.quote-confirm-top span{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--good);font-weight:700;}
.quote-figures{display:flex;flex-wrap:wrap;gap:36px;margin-bottom:14px;}
.quote-figure b{display:block;font-family:var(--font-serif);font-weight:500;font-size:26px;color:var(--text-cream);}
.quote-figure span{font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-faint);}
.quote-confirm-note{font-size:12.5px;color:var(--text-muted);line-height:1.6;}
.quote-confirm-note b{color:var(--text-cream);}

.panel{background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:30px 30px 18px;margin-bottom:24px;}
.panel-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:24px;}
.panel-header h3{font-family:var(--font-serif);font-weight:500;font-size:19px;margin:0;color:var(--gold-light);}
.panel-header .hint{font-size:12px;color:var(--text-faint);}

.payment-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;}
@media(max-width:700px){.payment-grid{grid-template-columns:1fr;}}
.payment-card{background:var(--input-bg);border:1px solid var(--card-border);border-radius:10px;padding:22px;}
.payment-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.payment-tag{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-faint);font-weight:600;}
.payment-status{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:100px;letter-spacing:0.03em;}
.payment-status.paid{background:var(--good-bg);color:var(--good);border:1px solid var(--good-border);}
.payment-status.waiting{background:var(--input-bg);color:var(--text-faint);border:1px solid var(--card-border);}
.payment-status svg{width:10px;height:10px;}
.payment-amount{font-family:var(--font-serif);font-weight:500;font-size:24px;color:var(--gold-light);margin-bottom:6px;}
.payment-desc{font-size:12px;color:var(--text-faint);}

.section-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin:8px 0 18px;}
.section-head h2{font-family:var(--font-serif);font-weight:500;font-size:21px;margin:0;color:var(--gold-light);}
.section-head .hint{font-size:12px;color:var(--text-faint);}
.empty-msg{color:var(--text-muted);font-size:14px;padding:32px 0;}

.order-card{background:var(--card);border:1px solid var(--card-border);border-radius:12px;margin-bottom:16px;overflow:hidden;}
.order-summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px;cursor:pointer;flex-wrap:wrap;background:transparent;border:none;color:var(--text-cream);text-align:left;width:100%;-webkit-tap-highlight-color:transparent;}
.order-summary:hover{background:rgba(255,255,255,0.02);}
.order-summary-left{display:flex;align-items:center;gap:14px;min-width:0;}
.order-icon{width:38px;height:38px;border-radius:9px;background:rgba(217,165,72,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.order-icon svg{width:18px;height:18px;stroke:var(--gold-light);}
.order-title{font-size:14.5px;font-weight:700;color:var(--text-cream);}
.order-sub{font-size:11px;color:var(--text-faint);font-family:var(--font-mono);margin-top:3px;}
.order-summary-right{display:flex;align-items:center;gap:22px;flex-wrap:wrap;}
.alert-count{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;color:var(--warn);font-weight:700;letter-spacing:0.03em;background:var(--warn-bg);border:1px solid var(--warn-border);padding:5px 10px;border-radius:100px;white-space:nowrap;}
.alert-count svg{width:11px;height:11px;flex-shrink:0;}
.alert-count.none{color:var(--good);background:var(--good-bg);border-color:var(--good-border);}
.mini-progress{display:flex;align-items:center;gap:9px;flex-shrink:0;}
.mini-progress .segs{display:flex;gap:3px;}
.mini-progress .seg{width:16px;height:4px;border-radius:2px;background:var(--card-border);}
.mini-progress .seg.filled{background:var(--gold-dim);}
.mini-progress .seg.current{background:var(--gold-light);box-shadow:0 0 6px rgba(240,198,116,0.5);}
.stage-label{font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-faint);font-weight:600;white-space:nowrap;}
.order-chevron{width:16px;height:16px;color:var(--text-faint);transition:transform .25s;flex-shrink:0;}
.order-chevron.open{transform:rotate(180deg);}

.order-body{padding:6px 24px 26px;border-top:1px solid rgba(255,255,255,0.06);}
.order-body .panel-header{margin-top:22px;}

.stepper{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:30px;position:relative;margin-bottom:24px;}
.step{display:flex;flex-direction:column;align-items:center;text-align:center;flex:1;position:relative;z-index:2;}
.step-dot{width:30px;height:30px;border-radius:50%;background:var(--input-bg);border:2px solid var(--card-border);display:flex;align-items:center;justify-content:center;margin-bottom:12px;transition:all .2s;}
.step.done .step-dot{background:var(--gold-dim);border-color:var(--gold-dim);}
.step.done .step-dot svg{width:13px;height:13px;stroke:#0f1826;}
.step.current .step-dot{background:var(--gold);border-color:var(--gold-light);box-shadow:0 0 0 5px rgba(217,165,72,0.15);}
.step.current .step-dot .pulse{width:8px;height:8px;border-radius:50%;background:#1a1204;animation:pulse 1.5s infinite;}
.step-label{font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-faint);font-weight:600;}
.step.done .step-label,.step.current .step-label{color:var(--text-cream);}
.stepper-line{position:absolute;top:15px;left:5%;right:5%;height:2px;background:var(--card-border);z-index:1;}
.stepper-line-fill{position:absolute;top:15px;left:5%;height:2px;background:var(--gold-dim);z-index:1;}
@media(max-width:700px){.stepper{flex-wrap:wrap;gap:18px 0;}.step{flex:0 0 33%;}.stepper-line,.stepper-line-fill{display:none;}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.3);}}

.checkpoint-list{display:flex;flex-direction:column;}
.checkpoint-item{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);}
.checkpoint-item:last-child{border-bottom:none;}
.cp-marker{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
.checkpoint-item.done .cp-marker{background:var(--gold-dim);}
.checkpoint-item.done .cp-marker svg{width:12px;height:12px;stroke:#0f1826;}
.checkpoint-item.action .cp-marker{background:rgba(224,139,82,0.18);border:1px solid var(--warn-border);}
.checkpoint-item.action .cp-marker .dot-pulse{width:7px;height:7px;border-radius:50%;background:var(--warn);animation:pulse 1.5s infinite;}
.checkpoint-item.upcoming .cp-marker{background:var(--input-bg);border:1px dashed var(--card-border);}
.checkpoint-item.upcoming{opacity:0.55;}
.cp-body{flex:1;min-width:0;}
.cp-title{font-size:13.5px;font-weight:700;color:var(--text-cream);margin-bottom:3px;}
.cp-desc{font-size:12.5px;color:var(--text-muted);line-height:1.5;margin-bottom:2px;}
.cp-meta{font-size:11px;color:var(--text-faint);}
.cp-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}
.btn-sm-gold{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:7px;border:none;background:linear-gradient(180deg,var(--gold-light),var(--gold));color:#1a1204;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all .2s;white-space:nowrap;}
.btn-sm-gold:hover{filter:brightness(1.07);}
.btn-sm-gold:disabled{opacity:0.6;cursor:not-allowed;filter:none;}
.btn-sm-gold svg{width:12px;height:12px;}
.btn-sm-outline{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:7px;border:1px solid var(--card-border);background:transparent;color:var(--text-muted);font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all .2s;white-space:nowrap;}
.btn-sm-outline:hover{border-color:var(--warn);color:var(--warn);}
.btn-sm-outline svg{width:12px;height:12px;}

.highlights-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;}
@media(max-width:800px){.highlights-grid{grid-template-columns:1fr;}}
.hl-panel{border-radius:12px;padding:26px;border:1px solid;}
.hl-panel.warn{background:var(--warn-bg);border-color:var(--warn-border);}
.hl-panel.good{background:var(--good-bg);border-color:var(--good-border);}
.hl-head{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
.hl-head .icon-box{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.hl-panel.warn .icon-box{background:rgba(224,139,82,0.18);}
.hl-panel.good .icon-box{background:rgba(92,184,125,0.18);}
.hl-head .icon-box svg{width:16px;height:16px;}
.hl-panel.warn .icon-box svg{stroke:var(--warn);}
.hl-panel.good .icon-box svg{stroke:var(--good);}
.hl-head h4{font-family:var(--font-serif);font-weight:500;font-size:17px;margin:0;}
.hl-panel.warn h4{color:var(--warn);}
.hl-panel.good h4{color:var(--good);}
.hl-head span{font-size:11px;color:var(--text-faint);margin-left:auto;}
.hl-empty{font-size:12px;color:var(--text-faint);}

.hl-item{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,0.06);}
.hl-item:last-child{border-bottom:none;}
.hl-item .num{font-family:var(--font-mono);font-size:11px;color:var(--text-faint);flex-shrink:0;padding-top:1px;}
.hl-item-body b{display:block;font-size:13.5px;color:var(--text-cream);font-weight:600;margin-bottom:3px;}
.hl-item-body p{margin:0;font-size:12.5px;color:var(--text-muted);line-height:1.5;}
.hl-item-body .impact{display:inline-block;margin-top:6px;font-size:10.5px;font-weight:700;letter-spacing:0.04em;padding:2px 8px;border-radius:5px;}
.hl-panel.warn .impact{background:rgba(224,139,82,0.16);color:var(--warn);}
.hl-panel.good .impact{background:rgba(92,184,125,0.16);color:var(--good);}

.see-more{width:100%;margin-top:14px;padding:10px;border-radius:8px;border:1px dashed;background:transparent;font-size:11.5px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;}
.hl-panel.warn .see-more{border-color:var(--warn-border);color:var(--warn);}
.hl-panel.good .see-more{border-color:var(--good-border);color:var(--good);}
.see-more:hover{filter:brightness(1.15);}
.see-more svg{width:12px;height:12px;transition:transform .25s;}
.see-more.open svg{transform:rotate(180deg);}

.feedback-item{display:flex;gap:14px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,0.06);}
.feedback-item:last-child{border-bottom:none;}
.fb-avatar{width:36px;height:36px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--gold-light),var(--gold-dim));display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-weight:600;font-size:14px;color:#1a1204;}
.fb-body{flex:1;min-width:0;}
.fb-top{display:flex;align-items:baseline;gap:10px;margin-bottom:6px;flex-wrap:wrap;}
.fb-name{font-size:13.5px;font-weight:700;color:var(--text-cream);}
.fb-date{font-size:11px;color:var(--text-faint);}
.fb-text{font-size:13px;color:var(--text-muted);line-height:1.65;}

.addon-section{margin-top:8px;}
.addon-item{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 0;border-bottom:1px solid rgba(255,255,255,0.06);flex-wrap:wrap;}
.addon-item:last-child{border-bottom:none;}
.addon-left b{display:block;font-size:13.5px;color:var(--text-cream);font-weight:600;margin-bottom:3px;}
.addon-left p{margin:0;font-size:12px;color:var(--text-faint);}
.addon-right{display:flex;align-items:center;gap:14px;flex-shrink:0;}
.addon-price{font-family:var(--font-mono);font-size:13px;color:var(--gold-light);font-weight:500;}
.addon-status{font-size:10px;letter-spacing:0.05em;text-transform:uppercase;font-weight:700;padding:4px 10px;border-radius:100px;white-space:nowrap;}
.addon-status.included{background:var(--good-bg);color:var(--good);border:1px solid var(--good-border);}
.addon-status.pending{background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn-border);}
.addon-status.rejected{background:var(--input-bg);color:var(--text-faint);border:1px solid var(--card-border);}
.addon-total{display:flex;justify-content:space-between;align-items:center;padding-top:16px;margin-top:6px;border-top:1px solid var(--card-border);font-size:12.5px;color:var(--text-muted);}
.addon-total b{color:var(--gold-light);font-family:var(--font-mono);font-size:14px;}
.addon-add-btn{width:100%;margin-top:16px;padding:12px;border-radius:8px;border:1px dashed var(--card-border);background:transparent;color:var(--text-muted);font-size:11.5px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .2s;}
.addon-add-btn:hover{border-color:var(--gold-dim);color:var(--gold-light);}
.addon-add-btn svg{width:13px;height:13px;}
.addon-form{display:none;margin-top:14px;padding:18px;background:var(--input-bg);border:1px solid var(--card-border);border-radius:9px;}
.addon-form.open{display:block;}
.addon-form label{font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);font-weight:600;display:block;margin-bottom:8px;}
.addon-form textarea{width:100%;background:var(--card);border:1px solid var(--card-border);border-radius:7px;padding:11px 13px;font-family:'Inter',sans-serif;font-size:13px;color:var(--text-cream);resize:vertical;min-height:70px;outline:none;margin-bottom:12px;}
.addon-form textarea:focus{border-color:var(--gold-dim);}
.hint-sm{font-size:11px;color:var(--text-faint);margin-bottom:14px;}
.form-actions{display:flex;gap:8px;flex-wrap:wrap;}
.form-status{font-size:12px;color:var(--good);margin-top:12px;}

.compare-table{width:100%;border-collapse:collapse;margin-bottom:10px;}
.compare-table th{text-align:left;font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-faint);font-weight:600;padding:0 16px 14px 0;border-bottom:1px solid var(--card-border);}
.compare-table th:first-child{width:26%;}
.compare-table td{padding:14px 16px 14px 0;font-size:13.5px;color:var(--text-cream);border-bottom:1px solid rgba(255,255,255,0.05);vertical-align:top;}
.compare-table td:first-child{color:var(--text-faint);font-size:11.5px;letter-spacing:0.04em;text-transform:uppercase;font-weight:600;padding-top:16px;}
.compare-table tr:last-child td{border-bottom:none;}
.col-active{color:var(--gold-light) !important;font-weight:600;}
.pending-tag{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--text-faint);font-style:italic;}
.pending-tag svg{width:12px;height:12px;}

.site-footer{padding:36px 0 70px;text-align:center;font-size:12px;color:var(--text-faint);border-top:1px solid rgba(255,255,255,0.06);margin-top:40px;}
`;
