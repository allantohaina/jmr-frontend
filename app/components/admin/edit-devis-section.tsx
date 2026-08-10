"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ProblemHierarchyPanel } from "../problem-hierarchy-panel";
import { TEXTILE_PROBLEM_THREADS, authAPI } from "@/app/lib";
import { DocumentPreview } from "@/app/components/document-preview";
import { TextileDocument, AdminSignaturePanel } from "@/app/components/documents";
import type { DocumentSignature, DocumentLineItem, TextileDocumentProps } from "@/app/components/documents/types";
import { Loader, Printer, ShoppingCart } from "lucide-react";
import { AttachmentUploader } from "./attachment-uploader";

type QuoteRecord = {
  id: string | number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  status?: string | null;
  amount?: string | number | null;
  deposit_amount?: string | number | null;
  balance_amount?: string | number | null;
  deposit_paid?: boolean;
  balance_paid?: boolean;
  files?: Array<{ name: string; url: string; type: string }>;
  created_at?: string;
  request_type?: string;
  admin_signature_name?: string | null;
  admin_signature_at?: string | null;
};

type Notice = {
  tone: "success" | "danger";
  message: string;
} | null;

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "Envoye" },
  { value: "accepted", label: "Accepte" },
  { value: "production", label: "Production" },
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
    case "production":
      return "En production";
    case "rejected":
      return "Refuse";
    default:
      return formatDisplayValue(status, "Inconnu");
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

export function EditDevisSection({ id }: { id: string }) {
  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [reloadIndex, setReloadIndex] = useState(0);
  const [formStatus, setFormStatus] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDeposit, setFormDeposit] = useState("");
  const [formBalance, setFormBalance] = useState("");
  const [depositPaid, setDepositPaid] = useState(false);
  const [balancePaid, setBalancePaid] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setLoadError(null);
    setNotice(null);
    setQuote(null);
    setFormStatus("");
    setFormAmount("");
    setFormDeposit("");
    setFormBalance("");
    setDepositPaid(false);
    setBalancePaid(false);

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
        setFormDeposit(normalizeText(nextQuote.deposit_amount));
        setFormBalance(normalizeText(nextQuote.balance_amount));
        setDepositPaid(!!nextQuote.deposit_paid);
        setBalancePaid(!!nextQuote.balance_paid);
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
    const nextDeposit = normalizeText(String(formData.get("deposit_amount") ?? ""));
    const nextBalance = normalizeText(String(formData.get("balance_amount") ?? ""));

    setIsSaving(true);
    setNotice(null);

    try {
      await authAPI.put(`/quotes/${id}`, {
        status: nextStatus,
        amount: nextAmount,
        deposit_amount: nextDeposit,
        balance_amount: nextBalance,
        deposit_paid: depositPaid,
        balance_paid: balancePaid,
      });

      setQuote((current) =>
        current
          ? {
              ...current,
              status: nextStatus,
              amount: nextAmount,
              deposit_amount: nextDeposit,
              balance_amount: nextBalance,
              deposit_paid: depositPaid,
              balance_paid: balancePaid,
            }
          : current,
      );
      setFormStatus(nextStatus);
      setFormAmount(nextAmount);
      setFormDeposit(nextDeposit);
      setFormBalance(nextBalance);
      setNotice({
        tone: "success",
        message: "Le devis et les tranches de paiement ont été mis à jour.",
      });
    } catch {
      setNotice({
        tone: "danger",
        message: "La mise à jour a échoué. Veuillez réessayer.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function sendQuote() {
    if (!quote || isSaving || quote.status === "production") {
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
        message: "Le devis a été envoyé au client.",
      });
    } catch {
      setNotice({
        tone: "danger",
        message: "L'envoi a échoué. Veuillez réessayer.",
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

  function quoteToQuoteDoc(q: QuoteRecord): Omit<TextileDocumentProps, "kind"> {
    const amount = parseFloat(String(q.amount ?? "0"));
    const deposit = parseFloat(String(q.deposit_amount ?? "0"));
    const balance = parseFloat(String(q.balance_amount ?? "0"));
    const taxRate = 20;
    const subtotal = amount / (1 + taxRate / 100);

    const lines: DocumentLineItem[] = [];
    if (deposit > 0) {
      lines.push({
        description: "Acompte — 30% à la commande",
        quantity: 1,
        unit: "lot",
        unitPrice: deposit / (1 + taxRate / 100),
        taxRate,
        reference: "Tranche 1",
      });
    }
    if (balance > 0) {
      lines.push({
        description: "Solde — 70% à livraison",
        quantity: 1,
        unit: "lot",
        unitPrice: balance / (1 + taxRate / 100),
        taxRate,
        reference: "Tranche 2",
      });
    }
    if (lines.length === 0) {
      lines.push({
        description: q.message ? `Devis textile — ${q.message.slice(0, 80)}` : "Prestation de confection textile",
        quantity: 1,
        unit: "lot",
        unitPrice: subtotal,
        taxRate,
        reference: q.request_type ?? "",
      });
    }

    const validUntil = q.created_at
      ? new Date(new Date(q.created_at).getTime() + 30 * 24 * 3600 * 1000).toISOString()
      : undefined;

    return {
      number: `DEV-${String(q.id).slice(0, 8).toUpperCase()}`,
      issuedAt: q.created_at ?? new Date().toISOString(),
      validUntil,
      client: {
        name: q.name ?? "Client",
        email: q.email ?? undefined,
        phone: q.phone ?? undefined,
        address: q.message ? `Projet : ${q.message.slice(0, 120)}` : undefined,
      },
      lines,
      currency: "EUR",
      status: formatStatusLabel(q.status),
      notes: q.message ?? undefined,
      paymentTerms: deposit > 0 && balance > 0
        ? `Acompte de ${formatAmount(deposit)} € · Solde de ${formatAmount(balance)} € à livraison`
        : "Paiement à 30 jours",
      signature: q.admin_signature_name && q.admin_signature_at
        ? { name: q.admin_signature_name, signedAt: q.admin_signature_at }
        : undefined,
    };
  }

  async function handleApprove(signature: DocumentSignature) {
    setSavingSignature(true);
    setNotice(null);
    try {
      await authAPI.signQuote(id, signature);
      setQuote((current) =>
        current
          ? { ...current, admin_signature_name: signature.name, admin_signature_at: signature.signedAt instanceof Date ? signature.signedAt.toISOString() : signature.signedAt }
          : current,
      );
      setNotice({ tone: "success", message: "Approbation administrative enregistrée." });
    } catch {
      setNotice({ tone: "danger", message: "Impossible d'enregistrer la signature." });
    } finally {
      setSavingSignature(false);
    }
  }

  const handleCreateOrder = async () => {
    if (!quote || quote.status !== "accepted") return;
    if (!confirm("Créer une commande à partir de ce devis accepté ?")) return;
    try {
      setNotice({ tone: "success", message: "Création de la commande en cours..." });
      const res = await authAPI.post<{ id: string; data?: { id: string } }>(`/quotes/${id}/convert-to-commande`, {});
      const commandeId = res.data?.data?.id || res.data?.id;
      if (commandeId) {
        setNotice({ tone: "success", message: "Commande créée avec succès" });
        window.location.href = `/backoffice/orders?id=${commandeId}`;
      } else {
        setNotice({ tone: "danger", message: "Commande créée mais impossible de récupérer l'ID" });
      }
    } catch {
      setNotice({ tone: "danger", message: "Erreur lors de la création de la commande" });
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 md:px-12 py-10 animate-pulse">
        <div className="h-8 w-64 bg-[#163526]/10 rounded mb-4"></div>
        <div className="h-4 w-96 bg-[#163526]/5 rounded mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-white rounded-[2rem] border border-[#163526]/5"></div>
          <div className="h-64 bg-white rounded-[2rem] border border-[#163526]/5"></div>
        </div>
      </div>
    );
  }

  if (loadError && !quote) {
    return (
      <div className="px-6 md:px-12 py-10 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
        <h2 className="font-headline text-2xl text-[#163526] mb-2">{loadError}</h2>
        <button 
          onClick={() => setReloadIndex(i => i + 1)}
          className="mt-6 px-8 py-3 bg-[#163526] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!quote) return null;

  const statusLabel = formatStatusLabel(quote.status);
  const statusOptions = buildStatusOptions(quote.status);
  const initials = getInitials(quote.name || quote.id);
  const isClientValidated = quote.status === "accepted" || quote.status === "production";

  return (
    <div className="px-6 md:px-12 py-10 space-y-10 max-w-5xl">
      {/* Breadcrumb / Back */}
      <Link href="/backoffice/devis" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#163526]/40 hover:text-orange-500 transition-colors group">
        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Retour aux devis
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="font-headline text-3xl text-[#163526]">Modifier le devis</h2>
          <p className="text-[#1b1c19]/40 text-xs font-bold uppercase tracking-widest mt-1">Référence: #{quote.id}</p>
        </div>
        <div className="flex gap-4">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
            quote.status === "accepted" ? "bg-green-100 text-green-700 border-green-200" :
            quote.status === "rejected" ? "bg-red-100 text-red-700 border-red-200" :
            "bg-orange-100 text-orange-700 border-orange-200"
          }`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {notice && (
        <div className={`p-4 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-3 ${
          notice.tone === "success" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
        }`}>
          <span className="material-symbols-outlined text-sm">{notice.tone === "success" ? "check_circle" : "error"}</span>
          {notice.message}
        </div>
      )}

      {isClientValidated ? (
        <div className="p-4 rounded-xl border border-green-100 bg-green-50 text-xs font-bold uppercase tracking-widest text-green-700 flex items-center gap-3">
          <span className="material-symbols-outlined text-sm">verified</span>
          Le client a valide et signe cette version. Toute correction ou ajout passe par une nouvelle version signee.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Client Info Card */}
        <div className="bg-white rounded-[2rem] p-8 border border-[#163526]/5 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#163526] rounded-2xl flex items-center justify-center text-white font-headline text-2xl">
              {initials}
            </div>
            <div>
              <h3 className="font-headline text-xl text-[#163526]">{quote.name || "Client sans nom"}</h3>
              <p className="text-xs text-[#163526]/60">{quote.email || "Pas d'email"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">Téléphone</p>
              <p className="text-sm font-bold text-[#163526]">{quote.phone || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">Montant Total</p>
              <p className="text-sm font-bold text-[#163526]">{formatAmount(quote.amount)}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#163526]/5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Suivi des Tranches</p>
            <div className="grid grid-cols-1 gap-3">
              <div className={`p-4 rounded-xl flex justify-between items-center ${quote.deposit_paid ? "bg-green-50 border border-green-100" : "bg-orange-50 border border-orange-100"}`}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/60">Acompte (Avant livraison)</p>
                  <p className="text-sm font-bold text-[#163526]">{formatAmount(quote.deposit_amount)}</p>
                </div>
                <span className={`material-symbols-outlined ${quote.deposit_paid ? "text-green-600" : "text-orange-400"}`}>
                  {quote.deposit_paid ? "check_circle" : "pending"}
                </span>
              </div>
              <div className={`p-4 rounded-xl flex justify-between items-center ${quote.balance_paid ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"}`}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/60">Solde (Après livraison)</p>
                  <p className="text-sm font-bold text-[#163526]">{formatAmount(quote.balance_amount)}</p>
                </div>
                <span className={`material-symbols-outlined ${quote.balance_paid ? "text-green-600" : "text-gray-300"}`}>
                  {quote.balance_paid ? "check_circle" : "schedule"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#163526]/5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Documents & Pièces jointes</p>
            <AttachmentUploader entityType="cotation" entityId={id} />
          </div>

          <div className="pt-6 border-t border-[#163526]/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-3">Message du client</p>
            <div className="bg-[#faf9f4] p-4 rounded-xl text-xs text-[#163526]/80 leading-relaxed italic">
              &quot;{quote.message || "Aucun message fourni"}&quot;
            </div>
          </div>
        </div>

        {/* Action Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-[#163526]/5 shadow-sm space-y-8">
          <h3 className="font-headline text-xl text-[#163526]">Gestion & Mise à jour</h3>
          
          <div className="space-y-6">
            {/* Notification / Alert Section */}
            <div className="space-y-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">notifications_active</span>
                Envoyer une notification au client
              </p>
              <select 
                className="w-full bg-white border-none p-3 rounded-lg text-[11px] font-bold text-orange-900 outline-none"
                onChange={(e) => {
                  if (e.target.value) alert(`Notification "${e.target.value}" envoyée au client.`);
                }}
              >
                <option value="">S&eacute;lectionner un type d&apos;alerte...</option>
                <option value="delay">Retard de production</option>
                <option value="error">Erreur de conception / technique</option>
                <option value="ready">Prêt pour livraison</option>
                <option value="info">Besoin d&apos;informations compl&eacute;mentaires</option>
              </select>
            </div>

            <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">report</span>
                Probleme / Sous-probleme
              </p>
              <p className="text-[11px] font-medium text-orange-900/70">
                Seuls les 4 problemes majeurs restent visibles par defaut. Les sous-problemes se
                deploient avec Voir plus.
              </p>
              <ProblemHierarchyPanel
                className="space-y-4"
                mode="admin"
                problems={TEXTILE_PROBLEM_THREADS}
                theme="light"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Statut du dossier</label>
                <select
                  name="status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-[#faf9f4] border-none p-4 rounded-xl text-xs font-bold text-[#163526] focus:ring-2 focus:ring-[#163526]/10 outline-none appearance-none cursor-pointer"
                  disabled={isSaving}
                >
                  <option value="">Choisir un statut</option>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Montant Total (€)</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full bg-[#faf9f4] border-none p-4 rounded-xl text-xs font-bold text-[#163526] focus:ring-2 focus:ring-[#163526]/10 outline-none"
                  placeholder="Ex: 1500.00"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#163526]/5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Gestion des Tranches de Paiement</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-4 bg-[#faf9f4] rounded-2xl">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40">Acompte (€)</label>
                  <input
                    name="deposit_amount"
                    type="number"
                    step="0.01"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(e.target.value)}
                    className="w-full bg-white border-none p-3 rounded-lg text-xs font-bold text-[#163526] outline-none"
                    placeholder="Montant acompte"
                    disabled={isSaving}
                  />
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={depositPaid}
                      onChange={(e) => setDepositPaid(e.target.checked)}
                      className="w-4 h-4 rounded border-[#163526]/10 text-[#163526] focus:ring-0"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/60 group-hover:text-[#163526] transition-colors">Payé (Acompte)</span>
                  </label>
                </div>

                <div className="space-y-3 p-4 bg-[#faf9f4] rounded-2xl">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40">Solde (€)</label>
                  <input
                    name="balance_amount"
                    type="number"
                    step="0.01"
                    value={formBalance}
                    onChange={(e) => setFormBalance(e.target.value)}
                    className="w-full bg-white border-none p-3 rounded-lg text-xs font-bold text-[#163526] outline-none"
                    placeholder="Montant solde"
                    disabled={isSaving}
                  />
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={balancePaid}
                      onChange={(e) => setBalancePaid(e.target.checked)}
                      className="w-4 h-4 rounded border-[#163526]/10 text-[#163526] focus:ring-0"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/60 group-hover:text-[#163526] transition-colors">Payé (Solde)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col gap-4">
            {quote.status === "accepted" && quote.deposit_paid ? (
              <button
                type="button"
                onClick={() => {
                  alert("Lancement de la production ! Les opérateurs ont été notifiés.");
                  setFormStatus("production");
                }}
                className="w-full py-4 bg-orange-500 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                Lancer la Production
              </button>
            ) : null}
            
            {quote.status === "accepted" && !quote.deposit_paid ? (
              <button
                type="button"
                onClick={handleCreateOrder}
                className="w-full py-4 bg-green-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Créer la Commande
              </button>
            ) : null}
            
            {quote.status === "accepted" && quote.deposit_paid ? (
              <button
                type="button"
                onClick={handleCreateOrder}
                className="w-full py-4 bg-green-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Créer la Commande
              </button>
            ) : null}
            
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-[#163526] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isSaving ? "Sauvegarde en cours..." : "Enregistrer les modifications"}
            </button>
            
            <button
              type="button"
              onClick={sendQuote}
              disabled={isSaving || quote.status === "sent" || quote.status === "production"}
              className="w-full py-4 bg-white border border-[#163526]/10 text-[#163526] font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#163526]/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm text-orange-500">send</span>
              {quote.status === "production"
                ? "Deja en production"
                : quote.status === "sent"
                  ? "Deja envoye"
                  : "Envoyer le devis au client"}
            </button>
          </div>
        </form>
      </div>

      <section className="space-y-6 print:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 print:hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a67428]">Document A4 · Imprimable</p>
            <h3 className="font-headline text-2xl text-[#163526] mt-1">Aperçu du devis</h3>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#163526]/15 bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#163526] hover:border-[#e5ad46] hover:text-[#e5ad46] transition-colors"
          >
            <Printer className="h-4 w-4" /> Imprimer
          </button>
        </div>

        <TextileDocument kind="quote" {...quoteToQuoteDoc(quote)} />

        <div className="print:hidden max-w-[210mm] mx-auto">
          {savingSignature ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#e5ad46]/30 bg-[#fffdf8] p-6 text-[#172d42] shadow-sm">
              <Loader className="h-4 w-4 animate-spin text-[#e5ad46]" />
              <span className="text-xs font-bold uppercase tracking-widest">Enregistrement de la signature…</span>
            </div>
          ) : (
            <AdminSignaturePanel
              initialSignature={
                quote.admin_signature_name && quote.admin_signature_at
                  ? { name: quote.admin_signature_name, signedAt: quote.admin_signature_at }
                  : undefined
              }
              onApprove={handleApprove}
            />
          )}
        </div>
      </section>
    </div>
  );
}
