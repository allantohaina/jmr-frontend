"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getUser, getToken } from "@/app/lib/auth";
import { authAPI } from "@/app/lib/api";
import type { QuoteRecord, CommandeRecord } from "@/app/lib/api";
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

function formatCurrency(val: number | null | undefined): string {
  if (val == null) return "—";
  return val.toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " DH";
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
};

const STEP_LABELS = ["Envoyé", "Accepté", "Production", "Livraison", "Terminé"];

function DevisDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [commandes, setCommandes] = useState<CommandeRecord[]>([]);
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

                        {/* Feedback */}
                        <div className="feedback-section">
                          <div className="feedback-head">Retour de l&apos;atelier</div>
                          <div className="feedback-empty">Aucun retour pour le moment.</div>
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

  /* Feedback */
  .feedback-section {
    background: var(--bg-panel);
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 20px;
    border: 1px solid var(--card-border);
  }
  .feedback-head {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-cream);
  }
  .feedback-empty {
    font-size: 12px;
    color: var(--text-faint);
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
