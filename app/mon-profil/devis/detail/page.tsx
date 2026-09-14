"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getUser, getToken } from "@/app/lib/auth";
import { safeUrl } from "@/app/lib/utils";
import { authAPI } from "@/app/lib/api";
import { checkpointsAPI, addonsAPI, paymentsAPI } from "@/app/lib/api";
import type { QuoteRecord, CommandeRecord, QuoteCheckpoint, QuoteAddon, PaymentRecord } from "@/app/lib/api";
import { STATUTS_PRODUCTION } from "@/app/lib/api";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import { useToast } from "@/app/components/toast-provider";

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

function formatDateShort(d: string | null | undefined): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return "";
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

type QuoteFile = { name?: string; url: string; type?: string };

function parseQuoteFiles(quote: QuoteRecord | null): QuoteFile[] {
  const raw = quote?.files;
  if (Array.isArray(raw)) return raw as QuoteFile[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as QuoteFile[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

const CATEGORY_LABELS: Record<string, string> = {
  pantalon: "Pantalon",
  jupe: "Jupe",
  shirt: "T-shirt / Débardeur",
  polo: "Polo",
  chemise: "Chemise / Chemisier",
  veste: "Veste / Blazer",
  manteau: "Manteau / Parka",
  robe: "Robe",
  sweat: "Sweat-shirt / Hoodie",
  short: "Short / Bermuda",
  pull: "Pull / Cardigan",
  "sous-vetement": "Sous-vêtements / Lingerie",
  accessoire: "Accessoires (Écharpes, Bonnets...)",
  uniforme: "Uniforme / Workwear",
  sport: "Sportswear",
  enfant: "Enfant / Bébé",
  autre: "Autre projet sur-mesure",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  pending: "En attente",
  sent: "Envoyé",
  needs_info: "À préciser",
  accepted: "Acceptée",
  rejected: "Refusée",
  expired: "Expirée",
  production: "Production",
  completed: "Terminée",
};

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

interface Alert {
  type: "warn" | "info";
  text: string;
}

function productionIndex(statut: string | null | undefined): number {
  if (!statut) return -1;
  const idx = STATUTS_PRODUCTION.indexOf(statut as (typeof STATUTS_PRODUCTION)[number]);
  return idx;
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
  const [addonFormOpen, setAddonFormOpen] = useState(false);
  const [addonText, setAddonText] = useState("");
  const [addonSending, setAddonSending] = useState(false);
  const [addonMessage, setAddonMessage] = useState<string | null>(null);
  const [reportingOpen, setReportingOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [responseOpen, setResponseOpen] = useState(false);
  const [validatingCp, setValidatingCp] = useState<string | null>(null);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmingQuote, setConfirmingQuote] = useState(false);
  const [refusingQuote, setRefusingQuote] = useState(false);
  const [paymentType, setPaymentType] = useState("mvola");
  const [transactionRef, setTransactionRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadQuote = useCallback(async (token: string) => {
    let quoteData: QuoteRecord | null = null;
    try {
      const quoteRes = await authAPI.get<QuoteRecord>(`/quotes/${id}`);
      quoteData = quoteRes.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error("NOT_FOUND");
    }
    setQuote(quoteData);

    const commandesRes = await authAPI.get<CommandeRecord[]>("/commandes/").catch(() => ({ data: [] as CommandeRecord[] }));
    const allCommandes: CommandeRecord[] = commandesRes.data;
    const filtered = allCommandes.filter((c) => c.cotation_id === id);
    setCommandes(filtered);

    if (quoteData?.status !== "draft") {
      const [cpRes, addonRes, payRes] = await Promise.all([
        checkpointsAPI.list(id as string).catch(() => ({ data: [] })),
        addonsAPI.list(id as string).catch(() => ({ data: [] as QuoteAddon[] })),
        paymentsAPI.list(id as string).catch(() => ({ data: [] as PaymentRecord[] })),
      ]);
      setCheckpoints(cpRes.data ?? []);
      setAddons(addonRes.data ?? []);
      setPayments(payRes.data ?? []);
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les données du devis.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, loadQuote]);

  const sendQuote = async () => {
    if (!quote) return;
    setSendingQuote(true);
    try {
      await authAPI.put(`/quotes/${quote.id}`, { status: "pending" });
      setQuote({ ...quote, status: "pending" });
      const token = getToken();
      if (token) await loadQuote(token);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'envoi. Réessayez.", "error");
    } finally {
      setSendingQuote(false);
      setConfirmSendOpen(false);
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
    } catch (err) {
      setAddonMessage(err instanceof Error ? err.message : "Impossible d'envoyer la demande. Réessayez.");
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
      setReportingOpen(false);
      setResponseOpen(false);
      setReportMessage("Votre signalement a été transmis à l'atelier.");
    } catch (err) {
      setReportMessage(err instanceof Error ? err.message : "Impossible d'envoyer le signalement. Réessayez.");
    } finally {
      setReportSending(false);
    }
  };

  const confirmQuote = async () => {
    if (!quote) return;
    setConfirmingQuote(true);
    try {
      await authAPI.post(`/quotes/${quote.id}/confirm`, {});
      showToast("Devis validé — vous pouvez payer la tranche 1.", "success");
      const token = getToken();
      if (token) await loadQuote(token);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impossible de valider ce devis.", "error");
    } finally {
      setConfirmingQuote(false);
    }
  };

  const refuseQuote = async () => {
    if (!quote) return;
    if (!window.confirm("Refuser ce devis ?")) return;
    setRefusingQuote(true);
    try {
      await authAPI.put(`/quotes/${quote.id}`, { status: "rejected" });
      showToast("Devis refusé.", "success");
      const token = getToken();
      if (token) await loadQuote(token);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impossible de refuser ce devis.", "error");
    } finally {
      setRefusingQuote(false);
    }
  };

  const submitProof = async () => {
    if (!quote) return;
    setProofMessage(null);
    if (transactionRef.trim().length < 5) {
      setProofMessage("La référence de transaction doit comporter au moins 5 caractères.");
      return;
    }
    if (!proofFile) {
      setProofMessage("La preuve image/PDF de votre paiement est obligatoire.");
      return;
    }
    if (proofFile.size > 10 * 1024 * 1024) {
      setProofMessage("Le fichier ne doit pas dépasser 10 Mo.");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(proofFile.type)) {
      setProofMessage("Format non autorisé : JPG, PNG, WEBP ou PDF.");
      return;
    }
    setUploadingProof(true);
    try {
      const data = new FormData();
      data.append("payment_type", paymentType);
      data.append("transaction_ref", transactionRef.trim());
      data.append("proof_of_payment", proofFile);
      await authAPI.post(`/quotes/${quote.id}/payments`, data);
      setProofMessage("Preuve envoyée — en attente de vérification par l'atelier.");
      setTransactionRef("");
      setProofFile(null);
      const token = getToken();
      if (token) await loadQuote(token);
    } catch (e) {
      setProofMessage(e instanceof Error ? e.message : "Envoi impossible. Réessayez.");
    } finally {
      setUploadingProof(false);
    }
  };

  const showPayment = quote && Number(quote.amount ?? 0) > 0 && ["sent", "accepted", "production", "completed"].includes(quote.status ?? "");
  const showActions = quote?.status === "draft";

  const displayCheckpoints: Checkpoint[] = checkpoints.map((cp) => ({
    id: cp.id,
    title: cp.title,
    desc: cp.description ?? "",
    meta: cp.validated_at
      ? `Validé le ${formatDate(cp.validated_at)}`
      : cp.status === "upcoming" ? "À venir" : "",
    state: cp.status === "done" ? "done" : cp.status === "upcoming" ? "upcoming" : ("action" as const),
  }));

  const displayAddons: Addon[] = addons.map((a) => ({
    id: a.id,
    title: a.title,
    desc: a.description ?? "",
    price: Number(a.price ?? 0),
    status: (a.status ?? "pending") as Addon["status"],
  }));

  const depositPayment = payments.find((p) => p.phase === "deposit");
  const balancePayment = payments.find((p) => p.phase === "balance");

  if (loading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="loading-screen"><div className="loading-text">Chargement…</div></div>
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

  const quoteFiles = parseQuoteFiles(quote);
  const quoteNotifications = Array.isArray(quote.notifications) ? quote.notifications : [];
  const warnItems = quoteNotifications.filter((n) => n.type === "delay" || n.type === "error");
  const goodItems = quoteNotifications.filter((n) => n.type === "info");

  const pendingAddonCount = displayAddons.filter((a) => a.status === "pending").length;
  const totalAddons = displayAddons.reduce((s, a) => s + (a.status === "included" ? a.price : 0), 0);
  const balanceAmount = balancePayment?.amount ?? quote.balance_amount ?? Number(quote.amount ?? 0) / 2;
  const formatNumber = (n: number) => n.toLocaleString("fr-FR");

  const cmd = commandes[0] ?? null;
  const prodIdx = productionIndex(cmd?.statut_production);
  const hasCommande = !!cmd;
  const progressPct = hasCommande
    ? Math.round(((prodIdx < 0 ? 0 : prodIdx + 1) / STATUTS_PRODUCTION.length) * 100)
    : quote.status === "accepted" || quote.status === "production" ? 15 : quote.status === "sent" ? 8 : 3;
  const currentStepLabel = hasCommande
    ? (cmd?.statut_production ?? "En attente matière")
    : quote.status === "sent" ? "Devis envoyé" : quote.status === "accepted" ? "Devis accepté" : quote.status === "draft" ? "Brouillon" : (STATUS_LABELS[quote.status ?? ""] ?? quote.status);

  const payLabel = (p?: PaymentRecord | null) => {
    if (!p) return "À venir";
    if (p.status === "verified") return "Payé";
    if (p.status === "rejected") return "Preuve rejetée";
    if (p.proof_path) return "Preuve envoyée";
    return "À payer";
  };
  const activePayment = depositPayment?.status !== "verified" ? depositPayment : balancePayment;
  const canUpload = !!showPayment && quote.status !== "sent" && !!activePayment && (activePayment.status === "rejected" || !activePayment.proof_path);

  const rejectedProof = depositPayment?.status === "rejected" ? depositPayment : balancePayment?.status === "rejected" ? balancePayment : null;
  const needsValidation = quote.status === "sent";
  const actionNeeded: { label: string; title: string; text: string } | null =
    rejectedProof ? { label: "Preuve rejetée", title: `Tranche ${rejectedProof.phase === "deposit" ? "1" : "2"} à renvoyer`, text: rejectedProof.review_note ?? "La preuve a été rejetée par l'atelier. Déposez une nouvelle preuve ci-dessous." }
    : needsValidation ? { label: "Validation requise", title: "Validez votre devis", text: "L'atelier vous a envoyé le chiffrage. Validez-le pour ouvrir la tranche 1 — aucun paiement n'est dû avant validation." }
    : quote.status === "needs_info" ? { label: "Information requise", title: "L'atelier attend des précisions", text: "Contactez l'atelier ou complétez votre demande pour débloquer le chiffrage." }
    : warnItems.length > 0 ? { label: "Problème signalé", title: "Point d'attention de l'atelier", text: warnItems[0].message }
    : null;

  const timeline: { date: string; step: string; title: string; desc: string; tag: string; tone: "success" | "current" | "warning" | "problem" }[] = [];
  timeline.push({ date: formatDateShort(quote.created_at) || "Début", step: "Demande", title: "Demande envoyée", desc: quote.message ? quote.message.slice(0, 140) : "Votre demande a été transmise à l'atelier.", tag: "EFFECTUÉ", tone: "success" });
  if (quote.status && quote.status !== "draft" && quote.status !== "pending") {
    timeline.push({ date: "", step: "Devis", title: `Devis ${STATUS_LABELS[quote.status] ?? quote.status}`, desc: `Montant chiffré : ${formatCurrency(quote.amount)}.`, tag: quote.status === "sent" ? "ACTION REQUISE" : "EFFECTUÉ", tone: quote.status === "sent" ? "current" : "success" });
  }
  if (depositPayment?.status === "verified") timeline.push({ date: formatDateShort(depositPayment.reviewed_at ?? depositPayment.created_at), step: "Tranche 1", title: "Acompte vérifié — production lancée", desc: `${formatCurrency(depositPayment.amount)} vérifiés par l'atelier.`, tag: "EFFECTUÉ", tone: "success" });
  else if (depositPayment?.proof_path) timeline.push({ date: formatDateShort(depositPayment.created_at), step: "Tranche 1", title: "Preuve d'acompte envoyée", desc: "En attente de vérification par l'atelier.", tag: "EN COURS", tone: "current" });
  displayCheckpoints.filter((c) => c.state === "done").slice(-3).forEach((c) => {
    timeline.push({ date: "", step: "Production", title: c.title, desc: c.desc || c.meta, tag: "EFFECTUÉ", tone: "success" });
  });
  warnItems.slice(0, 2).forEach((w) => {
    timeline.push({ date: "", step: "Atelier", title: "Point d'attention", desc: w.message, tag: "INFORMATION", tone: "warning" });
  });
  if (balancePayment?.status === "verified") timeline.push({ date: formatDateShort(balancePayment.reviewed_at ?? balancePayment.created_at), step: "Tranche 2", title: "Solde vérifié", desc: `${formatCurrency(balancePayment.amount)} soldés.`, tag: "EFFECTUÉ", tone: "success" });

  const user = typeof window !== "undefined" ? getUser() : null;
  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Client";

  return (
    <>
      <style>{globalStyles}</style>
      <header className="topbar">
        <Link href="/" className="wordmark">JMR <span>Textile</span></Link>
        <nav className="topnav">
          <Link href="/">Accueil</Link>
          <Link href="/mon-profil/devis">Mes devis</Link>
          <span className="user">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
            {userName}
          </span>
        </nav>
      </header>

      <main>
        <div className="breadcrumb">
          <Link href="/mon-profil">Tableau de bord</Link><span>›</span>
          <Link href="/mon-profil/devis">Mes devis</Link><span>›</span>
          <span className="breadcrumb-current">Devis #{shortId(quote.id)}</span>
        </div>

        <section className="page-head">
          <div>
            <p className="eyebrow">Suivi de devis</p>
            <h1>{quote.name || (quote.category ? (CATEGORY_LABELS[quote.category] ?? quote.category) : "Devis")}</h1>
            <p className="order-description">
              {[quote.quantite ? `${quote.quantite} pièces` : null, quote.tissu, quote.coupe].filter(Boolean).join(" · ") || "Projet sur-mesure"}
            </p>
            <p className="order-ref">Référence #{shortId(quote.id)} · envoyé le {formatDate(quote.created_at)}</p>
          </div>
          <span className="status"><span className="status-dot" />{STATUS_LABELS[quote.status ?? ""] ?? quote.status}</span>
        </section>

        {/* Brouillon */}
        {showActions && (
          <section className="card action-card" style={{ marginBottom: 24 }}>
            <div className="action-body">
              <p className="action-text" style={{ margin: "0 0 14px" }}>Ce devis est encore <b>en brouillon</b> — modifiez-le avant de l&apos;envoyer à l&apos;atelier.</p>
              <div className="response-actions">
                <Link href={`/demande-devis?draft=${quote.id}`} className="btn btn-secondary">Modifier le brouillon</Link>
                <button className="btn btn-primary" onClick={() => setConfirmSendOpen(true)} disabled={sendingQuote}>{sendingQuote ? "Envoi…" : "Envoyer le devis"}</button>
                <button className="btn btn-secondary" onClick={() => setConfirmDeleteOpen(true)}>Supprimer</button>
              </div>
            </div>
          </section>
        )}

        {/* Validation client */}
        {quote.status === "sent" && (
          <section className="card action-card" style={{ marginBottom: 24 }}>
            <div className="action-body">
              <p className="action-label">Validation requise</p>
              <h3 className="action-title">Validez votre devis — {formatCurrency(quote.amount)}</h3>
              <p className="action-text">Aucun paiement n&apos;est dû avant validation. Après validation, la tranche 1 (acompte 50%) ouvrira le paiement.</p>
              <div className="response-actions">
                <button className="btn btn-primary" onClick={confirmQuote} disabled={confirmingQuote}>{confirmingQuote ? "Validation…" : "Valider le devis"}</button>
                <button className="btn btn-secondary" onClick={refuseQuote} disabled={refusingQuote}>{refusingQuote ? "Refus…" : "Refuser"}</button>
              </div>
            </div>
          </section>
        )}

        <div className="layout">
          <div>
            {/* TRACKER */}
            <section className="card progress-card">
              <div className="progress-head">
                <div>
                  <p className="progress-label">Étape actuelle</p>
                  <p className="progress-current">{currentStepLabel}</p>
                </div>
                <div className="progress-percent">{progressPct}%</div>
              </div>
              <div className="stepper">
                <div className="stepper-track" />
                <div className="stepper-progress" style={{ width: `${hasCommande ? Math.max(8, (prodIdx + 1) * 16) : 8}%` }} />
                {STATUTS_PRODUCTION.map((s, i) => {
                  const done = hasCommande && prodIdx >= 0 && i < prodIdx;
                  const current = hasCommande && i === prodIdx;
                  return (
                    <div key={s} className={`step${done ? " done" : ""}${current ? " current" : ""}`}>
                      <span className="step-circle">{done ? (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>) : null}</span>
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
                  <p className="update-title">{hasCommande ? `Commande ${cmd?.numero} — ${cmd?.statut_production}` : `Devis ${STATUS_LABELS[quote.status ?? ""] ?? quote.status}`}</p>
                  <p className="update-text">
                    {hasCommande ? `${cmd?.pieces_produites ?? 0} / ${cmd?.quantite ?? 0} pièces produites.` : "Suivi mis à jour automatiquement par l'atelier."}
                    {quote.date_livraison_prevue ? ` Livraison estimée : ${formatDate(quote.date_livraison_prevue)}.` : ""}
                  </p>
                </div>
              </div>
            </section>

            {/* DOUBLE TRANCHE */}
            {showPayment && (
              <section className="card" style={{ marginTop: 24 }}>
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Paiement en 2 tranches</h2>
                    <p className="card-subtitle">Preuve image/PDF obligatoire · vérifiée par l&apos;atelier</p>
                  </div>
                  <span className="pay-total">{formatCurrency(quote.amount)}</span>
                </div>
                <div className="tranche-grid">
                  {(["deposit", "balance"] as const).map((phase) => {
                    const p = phase === "deposit" ? depositPayment : balancePayment;
                    const amount = phase === "deposit"
                      ? (depositPayment?.amount ?? quote.deposit_amount ?? Number(quote.amount ?? 0) / 2)
                      : (balancePayment?.amount ?? balanceAmount);
                    const isActive = activePayment?.phase === phase && activePayment?.id === p?.id;
                    return (
                      <div key={phase} className={`tranche${p?.status === "verified" ? " is-paid" : ""}${isActive && canUpload ? " is-active" : ""}`}>
                        <div className="tranche-top">
                          <span className="tranche-name">{phase === "deposit" ? "Tranche 1 · Acompte (50%)" : "Tranche 2 · Solde (50%)"}</span>
                          <span className={`pill${p?.status === "verified" ? " ok" : p?.status === "rejected" ? " ko" : p?.proof_path ? " wait" : ""}`}>{payLabel(p)}</span>
                        </div>
                        <p className="tranche-amount">{formatCurrency(amount)}</p>
                        <p className="tranche-desc">
                          {p?.status === "verified"
                            ? phase === "deposit" ? "Vérifié — production lancée." : "Vérifié — dossier soldé."
                            : p?.status === "rejected" ? (p.review_note ?? "Preuve rejetée — renvoyez une preuve.")
                            : p?.proof_path ? "Preuve envoyée — en attente de vérification."
                            : phase === "deposit"
                              ? (quote.status === "sent" ? "Disponible après validation du devis." : "Payez puis déposez la preuve ci-dessous.")
                              : (depositPayment?.status !== "verified" ? "Disponible après vérification de la tranche 1." : totalAddons > 0 ? `Solde + ${formatCurrency(totalAddons)} d'ajouts validés.` : "Payez puis déposez la preuve ci-dessous.")}
                        </p>
                        {p?.transaction_ref && <p className="tranche-ref">Réf : {p.transaction_ref}</p>}
                      </div>
                    );
                  })}
                </div>
                {quote.status === "sent" ? (
                  <div className="response-body"><p className="response-text">Validez d&apos;abord le devis ci-dessus — aucun paiement n&apos;est dû pour l&apos;instant.</p></div>
                ) : canUpload && activePayment ? (
                  <div className="response-body">
                    <p className="response-text">
                      {activePayment.phase === "deposit" ? "Tranche 1 — l'acompte vérifié démarre la production." : "Tranche 2 — solde (+ ajouts validés)."} Déposez la preuve de paiement :
                    </p>
                    <div className="pay-form">
                      <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                        <option value="mvola">MVola</option>
                        <option value="orange_money">Orange Money</option>
                        <option value="virement">Virement bancaire</option>
                      </select>
                      <input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder="Référence transaction (min 5 caractères)" />
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
                      <div className="response-actions">
                        <button className="btn btn-primary" onClick={submitProof} disabled={uploadingProof}>{uploadingProof ? "Envoi…" : "Envoyer la preuve"}</button>
                      </div>
                      {proofMessage && <p className="form-status">{proofMessage}</p>}
                    </div>
                  </div>
                ) : activePayment?.proof_path && activePayment.status === "submitted" ? (
                  <div className="response-body"><p className="response-text">Preuve déjà transmise — l&apos;atelier la vérifie. Nouveau dépôt possible si rejetée.</p></div>
                ) : null}
              </section>
            )}

            {/* ACTION REQUISE */}
            {actionNeeded && (
              <section className="card action-card" style={{ marginTop: 24 }}>
                <div className="card-header">
                  <div><h2 className="card-title">Action requise</h2><p className="card-subtitle">Votre intervention est nécessaire</p></div>
                </div>
                <div className="action-body">
                  <p className="action-label">{actionNeeded.label}</p>
                  <h3 className="action-title">{actionNeeded.title}</h3>
                  <p className="action-text">{actionNeeded.text}</p>
                  <button className="btn btn-primary" onClick={() => { setResponseOpen(true); setReportingOpen(true); }}>
                    {rejectedProof ? "Renvoyer une preuve" : quote.status === "sent" ? "Valider le devis" : "Voir le problème"}
                  </button>
                </div>
              </section>
            )}

            {/* ÉTAPES À VALIDER */}
            {displayCheckpoints.length > 0 && (
              <section className="card" style={{ marginTop: 24 }}>
                <div className="card-header">
                  <div><h2 className="card-title">Étapes à valider</h2><p className="card-subtitle">{displayCheckpoints.filter((c) => c.state === "action").length} en attente de votre validation</p></div>
                </div>
                <div className="timeline">
                  {displayCheckpoints.map((cp) => (
                    <article key={cp.id} className={`timeline-item${cp.state === "done" ? " success" : cp.state === "action" ? " current" : ""}`}>
                      <div className="timeline-date">{cp.state === "done" ? "Fait" : cp.state === "action" ? "À valider" : "À venir"}</div>
                      <div className="timeline-marker"><span className="timeline-dot" /></div>
                      <div>
                        <h3 className="timeline-title">{cp.title}</h3>
                        {cp.desc && <p className="timeline-description">{cp.desc}</p>}
                        {cp.meta && <p className="timeline-description">{cp.meta}</p>}
                        {cp.state === "action" && (
                          <div className="response-actions" style={{ marginTop: 8 }}>
                            <button className="btn btn-primary" onClick={() => validateCheckpoint(cp.id)} disabled={validatingCp === cp.id}>{validatingCp === cp.id ? "Validation…" : "Valider cette étape"}</button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* HISTORIQUE */}
            <section className="card" style={{ marginTop: 24 }}>
              <div className="card-header">
                <div><h2 className="card-title">Historique de la commande</h2><p className="card-subtitle">Toutes les mises à jour communiquées par l&apos;atelier</p></div>
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
                      <div className="timeline-meta"><span className={`timeline-tag tag-${t.tone === "success" ? "success" : t.tone === "current" ? "warning" : t.tone}`}>{t.tag}</span><span>Atelier JMR Textile</span></div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* AJOUTS */}
            <section className="card" style={{ marginTop: 24 }}>
              <div className="card-header">
                <div><h2 className="card-title">Ajouts demandés</h2><p className="card-subtitle">En production vous pouvez augmenter le devis — chiffré puis ajouté au solde</p></div>
                {displayAddons.length > 0 && <span className="pay-total">+{formatNumber(displayAddons.reduce((s, a) => s + (a.price > 0 ? a.price : 0), 0))} Ar</span>}
              </div>
              <div className="response-body">
                {displayAddons.length === 0 ? (
                  <p className="response-text">Aucun ajout pour le moment — décrivez une modification ci-dessous.</p>
                ) : (
                  displayAddons.map((a) => (
                    <div key={a.id} className="addon-row">
                      <div><b>{a.title}</b><p>{a.desc}</p></div>
                      <div className="addon-right"><span>+{formatNumber(a.price)} Ar</span><span className={`pill${a.status === "included" ? " ok" : a.status === "rejected" ? " ko" : " wait"}`}>{a.status === "included" ? "Inclus au solde" : a.status === "rejected" ? "Refusé" : "En chiffrage"}</span></div>
                    </div>
                  ))
                )}
                {totalAddons > 0 && <p className="response-text"><b>+{formatNumber(totalAddons)} Ar</b> d&apos;ajouts validés — inclus dans la tranche 2.</p>}
                {addonMessage && <p className="form-status">{addonMessage}</p>}
                <button className="btn btn-secondary" onClick={() => setAddonFormOpen(!addonFormOpen)}>Demander un ajout</button>
                {addonFormOpen && (
                  <div className="pay-form" style={{ marginTop: 12 }}>
                    <textarea value={addonText} onChange={(e) => setAddonText(e.target.value)} placeholder="Ex. : Ajouter un motif brodé sur la manche gauche…" />
                    <div className="response-actions">
                      <button className="btn btn-primary" onClick={submitAddon} disabled={addonSending || !addonText.trim()}>{addonSending ? "Envoi…" : "Envoyer la demande"}</button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* RÉPONSE / REMARQUE */}
            <section className="card response-card" style={{ display: responseOpen || reportingOpen ? "block" : "none" }}>
              <div className="card-header">
                <div><h2 className="card-title">Répondre / remarque</h2><p className="card-subtitle">Fichier + message à l&apos;atelier</p></div>
              </div>
              <div className="response-body">
                <p className="response-text">Envoyez un fichier ou un commentaire à l&apos;atelier.</p>
                <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Ajouter un message..." />
                <div className="response-actions">
                  <button className="btn btn-primary" onClick={submitReport} disabled={reportSending || !reportText.trim()}>{reportSending ? "Envoi…" : "Envoyer la réponse"}</button>
                  <button className="btn btn-secondary" onClick={() => { setResponseOpen(false); setReportingOpen(false); }}>Annuler</button>
                </div>
                {reportMessage && <p className="form-status">{reportMessage}</p>}
              </div>
            </section>
            {!responseOpen && !reportingOpen && (
              <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => { setResponseOpen(true); setReportingOpen(true); }}>Faire une remarque</button>
            )}
          </div>

          <aside>
            <section className="card">
              <div className="card-header"><div><h2 className="card-title">Commande</h2><p className="card-subtitle">Informations générales</p></div></div>
              <div className="info-body">
                <div className="info-row"><span className="info-label">Référence</span><span className="info-value">#{shortId(quote.id)}</span></div>
                <div className="info-row"><span className="info-label">Quantité</span><span className="info-value">{quote.quantite ?? cmd?.quantite ?? "—"} pièces</span></div>
                <div className="info-row"><span className="info-label">Produit</span><span className="info-value">{quote.category ? (CATEGORY_LABELS[quote.category] ?? quote.category) : "—"}</span></div>
                <div className="info-row"><span className="info-label">Matière</span><span className="info-value">{quote.tissu ?? "—"}</span></div>
                <div className="info-row"><span className="info-label">Grammage</span><span className="info-value">{quote.grammage ?? "—"}</span></div>
                <div className="info-row"><span className="info-label">Total</span><span className="info-value">{formatCurrency(quote.amount)}</span></div>
              </div>
            </section>

            <section className="card" style={{ marginTop: 20 }}>
              <div className="card-header"><div><h2 className="card-title">Livraison</h2><p className="card-subtitle">Estimation actuelle</p></div></div>
              <div className="delivery-body">
                <p className="delivery-date">{formatDate(quote.date_livraison_prevue ?? cmd?.date_livraison_prevue)}</p>
                <div className="delivery-line" />
                <p className="delivery-text">Cette date peut évoluer selon l&apos;avancement. Vous serez informé automatiquement.</p>
              </div>
            </section>

            <section className="card" style={{ marginTop: 20 }}>
              <div className="card-header"><div><h2 className="card-title">Notifications</h2><p className="card-subtitle">Concernant ce dossier</p></div></div>
              <div className="notification-list">
                {[...goodItems, ...warnItems].length === 0 ? (
                  <div className="notification-item"><div className="notification-content"><p className="notification-title">Aucune notification</p></div></div>
                ) : (
                  [...goodItems, ...warnItems].slice(0, 5).map((n, i) => (
                    <div key={i} className="notification-item"><span className="notification-status" /><div className="notification-content"><p className="notification-title">{n.message}</p><p className="notification-time">{formatDateShort(n.date ?? n.created_at)}</p></div></div>
                  ))
                )}
              </div>
            </section>

            {quoteFiles.length > 0 && (
              <section className="card" style={{ marginTop: 20 }}>
                <div className="card-header"><div><h2 className="card-title">Fichiers</h2><p className="card-subtitle">{quoteFiles.length} fichier(s)</p></div></div>
                <div className="notification-list">
                  {quoteFiles.map((f, i) => (
                    <div key={i} className="notification-item"><div className="notification-content"><a className="notification-title" style={{ color: "var(--gold)" }} href={safeUrl(f.url)} target="_blank" rel="noopener noreferrer">{f.name || "Fichier joint"}</a></div></div>
                  ))}
                </div>
              </section>
            )}

            <section className="card" style={{ marginTop: 20 }}>
              <div className="card-header"><div><h2 className="card-title">Besoin d&apos;aide ?</h2><p className="card-subtitle">Une question sur ce dossier ?</p></div></div>
              <div className="response-body">
                <p className="response-text">Contactez directement l&apos;équipe JMR Textile.</p>
                <Link href="/contact" className="btn btn-secondary">Contacter l&apos;atelier</Link>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <ConfirmDialog
        open={confirmSendOpen}
        title="Envoyer ce devis à l'atelier ?"
        message="Cette action est irréversible. Vous ne pourrez plus le modifier après l'envoi."
        confirmLabel="Envoyer"
        tone="primary"
        loading={sendingQuote}
        onCancel={() => setConfirmSendOpen(false)}
        onConfirm={sendQuote}
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Supprimer ce brouillon ?"
        message="Cette action est définitive. Le brouillon sera supprimé de votre espace."
        confirmLabel="Supprimer"
        tone="danger"
        loading={false}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          if (!quote) return;
          try {
            await authAPI.delete(`/quotes/${quote.id}`);
            router.push("/mon-profil/devis");
          } catch (err) {
            showToast(err instanceof Error ? err.message : "Erreur lors de la suppression.", "error");
            setConfirmDeleteOpen(false);
          }
        }}
      />
    </>
  );
}

export default function DevisDetailPage() {
  return (
    <Suspense fallback={
      <div className="loading-screen"><div className="loading-text">Chargement…</div></div>
    }>
      <DevisDetailContent />
    </Suspense>
  );
}

const globalStyles = `
:root{
  --navy-950:#0f1826;
  --navy-900:#1b263c;
  --navy-850:#1e2a38;
  --navy-800:#25303a;
  --navy-border:#2b3852;
  --gold:#FFB42D;
  --gold-bright:#FFC964;
  --cream:#f3efe4;
  --slate:#8b93a7;
  --slate-dim:#5c6478;
  --green:#5cb87d;
  --blue:#5c9ad9;
  --purple:#a08fd1;
  --orange:#e08b52;
  --red:#e05252;
  --serif:'Fraunces',Georgia,serif;
  --sans:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-font-smoothing:antialiased;scroll-behavior:smooth;}
body{margin:0;background:var(--navy-950);color:var(--cream);font-family:var(--sans);line-height:1.5;}
button,input,textarea,select{font:inherit;}
button{cursor:pointer;}
a{color:inherit;text-decoration:none;}
:focus-visible{outline:2px solid var(--gold-bright);outline-offset:3px;}
.topbar{height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;border-bottom:1px solid var(--navy-border);}
.wordmark{font-family:var(--serif);font-size:22px;font-weight:600;color:var(--gold-bright);}
.wordmark span{color:var(--cream);}
.topnav{display:flex;align-items:center;gap:28px;color:var(--slate);font-size:14px;}
.topnav a:hover{color:var(--cream);}
.user{display:flex;align-items:center;gap:8px;padding-left:20px;border-left:1px solid var(--navy-border);color:var(--cream);}
main{width:min(1120px,calc(100% - 80px));margin:0 auto;padding:38px 0 80px;}
.breadcrumb{display:flex;align-items:center;gap:8px;margin-bottom:22px;color:var(--slate-dim);font-size:13px;}
.breadcrumb a:hover{color:var(--cream);}
.breadcrumb-current{color:var(--slate);}
.page-head{display:flex;justify-content:space-between;align-items:flex-start;gap:30px;padding-bottom:26px;border-bottom:1px solid var(--navy-border);}
.eyebrow{margin:0 0 6px;color:var(--gold-bright);font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;}
h1{margin:0;font-family:var(--serif);font-size:36px;line-height:1.15;font-weight:600;color:var(--cream);}
.order-description{margin:8px 0 0;color:var(--slate);font-size:14px;}
.order-ref{margin-top:8px;color:var(--slate-dim);font-family:monospace;font-size:12px;}
.status{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;color:var(--gold-bright);background:rgba(255,180,45,.14);font-size:12px;font-weight:600;white-space:nowrap;}
.status-dot{width:7px;height:7px;border-radius:50%;background:currentColor;}
.layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(280px,.8fr);gap:24px;margin-top:28px;}
.card{background:var(--navy-850);border:1px solid var(--navy-border);border-radius:11px;}
.card-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px 17px;border-bottom:1px solid var(--navy-border);}
.card-title{margin:0;font-family:var(--serif);font-size:19px;font-weight:500;color:var(--cream);}
.card-subtitle{margin:4px 0 0;color:var(--slate-dim);font-size:12px;}
.pay-total{color:var(--gold-bright);font-family:var(--serif);font-size:20px;white-space:nowrap;}
.progress-card{padding:25px 24px 27px;}
.progress-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;}
.progress-label{margin:0;color:var(--slate);font-size:13px;}
.progress-current{margin:4px 0 0;color:var(--cream);font-family:var(--serif);font-size:22px;}
.progress-percent{color:var(--gold-bright);font-family:var(--serif);font-size:25px;}
.stepper{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:0;}
.stepper-track{position:absolute;left:12px;right:12px;top:10px;height:2px;background:var(--navy-border);}
.stepper-progress{position:absolute;left:12px;top:10px;height:2px;background:var(--gold);}
.step{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;}
.step-circle{width:21px;height:21px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--navy-850);border:2px solid var(--navy-border);color:var(--navy-950);}
.step.done .step-circle{background:var(--gold);border-color:var(--gold);}
.step.current .step-circle{border-color:var(--gold);box-shadow:0 0 0 5px rgba(255,180,45,.15);}
.step-name{max-width:105px;margin-top:11px;color:var(--slate-dim);font-size:11.5px;line-height:1.35;}
.step.done .step-name,.step.current .step-name{color:var(--cream);}
.step-date{margin-top:3px;color:var(--slate-dim);font-size:10px;}
.step.current .step-date{color:var(--gold-bright);}
.last-update{display:flex;gap:13px;margin-top:30px;padding-top:18px;border-top:1px dashed var(--navy-border);}
.update-icon{width:34px;height:34px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:50%;color:var(--gold-bright);background:rgba(255,180,45,.1);}
.update-label{margin:0 0 2px;color:var(--slate-dim);font-size:11px;}
.update-title{margin:0;color:var(--cream);font-size:14px;font-weight:500;}
.update-text{margin:4px 0 0;color:var(--slate);font-size:13px;}
.action-card{border-color:rgba(255,180,45,.45);background:linear-gradient(135deg,rgba(255,180,45,.08),transparent 55%),var(--navy-850);}
.action-body{padding:20px 22px 22px;}
.action-label{margin:0 0 3px;color:var(--orange);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;}
.action-title{margin:0;font-family:var(--serif);font-size:17px;font-weight:500;color:var(--cream);}
.action-text{margin:14px 0 18px;color:var(--slate);font-size:13px;line-height:1.6;}
.action-text b{color:var(--cream);}
.btn{border:0;border-radius:7px;padding:10px 14px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:8px;}
.btn-primary{background:var(--gold);color:#1a1204;}
.btn-primary:hover{background:var(--gold-bright);}
.btn-primary:disabled{opacity:.6;cursor:not-allowed;}
.btn-secondary{background:transparent;border:1px solid var(--navy-border);color:var(--cream);}
.btn-secondary:hover{border-color:var(--gold);color:var(--gold-bright);}
.timeline{padding:7px 22px 20px;}
.timeline-item{position:relative;display:grid;grid-template-columns:70px 20px 1fr;gap:13px;padding:17px 0;border-bottom:1px solid var(--navy-border);}
.timeline-item:last-child{border-bottom:0;}
.timeline-date{padding-top:2px;color:var(--slate-dim);font-size:11px;text-align:right;}
.timeline-marker{position:relative;display:flex;justify-content:center;}
.timeline-marker::before{content:"";position:absolute;top:15px;bottom:-35px;width:1px;background:var(--navy-border);}
.timeline-item:last-child .timeline-marker::before{display:none;}
.timeline-dot{position:relative;z-index:2;width:9px;height:9px;margin-top:4px;border-radius:50%;background:var(--slate-dim);border:2px solid var(--navy-850);box-shadow:0 0 0 1px var(--navy-border);}
.timeline-item.success .timeline-dot{background:var(--green);}
.timeline-item.current .timeline-dot{background:var(--gold);box-shadow:0 0 0 1px var(--gold),0 0 0 5px rgba(255,180,45,.12);}
.timeline-item.warning .timeline-dot{background:var(--orange);}
.timeline-item.problem .timeline-dot{background:var(--red);}
.timeline-step{margin:0 0 3px;color:var(--slate-dim);font-size:11px;text-transform:uppercase;letter-spacing:.035em;}
.timeline-title{margin:0;color:var(--cream);font-size:14px;font-weight:500;}
.timeline-description{margin:5px 0 0;color:var(--slate);font-size:13px;line-height:1.55;}
.timeline-meta{display:flex;align-items:center;gap:9px;margin-top:8px;color:var(--slate-dim);font-size:10.5px;}
.timeline-tag{padding:3px 7px;border-radius:5px;font-size:10px;}
.tag-success{color:var(--green);background:rgba(92,184,125,.1);}
.tag-warning{color:var(--orange);background:rgba(224,139,82,.1);}
.tag-current{color:var(--gold-bright);background:rgba(255,180,45,.12);}
.tag-problem{color:var(--red);background:rgba(224,82,82,.1);}
.info-body{padding:19px 22px;}
.info-row{display:flex;justify-content:space-between;gap:15px;padding:11px 0;border-bottom:1px solid var(--navy-border);}
.info-row:last-child{border-bottom:0;}
.info-label{color:var(--slate-dim);font-size:12px;}
.info-value{color:var(--cream);font-size:12.5px;font-weight:500;text-align:right;}
.delivery-body{padding:20px 22px;}
.delivery-date{margin:0;color:var(--gold-bright);font-family:var(--serif);font-size:23px;}
.delivery-line{height:1px;margin:12px 0 14px;background:repeating-linear-gradient(to right,var(--gold) 0 6px,transparent 6px 13px);opacity:.5;}
.delivery-text{margin:0;color:var(--slate);font-size:12px;}
.notification-list{padding:5px 0;}
.notification-item{display:flex;gap:12px;padding:15px 22px;border-bottom:1px solid var(--navy-border);}
.notification-item:last-child{border-bottom:0;}
.notification-status{width:7px;height:7px;flex-shrink:0;margin-top:6px;border-radius:50%;background:var(--gold);}
.notification-content{min-width:0;}
.notification-title{margin:0;color:var(--cream);font-size:12.5px;font-weight:500;}
.notification-time{margin:3px 0 0;color:var(--slate-dim);font-size:10.5px;}
.response-card{margin-top:24px;}
.response-body{padding:20px 22px 22px;}
.response-text{margin:0 0 15px;color:var(--slate);font-size:13px;}
.response-text b{color:var(--cream);}
.response-actions{display:flex;gap:9px;flex-wrap:wrap;}
.response-body textarea,.pay-form textarea{width:100%;min-height:90px;resize:vertical;padding:12px;background:var(--navy-900);border:1px solid var(--navy-border);border-radius:7px;color:var(--cream);margin-bottom:12px;}
.pay-form{display:grid;gap:10px;}
.pay-form select,.pay-form input[type="text"],.pay-form input:not([type]){background:var(--navy-900);border:1px solid var(--navy-border);border-radius:7px;padding:10px 12px;color:var(--cream);}
.pay-form input[type="file"]{color:var(--slate);font-size:12px;}
.tranche-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:20px 22px 0;}
.tranche{background:var(--navy-900);border:1px solid var(--navy-border);border-radius:10px;padding:18px;}
.tranche.is-paid{border-color:rgba(92,184,125,.4);}
.tranche.is-active{border-color:rgba(255,180,45,.55);box-shadow:0 0 0 1px rgba(255,180,45,.25);}
.tranche-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}
.tranche-name{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--slate);font-weight:700;}
.tranche-amount{font-family:var(--serif);font-size:24px;color:var(--gold-bright);margin:0 0 6px;}
.tranche-desc{font-size:12px;color:var(--slate);margin:0;}
.tranche-ref{font-size:11px;color:var(--slate-dim);font-family:monospace;margin:6px 0 0;}
.pill{display:inline-flex;align-items:center;font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:100px;background:var(--navy-800);color:var(--slate);border:1px solid var(--navy-border);white-space:nowrap;}
.pill.ok{background:rgba(92,184,125,.12);color:var(--green);border-color:rgba(92,184,125,.35);}
.pill.ko{background:rgba(224,82,82,.12);color:var(--red);border-color:rgba(224,82,82,.35);}
.pill.wait{background:rgba(255,180,45,.12);color:var(--gold-bright);border-color:rgba(255,180,45,.35);}
.addon-row{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--navy-border);font-size:13px;}
.addon-row:last-of-type{border-bottom:0;}
.addon-row p{margin:4px 0 0;color:var(--slate);font-size:12px;}
.addon-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;}
.form-status{font-size:12px;color:var(--gold-bright);}
.loading-screen{min-height:100vh;background:var(--navy-950);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;}
.loading-text{color:var(--gold);font-size:18px;}
.error-text{color:var(--red);font-size:18px;}
.back-link{color:var(--gold);text-decoration:underline;font-size:16px;}
@media(max-width:850px){.topbar{padding:0 22px;}.topnav a{display:none;}main{width:min(100% - 40px,700px);}.layout{grid-template-columns:1fr;}.stepper{grid-template-columns:repeat(3,1fr);gap:26px 8px;}.stepper-track,.stepper-progress{display:none;}.tranche-grid{grid-template-columns:1fr;}}
@media(max-width:560px){.topbar{height:64px;padding:0 18px;}.wordmark{font-size:20px;}.user{display:none;}main{width:calc(100% - 30px);padding-top:25px;}.page-head{flex-direction:column;gap:15px;}h1{font-size:29px;}.status{align-self:flex-start;}.timeline-item{grid-template-columns:52px 15px 1fr;gap:8px;}}
`;
