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

const DEVIS_STEPS = ["Demande envoyée", "Devis envoyé", "Devis validé", "Acompte vérifié", "Production", "Livraison"];

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

  const user = typeof window !== "undefined" ? getUser() : null;
  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Client";
  const userInitial = (userName.trim().charAt(0) || "C").toUpperCase();

  if (loading) {
    return (
      <div className="cmd-detail">
        <style>{detailStyles}</style>
        <div className="cmd-loading">Chargement…</div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="cmd-detail">
        <style>{detailStyles}</style>
        <div className="cmd-loading">
          <div className="cmd-error-text">{error ?? "Devis introuvable."}</div>
          <Link href="/mon-profil/devis" className="cmd-back">← Retour à mes devis</Link>
        </div>
      </div>
    );
  }

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

  // Étapes : production si commande, sinon cycle de vie du devis.
  let steps: string[] = DEVIS_STEPS;
  let doneIdx = -1;
  if (hasCommande) {
    steps = [...STATUTS_PRODUCTION];
    doneIdx = (prodIdx >= 0 ? prodIdx : 0) - 1;
  } else {
    const st = quote.status ?? "";
    doneIdx = st === "pending" ? 0
      : st === "sent" || st === "needs_info" ? 1
      : st === "accepted" ? 2
      : st === "production" ? 4
      : st === "completed" ? 5 : -1;
    const depOK = depositPayment?.status === "verified" || quote.deposit_paid;
    if ((st === "accepted" || st === "production") && depOK) doneIdx = Math.max(doneIdx, 3);
  }
  const activeIdx = Math.min(steps.length - 1, Math.max(0, doneIdx + 1));
  const progressPct = hasCommande
    ? Math.round((((prodIdx < 0 ? 0 : prodIdx) + 1) / steps.length) * 100)
    : Math.round(((doneIdx + 1) / steps.length) * 100);
  const currentStepLabel = hasCommande
    ? (cmd?.statut_production ?? "En attente matière")
    : quote.status === "sent" ? "Devis envoyé"
    : quote.status === "accepted" ? "Devis accepté"
    : quote.status === "draft" ? "Brouillon"
    : (STATUS_LABELS[quote.status ?? ""] ?? quote.status);

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
  timeline.push({ date: formatDateShort(quote.created_at) || "Début", step: "Demande", title: "Demande envoyée", desc: quote.message ? quote.message.slice(0, 140) : "Votre demande a été transmise à l'atelier.", tag: "Effectué", tone: "success" });
  if (quote.status && quote.status !== "draft" && quote.status !== "pending") {
    timeline.push({ date: "", step: "Devis", title: `Devis ${STATUS_LABELS[quote.status] ?? quote.status}`, desc: Number(quote.amount ?? 0) > 0 ? `Montant chiffré : ${formatCurrency(quote.amount)}.` : "L'atelier prépare votre chiffrage.", tag: quote.status === "sent" ? "Action requise" : "Effectué", tone: quote.status === "sent" ? "current" : "success" });
  }
  if (depositPayment?.status === "verified") timeline.push({ date: formatDateShort(depositPayment.reviewed_at ?? depositPayment.created_at), step: "Tranche 1", title: "Acompte vérifié — production lancée", desc: `${formatCurrency(depositPayment.amount)} vérifiés par l'atelier.`, tag: "Effectué", tone: "success" });
  else if (depositPayment?.proof_path) timeline.push({ date: formatDateShort(depositPayment.created_at), step: "Tranche 1", title: "Preuve d'acompte envoyée", desc: "En attente de vérification par l'atelier.", tag: "En cours", tone: "current" });
  displayCheckpoints.filter((c) => c.state === "done").slice(-3).forEach((c) => {
    timeline.push({ date: "", step: "Production", title: c.title, desc: c.desc || c.meta, tag: "Effectué", tone: "success" });
  });
  warnItems.slice(0, 2).forEach((w) => {
    timeline.push({ date: "", step: "Atelier", title: "Point d'attention", desc: w.message, tag: "Information", tone: "warning" });
  });
  if (balancePayment?.status === "verified") timeline.push({ date: formatDateShort(balancePayment.reviewed_at ?? balancePayment.created_at), step: "Tranche 2", title: "Solde vérifié", desc: `${formatCurrency(balancePayment.amount)} soldés.`, tag: "Effectué", tone: "success" });

  const amountNum = Number(quote.amount ?? 0);
  const refLine = [
    `#${shortId(quote.id)}`,
    quote.quantite ? `${quote.quantite} pièces` : null,
    quote.tissu ?? null,
    amountNum > 0 ? formatCurrency(quote.amount) : "En chiffrage",
  ].filter(Boolean).join(" · ");

  return (
    <div className="cmd-detail">
      <style>{detailStyles}</style>
      <header className="cmd-top">
        <Link href="/" className="cmd-logo">JMR <span>TEXTILE</span></Link>
        <nav className="cmd-nav">
          <Link href="/">Accueil</Link>
          <Link href="/nos-services">Nos services</Link>
          <Link href="/a-propos">À propos</Link>
        </nav>
        <div className="cmd-user"><span>{userName}</span><div className="cmd-avatar">{userInitial}</div></div>
      </header>

      <main className="cmd-wrap">
        <div className="cmd-crumb"><Link href="/mon-profil">Tableau de bord</Link> / <Link href="/mon-profil/devis">Devis</Link> / <b>#{shortId(quote.id)}</b></div>

        <section className="cmd-order-head">
          <div>
            <div className="cmd-eyebrow">Suivi de devis</div>
            <h1 className="cmd-title">{quote.name || (quote.category ? (CATEGORY_LABELS[quote.category] ?? quote.category) : "Devis")}</h1>
            <div className="cmd-ref">{refLine}</div>
          </div>
          <div className="cmd-status"><span className="cmd-dot"></span>{STATUS_LABELS[quote.status ?? ""] ?? quote.status}</div>
        </section>

        <div className="cmd-grid">
          <div>
            <section className="cmd-card">
              <h2>Progression du dossier</h2>
              <div className="cmd-sub">Suivez chaque étape de votre demande.</div>
              <div className="cmd-progress-row"><span>Avancement</span><strong className="cmd-percent">{progressPct}%</strong></div>
              <div className="cmd-bar"><i style={{ width: `${progressPct}%` }}></i></div>

              <div className="cmd-steps">
                {steps.map((s, i) => {
                  const done = i <= doneIdx;
                  const active = i === activeIdx && !done;
                  return (
                    <div key={s} className={`cmd-step${done ? " done" : ""}${active ? " active" : ""}`}>
                      <div className="cmd-circle">{done ? "✓" : (i + 1)}</div>
                      <div className="cmd-label">{s}</div>
                    </div>
                  );
                })}
              </div>

              <div className="cmd-update">
                <div className="cmd-icon">✓</div>
                <div>
                  <strong>Dernière mise à jour · {currentStepLabel}</strong>
                  <p>
                    {hasCommande ? `${cmd?.pieces_produites ?? 0} / ${cmd?.quantite ?? 0} pièces produites.` : "Suivi mis à jour automatiquement par l'atelier."}
                    {quote.date_livraison_prevue ? ` Livraison estimée : ${formatDate(quote.date_livraison_prevue)}.` : ""}
                  </p>
                </div>
              </div>

              {showActions && (
                <div className="cmd-action cmd-action-blue">
                  <div className="cmd-action-head">
                    <div className="cmd-icon">✎</div>
                    <div>
                      <strong>Brouillon en cours</strong>
                      <p>Modifiez-le avant de l&apos;envoyer à l&apos;atelier — après l&apos;envoi il ne sera plus modifiable.</p>
                      <div className="cmd-btn-row">
                        <Link href={`/demande-devis?draft=${quote.id}`} className="cmd-btn cmd-btn-ghost">Modifier le brouillon</Link>
                        <button className="cmd-btn" onClick={() => setConfirmSendOpen(true)} disabled={sendingQuote}>{sendingQuote ? "Envoi…" : "Envoyer le devis"}</button>
                        <button className="cmd-btn cmd-btn-ghost" onClick={() => setConfirmDeleteOpen(true)}>Supprimer</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {quote.status === "sent" && (
                <div className="cmd-action cmd-action-gold">
                  <div className="cmd-action-head">
                    <div className="cmd-icon">✓</div>
                    <div>
                      <strong>Validez votre devis — {formatCurrency(quote.amount)}</strong>
                      <p>Aucun paiement n&apos;est dû avant validation. Après validation, la tranche 1 (acompte 50%) ouvrira le paiement.</p>
                      <div className="cmd-btn-row">
                        <button className="cmd-btn" onClick={confirmQuote} disabled={confirmingQuote}>{confirmingQuote ? "Validation…" : "Valider le devis"}</button>
                        <button className="cmd-btn cmd-btn-ghost" onClick={refuseQuote} disabled={refusingQuote}>{refusingQuote ? "Refus…" : "Refuser"}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {actionNeeded && (
                <div className="cmd-action">
                  <div className="cmd-action-head">
                    <div className="cmd-icon">!</div>
                    <div>
                      <strong>{actionNeeded.label} — {actionNeeded.title}</strong>
                      <p>{actionNeeded.text}</p>
                      <button className="cmd-btn" onClick={() => { setResponseOpen(true); setReportingOpen(true); }}>
                        {rejectedProof ? "Renvoyer une preuve" : quote.status === "sent" ? "Valider le devis" : "Voir le problème"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(responseOpen || reportingOpen) && (
                <div className="cmd-response show">
                  <strong>Votre réponse</strong>
                  <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Écrivez votre réponse à l'équipe..." />
                  {reportMessage && <p className="cmd-form-status">{reportMessage}</p>}
                  <div className="cmd-btn-row">
                    <button className="cmd-btn" onClick={submitReport} disabled={reportSending || !reportText.trim()}>{reportSending ? "Envoi…" : "Envoyer à JMR Textile"}</button>
                    <button className="cmd-btn cmd-btn-ghost" onClick={() => { setResponseOpen(false); setReportingOpen(false); }}>Annuler</button>
                  </div>
                </div>
              )}
            </section>

            {showPayment && (
              <section className="cmd-card cmd-timeline">
                <h2>Paiement en 2 tranches</h2>
                <div className="cmd-sub">Preuve image/PDF obligatoire · vérifiée par l&apos;atelier · Total {formatCurrency(quote.amount)}</div>
                <div className="cmd-tranches">
                  {(["deposit", "balance"] as const).map((phase) => {
                    const p = phase === "deposit" ? depositPayment : balancePayment;
                    const amount = phase === "deposit"
                      ? (depositPayment?.amount ?? quote.deposit_amount ?? Number(quote.amount ?? 0) / 2)
                      : (balancePayment?.amount ?? balanceAmount);
                    const isActive = activePayment?.phase === phase && activePayment?.id === p?.id;
                    return (
                      <div key={phase} className={`cmd-tranche${p?.status === "verified" ? " paid" : ""}${isActive && canUpload ? " active" : ""}`}>
                        <div className="cmd-tranche-top">
                          <span>{phase === "deposit" ? "Tranche 1 · Acompte (50%)" : "Tranche 2 · Solde (50%)"}</span>
                          <span className={`cmd-pill${p?.status === "verified" ? " ok" : p?.status === "rejected" ? " ko" : p?.proof_path ? " wait" : ""}`}>{payLabel(p)}</span>
                        </div>
                        <p className="cmd-tranche-amount">{formatCurrency(amount)}</p>
                        <p className="cmd-tranche-desc">
                          {p?.status === "verified"
                            ? phase === "deposit" ? "Vérifié — production lancée." : "Vérifié — dossier soldé."
                            : p?.status === "rejected" ? (p.review_note ?? "Preuve rejetée — renvoyez une preuve.")
                            : p?.proof_path ? "Preuve envoyée — en attente de vérification."
                            : phase === "deposit"
                              ? (quote.status === "sent" ? "Disponible après validation du devis." : "Payez puis déposez la preuve ci-dessous.")
                              : (depositPayment?.status !== "verified" ? "Disponible après vérification de la tranche 1." : totalAddons > 0 ? `Solde + ${formatCurrency(totalAddons)} d'ajouts validés.` : "Payez puis déposez la preuve ci-dessous.")}
                        </p>
                        {p?.transaction_ref && <p className="cmd-tranche-ref">Réf : {p.transaction_ref}</p>}
                      </div>
                    );
                  })}
                </div>
                {quote.status === "sent" ? (
                  <p className="cmd-sub">Validez d&apos;abord le devis ci-dessus — aucun paiement n&apos;est dû pour l&apos;instant.</p>
                ) : canUpload && activePayment ? (
                  <div className="cmd-pay-form">
                    <p className="cmd-sub">
                      {activePayment.phase === "deposit" ? "Tranche 1 — l'acompte vérifié démarre la production." : "Tranche 2 — solde (+ ajouts validés)."}
                    </p>
                    <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                      <option value="mvola">MVola</option>
                      <option value="orange_money">Orange Money</option>
                      <option value="virement">Virement bancaire</option>
                    </select>
                    <input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder="Référence transaction (min 5 caractères)" />
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
                    <div className="cmd-btn-row">
                      <button className="cmd-btn" onClick={submitProof} disabled={uploadingProof}>{uploadingProof ? "Envoi…" : "Envoyer la preuve"}</button>
                    </div>
                    {proofMessage && <p className="cmd-form-status">{proofMessage}</p>}
                  </div>
                ) : activePayment?.proof_path && activePayment.status === "submitted" ? (
                  <p className="cmd-sub">Preuve déjà transmise — l&apos;atelier la vérifie. Nouveau dépôt possible si rejetée.</p>
                ) : null}
              </section>
            )}

            {displayCheckpoints.length > 0 && (
              <section className="cmd-card cmd-timeline">
                <h2>Étapes à valider</h2>
                <div className="cmd-sub">{displayCheckpoints.filter((c) => c.state === "action").length} en attente de votre validation</div>
                {displayCheckpoints.map((cp) => (
                  <div key={cp.id} className={`cmd-event${cp.state === "done" ? " success" : ""}`}>
                    <div className="cmd-rail"><div className="cmd-bubble">{cp.state === "done" ? "✓" : "i"}</div></div>
                    <div>
                      <div className="cmd-event-top"><span className="cmd-event-title">{cp.title}</span><span className="cmd-time">{cp.state === "done" ? "Fait" : cp.state === "action" ? "À valider" : "À venir"}</span></div>
                      {cp.desc && <p>{cp.desc}</p>}
                      {cp.meta && <p>{cp.meta}</p>}
                      {cp.state === "action" && (
                        <div className="cmd-btn-row" style={{ marginTop: 10 }}>
                          <button className="cmd-btn" onClick={() => validateCheckpoint(cp.id)} disabled={validatingCp === cp.id}>{validatingCp === cp.id ? "Validation…" : "Valider cette étape"}</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}

            <section className="cmd-card cmd-timeline">
              <h2>Historique détaillé</h2>
              <div className="cmd-sub">Toutes les mises à jour publiées par notre équipe.</div>
              {timeline.map((t, i) => (
                <div key={i} className={`cmd-event${t.tone === "success" ? " success" : t.tone === "problem" ? " problem" : ""}`}>
                  <div className="cmd-rail"><div className="cmd-bubble">{t.tone === "success" ? "✓" : t.tone === "problem" ? "!" : "i"}</div></div>
                  <div>
                    <div className="cmd-event-top"><span className="cmd-event-title">{t.title}</span><span className="cmd-time">{t.date}</span></div>
                    <span className="cmd-tag">{t.tag}</span>
                    <p>{t.desc}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="cmd-card cmd-timeline">
              <h2>Ajouts demandés</h2>
              <div className="cmd-sub">En production vous pouvez augmenter le devis — chiffré puis ajouté au solde{totalAddons > 0 ? ` · +${formatNumber(totalAddons)} Ar validés` : ""}</div>
              {displayAddons.length === 0 ? (
                <p className="cmd-sub">Aucun ajout pour le moment — décrivez une modification ci-dessous.</p>
              ) : (
                displayAddons.map((a) => (
                  <div key={a.id} className="cmd-addon-row">
                    <div><b>{a.title}</b><p>{a.desc}</p></div>
                    <div className="cmd-addon-right"><span>+{formatNumber(a.price)} Ar</span><span className={`cmd-pill${a.status === "included" ? " ok" : a.status === "rejected" ? " ko" : " wait"}`}>{a.status === "included" ? "Inclus au solde" : a.status === "rejected" ? "Refusé" : "En chiffrage"}</span></div>
                  </div>
                ))
              )}
              {addonMessage && <p className="cmd-form-status">{addonMessage}</p>}
              <div className="cmd-btn-row" style={{ marginTop: 12 }}>
                <button className="cmd-btn cmd-btn-ghost" onClick={() => setAddonFormOpen(!addonFormOpen)}>Demander un ajout</button>
              </div>
              {addonFormOpen && (
                <div className="cmd-response show">
                  <textarea value={addonText} onChange={(e) => setAddonText(e.target.value)} placeholder="Ex. : Ajouter un motif brodé sur la manche gauche…" />
                  <div className="cmd-btn-row">
                    <button className="cmd-btn" onClick={submitAddon} disabled={addonSending || !addonText.trim()}>{addonSending ? "Envoi…" : "Envoyer la demande"}</button>
                  </div>
                </div>
              )}
            </section>

            <Link className="cmd-back" href="/mon-profil">← Retour au tableau de bord</Link>
          </div>

          <aside className="cmd-side">
            <section className="cmd-card">
              <h2>Informations</h2>
              <div className="cmd-info-row"><span>Référence</span><b>#{shortId(quote.id)}</b></div>
              <div className="cmd-info-row"><span>Quantité</span><b>{quote.quantite ?? cmd?.quantite ?? "—"}{quote.quantite || cmd?.quantite ? " pièces" : ""}</b></div>
              <div className="cmd-info-row"><span>Produit</span><b>{quote.category ? (CATEGORY_LABELS[quote.category] ?? quote.category) : "—"}</b></div>
              <div className="cmd-info-row"><span>Matière</span><b>{quote.tissu ?? "—"}</b></div>
              <div className="cmd-info-row"><span>Montant</span><b>{amountNum > 0 ? formatCurrency(quote.amount) : "En chiffrage"}</b></div>
              <div className="cmd-info-row"><span>Commande</span><b>{cmd ? `${cmd.numero} — ${cmd.statut_production}` : formatDate(quote.created_at)}</b></div>
            </section>

            <section className="cmd-card">
              <h2>Livraison estimée</h2>
              <div className="cmd-delivery">{formatDate(quote.date_livraison_prevue ?? cmd?.date_livraison_prevue)}</div>
              <div className="cmd-sub">Sous réserve du bon déroulement de la production.</div>
            </section>

            <section className="cmd-card">
              <h2>Notifications</h2>
              {[...goodItems, ...warnItems].length === 0 ? (
                <div className="cmd-notify"><b>Aucune notification</b><p>Vous serez informé ici de chaque avancée.</p></div>
              ) : (
                [...goodItems, ...warnItems].slice(0, 5).map((n, i) => (
                  <div key={i} className="cmd-notify"><b>{n.message}</b><p>{formatDateShort(n.date ?? n.created_at)}</p></div>
                ))
              )}
            </section>

            {quoteFiles.length > 0 && (
              <section className="cmd-card">
                <h2>Fichiers</h2>
                {quoteFiles.map((f, i) => (
                  <div key={i} className="cmd-notify"><b><a href={safeUrl(f.url)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold2)" }}>{f.name || "Fichier joint"}</a></b></div>
                ))}
              </section>
            )}

            <section className="cmd-card">
              <h2>Besoin d&apos;aide ?</h2>
              <div className="cmd-sub">Une question concernant votre dossier ?</div>
              <Link href="/contact" className="cmd-btn" style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>Contacter JMR Textile</Link>
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
    </div>
  );
}

export default function DevisDetailPage() {
  return (
    <Suspense fallback={
      <div className="cmd-detail"><style>{detailStyles}</style><div className="cmd-loading">Chargement…</div></div>
    }>
      <DevisDetailContent />
    </Suspense>
  );
}

const detailStyles = `
.cmd-detail{
  --bg:#080a0d;--panel:#101318;--panel2:#151920;--line:#262b33;
  --gold:#dca34a;--gold2:#f0c179;--text:#f4f0e8;--muted:#9299a5;
  --green:#46d39a;--red:#ff6b6b;--blue:#69a7ff;--orange:#f2a65a;
  background:radial-gradient(circle at 80% 0%,#1c1710 0,#080a0d 35%);
  background-color:#080a0d;color:var(--text);
  font-family:Inter,Arial,sans-serif;min-height:100vh;
}
.cmd-detail button,.cmd-detail input,.cmd-detail textarea,.cmd-detail select{font:inherit;}
.cmd-detail button{cursor:pointer;}
.cmd-detail a{color:inherit;text-decoration:none;}
.cmd-detail :focus-visible{outline:2px solid var(--gold2);outline-offset:3px;}
.cmd-detail .cmd-top{height:76px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 5%;background:rgba(8,10,13,.88);position:sticky;top:0;z-index:5;}
.cmd-detail .cmd-logo{font-weight:800;letter-spacing:.18em;color:var(--text);}
.cmd-detail .cmd-logo span{color:var(--gold);}
.cmd-detail .cmd-nav{display:flex;gap:28px;color:var(--muted);font-size:14px;}
.cmd-detail .cmd-nav a{color:inherit;text-decoration:none;}
.cmd-detail .cmd-nav a:first-child{color:var(--text);}
.cmd-detail .cmd-user{display:flex;align-items:center;gap:10px;font-size:14px;}
.cmd-detail .cmd-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#8a5d20);display:grid;place-items:center;color:#111;font-weight:800;}
.cmd-detail .cmd-wrap{max-width:1280px;margin:auto;padding:42px 5% 70px;}
.cmd-detail .cmd-crumb{color:var(--muted);font-size:13px;margin-bottom:25px;}
.cmd-detail .cmd-crumb b{color:var(--text);}
.cmd-detail .cmd-order-head{display:flex;justify-content:space-between;gap:25px;align-items:flex-start;margin-bottom:28px;}
.cmd-detail .cmd-eyebrow{color:var(--gold2);text-transform:uppercase;letter-spacing:.16em;font-size:11px;font-weight:700;}
.cmd-detail .cmd-title{font-size:clamp(30px,4vw,48px);margin:8px 0;font-weight:800;letter-spacing:-.04em;color:var(--text);}
.cmd-detail .cmd-ref{color:var(--muted);font-size:14px;font-family:monospace;}
.cmd-detail .cmd-status{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid rgba(220,163,74,.35);background:rgba(220,163,74,.08);color:var(--gold2);border-radius:999px;font-size:13px;white-space:nowrap;}
.cmd-detail .cmd-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);box-shadow:0 0 12px var(--gold);}
.cmd-detail .cmd-grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:22px;}
.cmd-detail .cmd-card{background:linear-gradient(145deg,rgba(21,25,32,.95),rgba(13,16,21,.95));border:1px solid var(--line);border-radius:20px;padding:25px;box-shadow:0 18px 60px rgba(0,0,0,.2);}
.cmd-detail .cmd-card h2{font-size:18px;margin:0;color:var(--text);}
.cmd-detail .cmd-sub{color:var(--muted);font-size:13px;margin-top:7px;}
.cmd-detail .cmd-progress-row{display:flex;justify-content:space-between;align-items:end;margin:25px 0 12px;}
.cmd-detail .cmd-percent{font-size:28px;font-weight:800;color:var(--gold2);}
.cmd-detail .cmd-bar{height:7px;background:#252a31;border-radius:20px;overflow:hidden;}
.cmd-detail .cmd-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));border-radius:inherit;}
.cmd-detail .cmd-steps{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:27px;}
.cmd-detail .cmd-step{text-align:center;position:relative;}
.cmd-detail .cmd-step:not(:last-child):after{content:"";position:absolute;top:15px;left:calc(50% + 18px);width:calc(100% - 36px);height:1px;background:#343943;}
.cmd-detail .cmd-circle{width:30px;height:30px;border-radius:50%;border:1px solid #414752;background:#171b21;display:grid;place-items:center;margin:auto;color:#747b87;font-size:12px;position:relative;z-index:1;}
.cmd-detail .cmd-step.done .cmd-circle{background:rgba(70,211,154,.13);border-color:var(--green);color:var(--green);}
.cmd-detail .cmd-step.active .cmd-circle{background:rgba(220,163,74,.13);border-color:var(--gold);color:var(--gold2);box-shadow:0 0 0 5px rgba(220,163,74,.05);}
.cmd-detail .cmd-label{font-size:11px;color:var(--muted);margin-top:9px;}
.cmd-detail .cmd-step.done .cmd-label,.cmd-detail .cmd-step.active .cmd-label{color:var(--text);}
.cmd-detail .cmd-update{margin-top:25px;padding:17px;border-radius:14px;background:#0c0f13;border:1px solid #252a31;display:flex;gap:14px;}
.cmd-detail .cmd-icon{width:38px;height:38px;border-radius:11px;background:rgba(70,211,154,.1);color:var(--green);display:grid;place-items:center;flex:none;font-weight:800;}
.cmd-detail .cmd-update strong{font-size:14px;}
.cmd-detail .cmd-update p{margin:5px 0 0;color:var(--muted);font-size:13px;line-height:1.55;}
.cmd-detail .cmd-action{margin-top:20px;border:1px solid rgba(242,166,90,.35);background:rgba(242,166,90,.055);border-radius:16px;padding:20px;}
.cmd-detail .cmd-action .cmd-icon{background:rgba(242,166,90,.1);color:var(--orange);}
.cmd-detail .cmd-action-gold{border-color:rgba(220,163,74,.45);background:rgba(220,163,74,.06);}
.cmd-detail .cmd-action-gold .cmd-icon{background:rgba(220,163,74,.12);color:var(--gold2);}
.cmd-detail .cmd-action-blue{border-color:rgba(105,167,255,.35);background:rgba(105,167,255,.05);}
.cmd-detail .cmd-action-blue .cmd-icon{background:rgba(105,167,255,.1);color:var(--blue);}
.cmd-detail .cmd-action-head{display:flex;gap:12px;}
.cmd-detail .cmd-action strong{font-size:15px;}
.cmd-detail .cmd-action p{color:#c7cbd2;font-size:13px;line-height:1.6;}
.cmd-detail .cmd-btn{border:0;border-radius:10px;background:var(--gold);color:#111;font-weight:800;padding:11px 15px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-size:13px;text-decoration:none;}
.cmd-detail .cmd-btn:hover{background:var(--gold2);}
.cmd-detail .cmd-btn:disabled{opacity:.55;cursor:not-allowed;}
.cmd-detail .cmd-btn-ghost{background:transparent;border:1px solid var(--line);color:var(--text);font-weight:600;}
.cmd-detail .cmd-btn-ghost:hover{border-color:var(--gold);color:var(--gold2);}
.cmd-detail .cmd-btn-row{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px;}
.cmd-detail .cmd-response{display:none;margin-top:18px;}
.cmd-detail .cmd-response.show{display:block;}
.cmd-detail .cmd-response textarea,.cmd-detail .cmd-pay-form textarea{width:100%;margin:8px 0 14px;background:#0b0e12;border:1px solid #2b3038;color:var(--text);border-radius:10px;padding:12px;min-height:100px;resize:vertical;}
.cmd-detail .cmd-response input,.cmd-detail .cmd-pay-form input,.cmd-detail .cmd-pay-form select{width:100%;margin:8px 0 14px;background:#0b0e12;border:1px solid #2b3038;color:var(--text);border-radius:10px;padding:12px;}
.cmd-detail .cmd-timeline{margin-top:22px;}
.cmd-detail .cmd-event{display:grid;grid-template-columns:24px 1fr;gap:14px;padding:18px 0;border-bottom:1px solid #20252c;}
.cmd-detail .cmd-event:last-child{border-bottom:0;}
.cmd-detail .cmd-rail{position:relative;}
.cmd-detail .cmd-rail:after{content:"";position:absolute;left:11px;top:24px;bottom:-24px;width:1px;background:#30353d;}
.cmd-detail .cmd-event:last-child .cmd-rail:after{display:none;}
.cmd-detail .cmd-bubble{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:11px;background:#1c2229;border:1px solid #3a414b;color:var(--blue);}
.cmd-detail .cmd-event.success .cmd-bubble{color:var(--green);border-color:rgba(70,211,154,.45);}
.cmd-detail .cmd-event.problem .cmd-bubble{color:var(--red);border-color:rgba(255,107,107,.45);}
.cmd-detail .cmd-event-top{display:flex;justify-content:space-between;gap:12px;}
.cmd-detail .cmd-event-title{font-weight:700;font-size:14px;}
.cmd-detail .cmd-time{font-size:11px;color:var(--muted);white-space:nowrap;}
.cmd-detail .cmd-tag{display:inline-block;margin-top:7px;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);}
.cmd-detail .cmd-event p{margin:7px 0 0;color:#aeb4be;font-size:13px;line-height:1.55;}
.cmd-detail .cmd-side{display:flex;flex-direction:column;gap:22px;}
.cmd-detail .cmd-info-row{display:flex;justify-content:space-between;gap:15px;padding:13px 0;border-bottom:1px solid #22272e;font-size:13px;}
.cmd-detail .cmd-info-row:last-child{border-bottom:0;}
.cmd-detail .cmd-info-row span{color:var(--muted);}
.cmd-detail .cmd-delivery{font-size:27px;font-weight:800;color:var(--gold2);margin-top:15px;}
.cmd-detail .cmd-notify{padding:14px 0;border-bottom:1px solid #22272e;}
.cmd-detail .cmd-notify:last-child{border-bottom:0;}
.cmd-detail .cmd-notify b{font-size:13px;}
.cmd-detail .cmd-notify p{margin:5px 0 0;color:var(--muted);font-size:12px;line-height:1.45;}
.cmd-detail .cmd-back{display:inline-flex;margin-top:25px;color:var(--muted);font-size:13px;text-decoration:none;}
.cmd-detail .cmd-back:hover{color:var(--text);}
.cmd-detail .cmd-tranches{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0;}
.cmd-detail .cmd-tranche{background:#0c0f13;border:1px solid #252a31;border-radius:14px;padding:16px;}
.cmd-detail .cmd-tranche.paid{border-color:rgba(70,211,154,.4);}
.cmd-detail .cmd-tranche.active{border-color:rgba(220,163,74,.55);box-shadow:0 0 0 1px rgba(220,163,74,.25);}
.cmd-detail .cmd-tranche-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;}
.cmd-detail .cmd-tranche-amount{font-size:22px;font-weight:800;color:var(--gold2);margin:0 0 6px;}
.cmd-detail .cmd-tranche-desc{font-size:12px;color:var(--muted);margin:0;line-height:1.5;}
.cmd-detail .cmd-tranche-ref{font-size:11px;color:var(--muted);font-family:monospace;margin:6px 0 0;}
.cmd-detail .cmd-pill{display:inline-flex;align-items:center;font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:100px;background:#1c2229;color:var(--muted);border:1px solid #3a414b;white-space:nowrap;text-transform:none;letter-spacing:0;}
.cmd-detail .cmd-pill.ok{background:rgba(70,211,154,.12);color:var(--green);border-color:rgba(70,211,154,.35);}
.cmd-detail .cmd-pill.ko{background:rgba(255,107,107,.12);color:var(--red);border-color:rgba(255,107,107,.35);}
.cmd-detail .cmd-pill.wait{background:rgba(220,163,74,.12);color:var(--gold2);border-color:rgba(220,163,74,.35);}
.cmd-detail .cmd-addon-row{display:flex;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid #20252c;font-size:13px;}
.cmd-detail .cmd-addon-row p{margin:4px 0 0;color:var(--muted);font-size:12px;}
.cmd-detail .cmd-addon-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;}
.cmd-detail .cmd-form-status{font-size:12px;color:var(--gold2);}
.cmd-detail .cmd-pay-form{margin-top:6px;}
.cmd-detail .cmd-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;font-size:18px;color:var(--gold);}
.cmd-detail .cmd-error-text{color:var(--red);font-size:18px;}
.cmd-detail .cmd-back.cmd-back{font-size:16px;}
@media(max-width:900px){.cmd-detail .cmd-grid{grid-template-columns:1fr;}.cmd-detail .cmd-side{display:grid;grid-template-columns:1fr 1fr;}.cmd-detail .cmd-steps{grid-template-columns:repeat(3,1fr);gap:20px;}.cmd-detail .cmd-step:not(:last-child):after{display:none;}.cmd-detail .cmd-tranches{grid-template-columns:1fr;}}
@media(max-width:620px){.cmd-detail .cmd-top{height:64px;padding:0 20px;}.cmd-detail .cmd-nav{display:none;}.cmd-detail .cmd-user span{display:none;}.cmd-detail .cmd-wrap{padding:25px 18px 50px;}.cmd-detail .cmd-order-head{flex-direction:column;}.cmd-detail .cmd-card{padding:18px;border-radius:16px;}.cmd-detail .cmd-steps{grid-template-columns:repeat(2,1fr);}.cmd-detail .cmd-side{display:flex;}.cmd-detail .cmd-event-top{flex-direction:column;gap:4px;}.cmd-detail .cmd-title{font-size:32px;}}
`;
