"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getUser, getToken } from "@/app/lib/auth";
import { authAPI } from "@/app/lib/api";
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
  return n.toLocaleString("fr-MA") + " Ar";
}

function shortId(id: string | number): string {
  return String(id).substring(0, 8);
}

function statutToStepIndex(statut: string | null | undefined): number {
  if (!statut) return 0;
  if (statut === "Livrée") return 5;
  const idx = STATUTS_PRODUCTION.indexOf(statut as any);
  if (idx >= 0 && idx < 4) return idx + 1;
  return 0;
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
  status: "included" | "pending";
}

interface Feedback {
  id: string;
  avatar: string;
  name: string;
  date: string;
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
        const [quoteRes, commandesRes] = await Promise.all([
          authAPI.get<QuoteRecord>(`/quotes/${id}`),
          authAPI.get<CommandeRecord[]>("/commandes/"),
        ]);
        setQuote((quoteRes as any).data ?? quoteRes);
        const allCommandes: CommandeRecord[] = (commandesRes as any).data ?? commandesRes;
        const filtered = allCommandes.filter(
          (c) => c.cotation_id === id
        );
        setCommandes(filtered);
        if (filtered.length > 0) {
          setOpenCards(new Set([filtered[0].id]));
        }

        // Fetch checkpoints, addons, payments in parallel
        try {
          const [cpRes, addonRes, payRes] = await Promise.all([
            checkpointsAPI.list(id).catch(() => ({ data: [] })),
            addonsAPI.list(id).catch(() => ({ data: [], total_validated: 0 })),
            paymentsAPI.list(id).catch(() => ({ data: [], total_verified: 0 })),
          ]);
          setCheckpoints((cpRes as any).data ?? []);
          setAddons(((addonRes as any).data ?? []) as QuoteAddon[]);
          setPayments(((payRes as any).data ?? []) as PaymentRecord[]);
        } catch {
          // Non-critical: use defaults
        }
      } catch (err: any) {
        setError("Impossible de charger les données du devis.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const toggleCard = useCallback((cardId: string) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  const showConfirm = quote && ["accepted", "production", "completed"].includes(quote.status ?? "");
  const showPayment = quote && Number(quote.amount ?? 0) > 0;

  const defaults: Checkpoint[] = [
    {
      id: "cp1",
      title: "Prototype validé",
      desc: "Le modèle final a été approuvé avant lancement de la série.",
      meta: "Validé par vous le " + formatDate(quote?.created_at),
      state: "done",
    },
    {
      id: "cp2",
      title: "Premier lot — contrôle qualité",
      desc: "L&apos;atelier a terminé le contrôle qualité du premier lot et attend votre retour.",
      meta: "",
      state: "action",
    },
    {
      id: "cp3",
      title: "Lot complet avant expédition",
      desc: "Vérification finale des pièces avant mise en livraison.",
      meta: "À venir",
      state: "upcoming",
    },
  ];

  const defaultAddons: Addon[] = [
    {
      id: "a1",
      title: "Bouton doré supplémentaire",
      desc: "Ajout d&apos;un second bouton en laiton doré.",
      price: 15000,
      status: "included",
    },
    {
      id: "a2",
      title: "Broderie motif floral",
      desc: "Petit motif brodé main sur la poche.",
      price: 42000,
      status: "pending",
    },
  ];

  const defaultFeedback: Feedback[] = [
    {
      id: "fb1",
      avatar: "A",
      name: "Atelier JMR",
      date: formatDate(quote?.updated_at),
      text: "Le prototype est prêt, nous attendons votre validation pour lancer la série.",
    },
  ];

  const displayCheckpoints: Checkpoint[] = checkpoints.length > 0
    ? checkpoints.map((cp) => ({
        id: cp.id,
        title: cp.title,
        desc: cp.description ?? "",
        meta: cp.validated_at
          ? `Validé par ${cp.validated_by ?? "—" } le ${formatDate(cp.validated_at)}`
          : cp.status === "upcoming" ? "À venir" : "",
        state: cp.status === "done" ? "done" : cp.status === "upcoming" ? "upcoming" : "action",
      }))
    : defaults;

  const displayAddons: Addon[] = addons.length > 0
    ? addons.map((a) => ({
        id: a.id,
        title: a.title,
        desc: a.description ?? "",
        price: Number(a.price ?? 0),
        status: a.status as "included" | "pending",
      }))
    : defaultAddons;

  const depositPayment = payments.find((p) => p.phase === "deposit");
  const balancePayment = payments.find((p) => p.phase === "balance");

  if (loading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={{ minHeight: "100vh", background: "var(--bg-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "var(--gold)", fontSize: 18 }}>Chargement…</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={{ minHeight: "100vh", background: "var(--bg-deep)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "var(--text-cream)" }}>
          <div style={{ color: "var(--warn)", fontSize: 18 }}>{error}</div>
          <Link href="/mon-profil/devis" style={{ color: "var(--gold)", textDecoration: "underline", fontSize: 16 }}>
            ← Retour à mes devis
          </Link>
        </div>
      </>
    );
  }

  if (!quote) return null;

  const showActions = quote.status === "draft" || quote.status === "pending";
  const totalAddons = displayAddons.reduce((s, a) => s + (a.status === "included" ? a.price : 0), 0);
  const pendingAddons = defaultAddons.filter((a) => a.status === "pending").length;

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg-deep)", color: "var(--text-cream)" }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid var(--card-border)", padding: "16px 24px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/navbar/logo-dark.svg" alt="JMR Textile" style={{ height: 28, width: "auto" }} />
            <span style={{ color: "var(--gold)", fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>JMR TEXTILE</span>
          </Link>
        </header>

        {/* Breadcrumb */}
        <nav style={{ maxWidth: 960, margin: "0 auto", padding: "16px 24px 0", fontSize: 13, color: "var(--text-muted)" }}>
          <Link href="/mon-profil" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Tableau de bord</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/mon-profil/devis" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Mes devis</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--text-cream)" }}>Devis #{shortId(quote.id)}</span>
        </nav>

        <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
          {/* Page head */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "var(--gold-dim)" }}>Suivi de devis</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>#{shortId(quote.id)}</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 4px" }}>{quote.name || quote.category}</h1>
            <span className="status-pill" data-status={quote.status}>
              {STATUS_LABELS[quote.status ?? ""] ?? quote.status}
            </span>
          </div>

          {/* Quote Confirm Panel */}
          {showConfirm && (
            <div className="quote-confirm">
              <div className="quote-confirm-top">
                <span className="quote-confirm-icon">✓</span>
                <span>Prix validé — commande définitive</span>
              </div>
              <div className="quote-figures">
                <figure>
                  <b>{formatCurrency(quote.amount)}</b>
                  <span>Montant total chiffré</span>
                </figure>
                <figure>
                  <b>{formatDate(quote.date_livraison_prevue)}</b>
                  <span>Date de rendu estimée</span>
                </figure>
                <figure>
                  <b>{formatDate(quote.validated_at ?? null)}</b>
                  <span>Validé par {quote.validated_by ?? "—"}</span>
                </figure>
              </div>
              <div className="quote-confirm-note">
                Chiffré par l&apos;atelier le <b>{formatDate(quote.created_at)}</b>, puis validé par vos soins le lendemain. L&apos;acompte de la <b>tranche 1</b> a déclenché le lancement de la production.
              </div>
            </div>
          )}

          {/* Payment Grid */}
          {showPayment && (
            <div className="panel" style={{ marginBottom: 24 }}>
              <div className="panel-header">
                <h3>Paiement</h3>
                <span className="hint">2 tranches</span>
              </div>
              <div className="payment-grid">
                <div className="payment-card">
                  <div className="payment-top">
                    <span className="payment-tag">Tranche 1 · Acompte (50%)</span>
                    <span className={`payment-status ${depositPayment?.status === "verified" ? "paid" : depositPayment ? "waiting" : "waiting"}`}>
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
                  <div className="payment-top">
                    <span className="payment-tag">Tranche 2 · Solde (50%)</span>
                    <span className={`payment-status ${balancePayment?.status === "verified" ? "paid" : "waiting"}`}>
                      {balancePayment?.status === "verified" ? "Payé" : "En attente"}
                    </span>
                  </div>
                  <div className="payment-amount">{formatCurrency(balancePayment?.amount ?? quote.balance_amount ?? Number(quote.amount ?? 0) / 2)}</div>
                  <div className="payment-desc">
                    {balancePayment?.status === "verified"
                      ? `Réglé le ${formatDate(balancePayment.reviewed_at ?? balancePayment.created_at)}`
                      : "Exigible à la livraison finale du dernier lot"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action bar */}
          {showActions && (
            <div className="action-bar">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>En attente de validation</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Vous pouvez modifier ou envoyer cette demande de devis.
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Link href={`/mon-profil/devis/edit?id=${quote.id}`} className="btn-outline">
                  Modifier
                </Link>
                <button className="btn-gold" onClick={async () => {
                  try {
                    await authAPI.put(`/quotes/${quote.id}`, { status: "pending" });
                    setQuote({ ...quote, status: "pending" });
                  } catch {}
                }}>
                  Envoyer
                </button>
              </div>
            </div>
          )}

          {/* Commandes liées */}
          <section style={{ marginTop: 32 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Commandes liées à ce devis</h2>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{commandes.length} commande{commandes.length > 1 ? "s" : ""}</span>
            </div>

            {commandes.length === 0 && (
              <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "32px 0" }}>
                Aucune commande associée à ce devis.
              </div>
            )}

            <div className="order-list">
              {commandes.map((cmd) => {
                const isOpen = openCards.has(cmd.id);
                const stepIdx = statutToStepIndex(cmd.statut_production);
                const alerts = [
                  ...(cmd.notes ? [{ type: "info" as const, text: cmd.notes }] : []),
                ];
                const quoteAlerts = (quote?.notifications ?? []).filter(
                  (n) => n.type === "delay" || n.type === "error"
                );
                const quoteAdvances = (quote?.notifications ?? []).filter(
                  (n) => n.type === "info"
                );

                return (
                  <div key={cmd.id} className="order-card">
                    {/* Summary header */}
                    <button className="order-summary" onClick={() => toggleCard(cmd.id)}>
                      <div className="order-summary-left">
                        <div className="order-icon">📋</div>
                        <div>
                          <div className="order-title">Commande #{cmd.numero}</div>
                          <div className="order-sub">{cmd.quantite} pièces · créée le {formatDate(cmd.date_commande)}</div>
                        </div>
                      </div>
                      <div className="order-summary-right">
                        {alerts.length > 0 && (
                          <span className="alert-badge">{alerts.length}</span>
                        )}
                        <div className="mini-progress">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`mini-step ${i < stepIdx ? "done" : i === stepIdx ? "current" : ""}`}
                            />
                          ))}
                        </div>
                        <div className={`chevron ${isOpen ? "open" : ""}`}>›</div>
                      </div>
                    </button>

                    {/* Expandable body */}
                    {isOpen && (
                      <div className="order-body">
                        {/* Stepper */}
                        <div className="stepper">
                          {STEP_LABELS.map((label, i) => {
                            let state: "done" | "current" | "pending" = "pending";
                            if (i < stepIdx) state = "done";
                            else if (i === stepIdx) state = "current";
                            return (
                              <div key={i} className={`step ${state}`}>
                                <div className="step-dot">
                                  {state === "done" && <span className="step-check">✓</span>}
                                  {state === "current" && <span className="step-pulse" />}
                                </div>
                                <div className="step-label">{label}</div>
                                {i < STEP_LABELS.length - 1 && (
                                  <div className={`step-line ${i < stepIdx ? "done" : ""}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Checkpoints */}
                        <div className="panel" style={{ marginBottom: 20 }}>
                          <div className="panel-header">
                            <h3>Étapes à valider</h3>
                            <span className="hint">{displayCheckpoints.filter((c) => c.state === "action").length} en attente de votre validation</span>
                          </div>
                          <div className="checkpoint-list">
                            {displayCheckpoints.map((cp) => (
                              <div key={cp.id} className={`checkpoint-item ${cp.state}`}>
                                <div className="cp-marker">
                                  {cp.state === "done" && "✓"}
                                  {cp.state === "action" && <span className="dot-pulse" />}
                                </div>
                                <div className="cp-body">
                                  <div className="cp-title">{cp.title}</div>
                                  <div className="cp-desc">{cp.desc}</div>
                                  {cp.meta && <div className="cp-meta">{cp.meta}</div>}
                                  {cp.state === "action" && (
                                    <div className="cp-actions">
                                      <button className="btn-sm-gold">Valider cette étape</button>
                                      <button className="btn-sm-outline">Signaler un problème</button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Highlights */}
                        <div className="highlights-grid">
                          <div className="highlight-panel warn">
                            <div className="highlight-head">⚠ Points d&apos;attention</div>
                            {quoteAlerts.length === 0 ? (
                              <div className="highlight-empty">Aucun point d&apos;attention</div>
                            ) : (
                              <ul>
                                {quoteAlerts.map((a, i) => (
                                  <li key={i}>{a.message}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="highlight-panel good">
                            <div className="highlight-head">✓ Avancées</div>
                            {quoteAdvances.length === 0 && alerts.length === 0 ? (
                              <div className="highlight-empty">Aucune avancée signalée</div>
                            ) : (
                              <ul>
                                {quoteAdvances.map((a, i) => (
                                  <li key={`q-${i}`}>{a.message}</li>
                                ))}
                                {alerts.map((a, i) => (
                                  <li key={`c-${i}`}>{a.text}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        {/* Addons */}
                        <div className="panel" style={{ marginBottom: 20 }}>
                          <div className="panel-header">
                            <h3>Ajouts demandés</h3>
                            <span className="hint">+{totalAddons.toLocaleString("fr-MG")} Ar au total</span>
                          </div>
                          <div>
                            {displayAddons.map((addon) => (
                              <div key={addon.id} className="addon-item">
                                <div className="addon-left">
                                  <b>{addon.title}</b>
                                  <p>{addon.desc}</p>
                                </div>
                                <div className="addon-right">
                                  <span className="addon-price">+{addon.price.toLocaleString("fr-MG")} Ar</span>
                                  <span className={`addon-status ${addon.status}`}>
                                    {addon.status === "included" ? "Inclus au total" : "En attente de chiffrage"}
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div className="addon-total">
                              <span>Total des ajouts validés, ajouté au solde de livraison</span>
                              <b>+{totalAddons.toLocaleString("fr-MG")} Ar</b>
                            </div>
                            <button className="addon-add-btn">+ Demander un ajout</button>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div className="panel" style={{ marginBottom: 20 }}>
                          <div className="panel-header">
                            <h3>Retour de l&apos;atelier</h3>
                            <span className="hint">{defaultFeedback.length} message{defaultFeedback.length > 1 ? "s" : ""}</span>
                          </div>
                          <div>
                            {defaultFeedback.map((fb) => (
                              <div key={fb.id} className="feedback-item">
                                <div className="fb-avatar">{fb.avatar}</div>
                                <div className="fb-body">
                                  <div className="fb-top">
                                    <span className="fb-name">{fb.name}</span>
                                    <span className="fb-date">{fb.date}</span>
                                  </div>
                                  <p className="fb-text">{fb.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Comparison table */}
                        <div className="comparison-table">
                          <div className="comp-header">
                            <div>Devis</div>
                            <div>Bon de commande</div>
                            <div>Livraison</div>
                          </div>
                          <div className="comp-row">
                            <div>{cmd.quantite} pièces</div>
                            <div>{cmd.quantite} pièces</div>
                            <div>{cmd.pieces_produites ?? "—"} pièces</div>
                          </div>
                          <div className="comp-row">
                            <div>{formatCurrency(cmd.prix_unitaire)}</div>
                            <div>{formatCurrency(cmd.prix_unitaire)}</div>
                            <div>{formatCurrency(cmd.total)}</div>
                          </div>
                          <div className="comp-row">
                            <div>{formatDate(quote.created_at)}</div>
                            <div>{formatDate(cmd.date_commande)}</div>
                            <div>{formatDate(cmd.date_livraison_prevue)}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "32px 24px", color: "var(--text-faint)", fontSize: 13, borderTop: "1px solid var(--card-border)" }}>
          JMR Textile © 2026
        </footer>
      </div>
    </>
  );
}

export default function DevisDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#1e2a38", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#e5ad46", fontSize: 18 }}>Chargement…</div>
      </div>
    }>
      <DevisDetailContent />
    </Suspense>
  );
}

const globalStyles = `
  :root {
    --bg-deep: #1e2a38;
    --bg-panel: #141e2e;
    --card: #1b263c;
    --card-border: #2a3a4a;
    --gold: #e5ad46;
    --gold-light: #eccc90;
    --gold-dim: #8c7038;
    --text-cream: #f3efe4;
    --text-muted: #8b93a7;
    --text-faint: #5c6478;
    --input-bg: #141e2e;
    --warn: #e08b52;
    --good: #5cb87d;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .status-pill {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .status-pill[data-status="draft"] { background: rgba(139,147,167,0.2); color: var(--text-muted); }
  .status-pill[data-status="pending"] { background: rgba(229,173,70,0.15); color: var(--gold); }
  .status-pill[data-status="accepted"] { background: rgba(92,184,125,0.15); color: var(--good); }
  .status-pill[data-status="refused"] { background: rgba(224,139,82,0.15); color: var(--warn); }
  .status-pill[data-status="expired"] { background: rgba(92,100,120,0.2); color: var(--text-faint); }
  .status-pill[data-status="production"] { background: rgba(229,173,70,0.15); color: var(--gold); }
  .status-pill[data-status="completed"] { background: rgba(92,184,125,0.15); color: var(--good); }

  .action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(229,173,70,0.08);
    border: 1px solid rgba(229,173,70,0.2);
    border-radius: 12px;
    padding: 16px 20px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .btn-outline {
    padding: 8px 18px;
    border: 1px solid var(--card-border);
    border-radius: 8px;
    color: var(--text-cream);
    background: transparent;
    font-size: 14px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  .btn-outline:hover { border-color: var(--text-muted); }

  .btn-gold {
    padding: 8px 18px;
    border: 1px solid var(--gold);
    border-radius: 8px;
    background: var(--gold);
    color: var(--bg-deep);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
  }
  .btn-gold:hover { background: var(--gold-light); }

  .order-list { display: flex; flex-direction: column; gap: 12px; }

  .order-card {
    background: var(--card);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    overflow: hidden;
  }

  .order-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 16px 20px;
    background: transparent;
    border: none;
    color: var(--text-cream);
    cursor: pointer;
    text-align: left;
  }
  .order-summary:hover { background: rgba(255,255,255,0.02); }

  .order-summary-left { display: flex; align-items: center; gap: 14px; }
  .order-icon { font-size: 24px; }
  .order-title { font-weight: 600; font-size: 15px; }
  .order-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

  .order-summary-right { display: flex; align-items: center; gap: 14px; }

  .alert-badge {
    background: var(--warn);
    color: var(--bg-deep);
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 999px;
  }

  .mini-progress { display: flex; gap: 4px; }
  .mini-step {
    width: 18px;
    height: 4px;
    border-radius: 2px;
    background: var(--card-border);
  }
  .mini-step.done { background: var(--gold-dim); }
  .mini-step.current {
    background: var(--gold-light);
    box-shadow: 0 0 6px var(--gold-light);
  }

  .chevron {
    font-size: 20px;
    color: var(--text-muted);
    transition: transform 0.2s;
  }
  .chevron.open { transform: rotate(90deg); }

  .order-body { padding: 0 20px 20px; }

  /* Stepper */
  .stepper {
    display: flex;
    align-items: flex-start;
    position: relative;
    margin-bottom: 24px;
    padding-top: 8px;
  }
  .step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .step-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }
  .step.pending .step-dot { background: var(--card-border); }
  .step.done .step-dot { background: var(--good); }
  .step.current .step-dot { background: var(--gold); }

  .step-check { font-size: 11px; color: #fff; font-weight: 700; }
  .step-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bg-deep);
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }

  .step-label {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 6px;
    text-align: center;
  }
  .step.done .step-label { color: var(--good); }
  .step.current .step-label { color: var(--gold); font-weight: 600; }

  .step-line {
    position: absolute;
    top: 10px;
    left: 50%;
    width: 100%;
    height: 2px;
    background: var(--card-border);
    z-index: 0;
  }
  .step-line.done { background: var(--good); }
  .step:last-child .step-line { display: none; }

  /* Panel */
  .panel {
    background: var(--bg-panel);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 16px 20px;
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .panel-header h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-cream);
  }
  .hint {
    font-size: 12px;
    color: var(--text-muted);
  }

  /* Highlights */
  .highlights-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
  .highlight-panel {
    background: var(--bg-panel);
    border-radius: 10px;
    padding: 14px 16px;
    border: 1px solid var(--card-border);
  }
  .highlight-panel.warn { border-left: 3px solid var(--warn); }
  .highlight-panel.good { border-left: 3px solid var(--good); }
  .highlight-head {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-cream);
  }
  .highlight-empty {
    font-size: 12px;
    color: var(--text-faint);
  }
  .highlight-panel ul {
    list-style: none;
    padding: 0;
  }
  .highlight-panel li {
    font-size: 12px;
    color: var(--text-muted);
    padding: 3px 0;
  }

  /* Quote Confirm Panel */
  .quote-confirm {
    background: rgba(92,184,125,0.08);
    border: 1px solid rgba(92,184,125,0.25);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 24px;
  }
  .quote-confirm-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 600;
    color: var(--good);
  }
  .quote-confirm-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--good);
    color: var(--bg-deep);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
  }
  .quote-figures {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 14px;
  }
  .quote-figures figure {
    text-align: center;
  }
  .quote-figures figure b {
    display: block;
    font-size: 16px;
    color: var(--text-cream);
    margin-bottom: 4px;
  }
  .quote-figures figure span {
    font-size: 11px;
    color: var(--text-muted);
  }
  .quote-confirm-note {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.6;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
    padding: 10px 14px;
  }
  .quote-confirm-note b { color: var(--text-cream); }

  /* Payment Grid */
  .payment-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .payment-card {
    background: var(--card);
    border: 1px solid var(--card-border);
    border-radius: 10px;
    padding: 14px 16px;
  }
  .payment-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .payment-tag {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-cream);
  }
  .payment-status {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 999px;
  }
  .payment-status.paid { background: rgba(92,184,125,0.15); color: var(--good); }
  .payment-status.waiting { background: rgba(229,173,70,0.15); color: var(--gold); }
  .payment-amount {
    font-size: 18px;
    font-weight: 700;
    color: var(--gold);
    margin-bottom: 4px;
  }
  .payment-desc {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  /* Checkpoints */
  .checkpoint-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .checkpoint-item {
    display: flex;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--card);
    border: 1px solid var(--card-border);
  }
  .checkpoint-item.done { border-left: 3px solid var(--good); }
  .checkpoint-item.action { border-left: 3px solid var(--gold); }
  .checkpoint-item.upcoming { border-left: 3px solid var(--card-border); opacity: 0.7; }
  .cp-marker {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 700;
  }
  .checkpoint-item.done .cp-marker { background: var(--good); color: #fff; }
  .checkpoint-item.action .cp-marker { background: var(--gold); color: var(--bg-deep); }
  .checkpoint-item.upcoming .cp-marker { background: var(--card-border); color: var(--text-faint); }
  .cp-body { flex: 1; min-width: 0; }
  .cp-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-cream);
    margin-bottom: 3px;
  }
  .cp-desc {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
    margin-bottom: 6px;
  }
  .cp-meta {
    font-size: 11px;
    color: var(--text-faint);
  }
  .cp-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  .btn-sm-gold {
    padding: 5px 14px;
    border: 1px solid var(--gold);
    border-radius: 6px;
    background: var(--gold);
    color: var(--bg-deep);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-sm-gold:hover { background: var(--gold-light); }
  .btn-sm-outline {
    padding: 5px 14px;
    border: 1px solid var(--card-border);
    border-radius: 6px;
    background: transparent;
    color: var(--text-muted);
    font-size: 12px;
    cursor: pointer;
  }
  .btn-sm-outline:hover { border-color: var(--text-muted); }
  .dot-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold);
    animation: pulse 1.5s infinite;
    display: inline-block;
  }

  /* Addons */
  .addon-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid var(--card-border);
  }
  .addon-item:last-of-type { border-bottom: none; }
  .addon-left b {
    font-size: 13px;
    color: var(--text-cream);
    display: block;
    margin-bottom: 2px;
  }
  .addon-left p {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }
  .addon-right {
    text-align: right;
    flex-shrink: 0;
  }
  .addon-price {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--gold);
    margin-bottom: 2px;
  }
  .addon-status {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 999px;
    display: inline-block;
  }
  .addon-status.included { background: rgba(92,184,125,0.15); color: var(--good); }
  .addon-status.pending { background: rgba(229,173,70,0.15); color: var(--gold); }
  .addon-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0 8px;
    border-top: 1px solid var(--card-border);
    margin-top: 8px;
  }
  .addon-total span {
    font-size: 12px;
    color: var(--text-muted);
  }
  .addon-total b {
    font-size: 14px;
    color: var(--gold);
  }
  .addon-add-btn {
    width: 100%;
    padding: 10px;
    border: 1px dashed var(--card-border);
    border-radius: 8px;
    background: transparent;
    color: var(--text-muted);
    font-size: 13px;
    cursor: pointer;
    margin-top: 8px;
  }
  .addon-add-btn:hover { border-color: var(--gold-dim); color: var(--gold-dim); }

  /* Feedback with avatars */
  .feedback-item {
    display: flex;
    gap: 14px;
    padding: 10px 0;
    border-bottom: 1px solid var(--card-border);
  }
  .feedback-item:last-child { border-bottom: none; }
  .fb-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--gold-dim);
    color: var(--text-cream);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .fb-body { flex: 1; min-width: 0; }
  .fb-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }
  .fb-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-cream);
  }
  .fb-date {
    font-size: 11px;
    color: var(--text-faint);
  }
  .fb-text {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
    margin: 0;
  }

  /* Comparison table */
  .comparison-table {
    background: var(--bg-panel);
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--card-border);
  }
  .comp-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    background: rgba(229,173,70,0.08);
    font-size: 12px;
    font-weight: 600;
    color: var(--gold-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .comp-header > div,
  .comp-row > div {
    padding: 10px 14px;
    font-size: 13px;
    color: var(--text-cream);
  }
  .comp-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid var(--card-border);
  }
  .comp-row:nth-child(odd) {
    background: rgba(255,255,255,0.015);
  }
`;
