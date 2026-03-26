"use client";

import { FormEvent, useEffect, useState } from "react";
import { authAPI } from "../../lib/api";

type QuoteRecord = {
  id: string | number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  status?: string | null;
  amount?: string | number | null;
};

type Notice = {
  tone: "success" | "danger";
  message: string;
} | null;

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "Envoye" },
  { value: "accepted", label: "Accepte" },
  { value: "rejected", label: "Refuse" },
];

function normalizeText(value?: string | number | null) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function formatDisplayValue(value?: string | number | null, fallback = "Non renseigne") {
  const text = normalizeText(value);
  return text || fallback;
}

function formatStatusLabel(status?: string | null) {
  switch (normalizeText(status)) {
    case "draft":
      return "Brouillon";
    case "sent":
      return "Envoye";
    case "accepted":
      return "Accepte";
    case "rejected":
      return "Refuse";
    default:
      return formatDisplayValue(status, "Inconnu");
  }
}

function getStatusTone(status?: string | null) {
  switch (normalizeText(status)) {
    case "accepted":
      return "success";
    case "rejected":
      return "danger";
    case "sent":
      return "warning";
    default:
      return "neutral";
  }
}

function formatAmount(value?: string | number | null) {
  const text = normalizeText(value);

  if (!text) {
    return "Non saisi";
  }

  const parsed = Number(text.replace(/\s/g, "").replace(",", "."));

  if (Number.isFinite(parsed)) {
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
    }).format(parsed);
  }

  return text;
}

function buildStatusOptions(status?: string | null) {
  const normalizedStatus = normalizeText(status);

  if (!normalizedStatus || STATUS_OPTIONS.some((option) => option.value === normalizedStatus)) {
    return STATUS_OPTIONS;
  }

  return [
    ...STATUS_OPTIONS,
    {
      value: normalizedStatus,
      label: formatStatusLabel(normalizedStatus),
    },
  ];
}

function getInitials(value?: string | number | null) {
  const text = normalizeText(value);

  if (!text) {
    return "DV";
  }

  const compact = text.replace(/[^a-zA-Z0-9]+/g, "");
  return compact.slice(0, 2).toUpperCase() || "DV";
}

function LoadingState() {
  return (
    <section className="admin-edit-page section-padding" aria-busy="true" aria-label="Chargement du devis">
      <div className="container admin-edit-page__container">
        <header className="admin-edit-page__header">
          <span className="eyebrow">Espace admin</span>
          <div className="admin-edit-page__skeleton-line admin-edit-page__skeleton-line--title" />
          <div className="admin-edit-page__skeleton-line admin-edit-page__skeleton-line--lead" />
        </header>

        <div className="client-space-grid">
          <div className="tracking-preview admin-edit-page__loading-card">
            <div className="admin-edit-page__skeleton-line admin-edit-page__skeleton-line--chip" />
            <div className="admin-edit-page__skeleton-line admin-edit-page__skeleton-line--heading" />
            <div className="admin-edit-page__skeleton-line admin-edit-page__skeleton-line--subline" />
            <div className="admin-edit-page__skeleton-stack">
              <div className="admin-edit-page__skeleton-row" />
              <div className="admin-edit-page__skeleton-row" />
              <div className="admin-edit-page__skeleton-row" />
            </div>
          </div>

          <div className="profile-card admin-edit-page__loading-card">
            <div className="profile-card__top">
              <div className="profile-avatar" aria-hidden="true">
                <span>...</span>
              </div>
              <div className="admin-edit-page__skeleton-copy">
                <div className="admin-edit-page__skeleton-line admin-edit-page__skeleton-line--chip" />
                <div className="admin-edit-page__skeleton-line admin-edit-page__skeleton-line--heading" />
                <div className="admin-edit-page__skeleton-line admin-edit-page__skeleton-line--subline" />
              </div>
            </div>

            <div className="admin-edit-page__skeleton-form">
              <div className="admin-edit-page__skeleton-field" />
              <div className="admin-edit-page__skeleton-field" />
            </div>

            <div className="admin-edit-page__actions">
              <div className="admin-edit-page__skeleton-button" />
              <div className="admin-edit-page__skeleton-button" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="admin-edit-page section-padding" aria-labelledby="edit-devis-title">
      <div className="container admin-edit-page__container">
        <header className="admin-edit-page__header">
          <span className="eyebrow">Espace admin</span>
          <h1 className="section-title left" id="edit-devis-title">
            Modifier le devis
          </h1>
          <p className="admin-edit-page__lead">{message}</p>
        </header>

        <div className="tracking-preview admin-edit-page__notice-card" role="alert">
          <span className="eyebrow">Erreur</span>
          <p>Impossible de charger ce devis pour le moment.</p>
          <button className="btn btn-primary admin-edit-page__retry" type="button" onClick={onRetry}>
            Reessayer
          </button>
        </div>
      </div>
    </section>
  );
}

export function EditDevisSection({ id }: { id: string }) {
  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [reloadIndex, setReloadIndex] = useState(0);
  const [formStatus, setFormStatus] = useState("");
  const [formAmount, setFormAmount] = useState("");

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setLoadError(null);
    setNotice(null);
    setQuote(null);
    setFormStatus("");
    setFormAmount("");

    async function fetchQuote() {
      try {
        const response = await authAPI.get(`/quotes/${id}`);

        if (!active) {
          return;
        }

        const nextQuote = response.data as QuoteRecord;
        setQuote(nextQuote);
        setFormStatus(normalizeText(nextQuote.status));
        setFormAmount(normalizeText(nextQuote.amount));
      } catch {
        if (!active) {
          return;
        }

        setLoadError("Impossible de charger ce devis pour le moment.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void fetchQuote();

    return () => {
      active = false;
    };
  }, [id, reloadIndex]);

  async function updateQuote(formData: FormData) {
    const nextStatus = normalizeText(String(formData.get("status") ?? ""));
    const nextAmount = normalizeText(String(formData.get("amount") ?? ""));

    setIsSaving(true);
    setNotice(null);

    try {
      await authAPI.put(`/quotes/${id}`, {
        status: nextStatus,
        amount: nextAmount,
      });

      setQuote((current) =>
        current
          ? {
              ...current,
              status: nextStatus,
              amount: nextAmount,
            }
          : current,
      );
      setFormStatus(nextStatus);
      setFormAmount(nextAmount);
      setNotice({
        tone: "success",
        message: "Le devis a ete mis a jour.",
      });
    } catch {
      setNotice({
        tone: "danger",
        message: "La mise a jour a echoue. Reessayez.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function sendQuote() {
    if (!quote || isSaving) {
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      await authAPI.put(`/quotes/${id}`, { status: "sent" });

      setQuote((current) => (current ? { ...current, status: "sent" } : current));
      setFormStatus("sent");
      setNotice({
        tone: "success",
        message: "Le devis a ete envoye.",
      });
    } catch {
      setNotice({
        tone: "danger",
        message: "L'envoi a echoue. Reessayez.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    void updateQuote(new FormData(event.currentTarget));
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (loadError && !quote) {
    return <ErrorState message={loadError} onRetry={() => setReloadIndex((count) => count + 1)} />;
  }

  if (!quote) {
    return null;
  }

  const statusLabel = formatStatusLabel(quote.status);
  const statusTone = getStatusTone(quote.status);
  const statusOptions = buildStatusOptions(quote.status);
  const quoteName = formatDisplayValue(quote.name, "Client sans nom");
  const quoteEmail = formatDisplayValue(quote.email, "Email non renseigne");
  const quotePhone = formatDisplayValue(quote.phone, "Telephone non renseigne");
  const quoteMessage = formatDisplayValue(quote.message, "Aucun message fourni");
  const quoteAmount = formatAmount(quote.amount);
  const initials = getInitials(quote.name || quote.id);

  return (
    <section className="admin-edit-page section-padding" aria-labelledby="edit-devis-title">
      <div className="container admin-edit-page__container">
        <header className="admin-edit-page__header">
          <span className="eyebrow">Espace admin</span>
          <h1 className="section-title left" id="edit-devis-title">
            Modifier le devis
          </h1>
          <p className="admin-edit-page__lead">
            Consultez les infos du client, ajustez le statut et le montant, puis envoyez la version finale.
          </p>
        </header>

        {notice ? (
          <div
            className={`admin-edit-page__notice admin-edit-page__notice--${notice.tone}`}
            role={notice.tone === "danger" ? "alert" : "status"}
            aria-live="polite"
          >
            {notice.message}
          </div>
        ) : null}

        <div className="client-space-grid admin-edit-page__grid">
          <article className="tracking-preview admin-edit-page__summary" aria-labelledby="quote-summary-title">
            <div className="section-heading">
              <span className="eyebrow">Fiche client</span>
              <h3 id="quote-summary-title">{quoteName}</h3>
              <p className="profile-summary">{quoteEmail}</p>
            </div>

            <div className="profile-card__top">
              <div className="profile-avatar" aria-hidden="true">
                <span>{initials}</span>
              </div>
              <div>
                <p className="admin-edit-page__reference">Devis #{quote.id}</p>
                <p className="profile-summary">{quotePhone}</p>
              </div>
            </div>

            <ul className="profile-list">
              <li>
                <span>Reference</span>
                <strong>#{quote.id}</strong>
              </li>
              <li>
                <span>Telephone</span>
                <strong>{quotePhone}</strong>
              </li>
              <li>
                <span>Statut</span>
                <strong>{statusLabel}</strong>
              </li>
              <li>
                <span>Montant</span>
                <strong>{quoteAmount}</strong>
              </li>
            </ul>

            <div className="profile-badges">
              <span className="profile-badge">#{quote.id}</span>
              <span className={`profile-badge admin-edit-page__badge admin-edit-page__badge--${statusTone}`}>
                {statusLabel}
              </span>
            </div>

            <section className="admin-edit-page__message">
              <span className="eyebrow">Message client</span>
              <p>{quoteMessage}</p>
            </section>
          </article>

          <form className="profile-card admin-edit-page__form" onSubmit={handleSubmit}>
            <div className="profile-card__top">
              <div className="profile-avatar" aria-hidden="true">
                <span>DV</span>
              </div>
              <div>
                <span className="eyebrow">Edition rapide</span>
                <h3>Sauvegarder et envoyer</h3>
                <p className="profile-summary">
                  Modifiez le statut ou le montant, puis choisissez si le devis doit partir au client.
                </p>
              </div>
            </div>

            <div className="admin-edit-page__form-grid">
              <label className="admin-edit-page__field">
                <span className="admin-edit-page__label">Statut</span>
                <select
                  name="status"
                  className="admin-edit-page__control admin-edit-page__control--select"
                  value={formStatus}
                  onChange={(event) => setFormStatus(event.target.value)}
                  required
                  disabled={isSaving}
                >
                  <option value="">Choisir un statut</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-edit-page__field">
                <span className="admin-edit-page__label">Montant</span>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Ex: 1200"
                  className="admin-edit-page__control"
                  value={formAmount}
                  onChange={(event) => setFormAmount(event.target.value)}
                  disabled={isSaving}
                />
              </label>
            </div>

            <div className="profile-badges admin-edit-page__state">
              <span className={`profile-badge admin-edit-page__badge admin-edit-page__badge--${statusTone}`}>
                Statut: {statusLabel}
              </span>
              <span className="profile-badge">{isSaving ? "En cours" : "Pret"}</span>
            </div>

            <div className="admin-edit-page__actions">
              <button className="btn btn-primary" type="submit" disabled={isSaving}>
                {isSaving ? "Sauvegarde..." : "Mettre a jour"}
              </button>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={sendQuote}
                disabled={isSaving}
              >
                {isSaving ? "Envoi..." : "Envoyer"}
              </button>
            </div>

            <p className="admin-edit-page__note">Envoyer passe automatiquement le devis au statut envoye.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
