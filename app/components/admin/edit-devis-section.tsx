"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProblemHierarchyPanel } from "../problem-hierarchy-panel";
import { TEXTILE_PROBLEM_THREADS, authAPI } from "@/app/lib";
import { TextileDocument, AdminSignaturePanel } from "@/app/components/documents";
import type { DocumentSignature, DocumentLineItem, TextileDocumentProps } from "@/app/components/documents/types";
import { Loader, Printer, ShoppingCart } from "lucide-react";
import { AttachmentUploader } from "./attachment-uploader";
import { useToast } from "@/app/components/toast-provider";

type QuoteRecord = {
  id: string | number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  category?: string | null;
  quantite?: string | null;
  status?: string | null;
  amount?: string | number | null;
  deposit_amount?: string | number | null;
  balance_amount?: string | number | null;
  deposit_paid?: boolean | number | string;
  balance_paid?: boolean | number | string;
  files?: Array<{ name: string; url: string; type: string }>;
  created_at?: string;
  request_type?: string;
  admin_signature_name?: string | null;
  admin_signature_at?: string | null;
  confirmation_deadline?: string | null;
  confirmation_days?: number;
  date_livraison_prevue?: string | null;
};

type Notice = {
  tone: "success" | "danger";
  message: string;
} | null;

type TabId = "tarif" | "client" | "statut" | "apercu";

type LineRow = {
  id: string;
  designation: string;
  detail: string;
  qty: number;
  unitPrice: number;
  tva: number;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "pending", label: "Reçu" },
  { value: "needs_info", label: "À préciser" },
  { value: "sent", label: "Envoyé" },
  { value: "accepted", label: "Accepté" },
  { value: "production", label: "Production" },
  { value: "rejected", label: "Refusé" },
  { value: "expired", label: "Expiré" },
];

const TVA_OPTIONS = [0, 20];

function normalizeText(value?: string | number | null) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function formatStatusLabel(status?: string | null) {
  switch (normalizeText(status)) {
    case "draft":
      return "Brouillon";
    case "pending":
      return "Reçu";
    case "needs_info":
      return "À préciser";
    case "sent":
      return "Envoyé";
    case "accepted":
      return "Accepté";
    case "production":
      return "En production";
    case "rejected":
      return "Refusé";
    case "expired":
      return "Expiré";
    default:
      return normalizeText(status) || "Inconnu";
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

function fmtAr(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} Ar`;
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

function parseQty(raw?: string | number | null) {
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function buildLinesFromQuote(q: QuoteRecord): LineRow[] {
  const qty = parseQty(q.quantite);
  const amount = Number(String(q.amount ?? "0").replace(/\s/g, "").replace(",", ".")) || 0;
  return [
    {
      id: "ligne-1",
      designation: q.category ? `Prestation — ${q.category}` : "Prestation de confection textile",
      detail: q.message ? q.message.slice(0, 120) : "",
      qty,
      unitPrice: amount > 0 && qty > 0 ? Math.round(amount / qty) : 0,
      tva: 20,
    },
  ];
}

const scopedStyles = `
.eqd-page{max-width:900px;margin:0 auto;}
.eqd-crumb{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(234, 161, 0,.4);margin-bottom:14px;text-decoration:none;transition:color .2s;}
.eqd-crumb:hover{color:#EAA100;}
.eqd-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:20px;flex-wrap:wrap;}
.eqd-head h1{font-size:22px;font-weight:600;margin:0 0 4px;color:#FFF8EC;}
.eqd-head .ref{font-size:13px;color:#B9C3D0;}
.eqd-badge{background:rgba(234, 161, 0,.12);color:#EAA100;border:1px solid rgba(234, 161, 0,.35);padding:5px 14px;border-radius:20px;font-size:13px;font-weight:500;height:fit-content;white-space:nowrap;}
.eqd-tabs{display:flex;gap:4px;border-bottom:1px solid rgba(234, 161, 0,.12);margin-bottom:20px;overflow-x:auto;}
.eqd-tab{background:none;border:none;color:#B9C3D0;font-size:14px;font-weight:500;padding:10px 16px;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:color .2s;}
.eqd-tab:hover{color:#FFF8EC;}
.eqd-tab.active{color:#EAA100;border-bottom-color:#EAA100;}
.eqd-panel{display:none;}
.eqd-panel.active{display:block;}
.eqd-card{background:#161D30;border:1px solid rgba(234, 161, 0,.1);border-radius:12px;padding:20px 22px;margin-bottom:16px;}
.eqd-card h2{font-size:15px;font-weight:600;margin:0 0 4px;color:#FFF8EC;}
.eqd-card .card-sub{font-size:13px;color:#B9C3D0;margin:0 0 16px;line-height:1.55;}
.eqd-client-msg-label{font-size:12px;color:#B9C3D0;margin-bottom:8px;}
.eqd-client-msg{background:#1e2a38;border:1px solid rgba(234, 161, 0,.1);border-radius:10px;padding:14px 16px;font-size:13.5px;color:#B9C3D0;line-height:1.6;}
.eqd-table-wrap{overflow-x:auto;}
table.eqd-lines{width:100%;border-collapse:collapse;font-size:13.5px;min-width:560px;}
table.eqd-lines th{text-align:left;font-weight:500;color:#B9C3D0;font-size:12px;padding:0 8px 8px 0;border-bottom:1px solid rgba(234, 161, 0,.12);}
table.eqd-lines td{padding:8px 8px 8px 0;border-bottom:1px solid rgba(234, 161, 0,.08);vertical-align:middle;color:#FFF8EC;}
table.eqd-lines th:last-child,table.eqd-lines td:last-child{text-align:right;padding-right:0;}
table.eqd-lines input,table.eqd-lines select{width:100%;background:#1e2a38;border:1px solid rgba(234, 161, 0,.15);color:#FFF8EC;border-radius:6px;padding:6px 8px;font-size:13.5px;}
table.eqd-lines input:focus,table.eqd-lines select:focus{outline:none;border-color:#EAA100;}
.eqd-col-qty,.eqd-col-tva{width:70px;}
.eqd-col-price{width:130px;}
.eqd-col-total{width:120px;text-align:right;font-weight:500;}
.eqd-locked .sub{display:block;font-size:11px;color:#B9C3D0;margin-top:2px;}
.eqd-col-qty.eqd-locked{color:#B9C3D0;}
.eqd-totals{display:flex;justify-content:flex-end;margin-top:18px;}
.eqd-totals-box{width:240px;font-size:13.5px;}
.eqd-totals-row{display:flex;justify-content:space-between;padding:5px 0;color:#B9C3D0;}
.eqd-totals-row.grand{border-top:1px solid rgba(234, 161, 0,.15);margin-top:6px;padding-top:10px;font-size:16px;font-weight:600;color:#FFF8EC;}
.eqd-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 16px;}
.eqd-field label{display:block;font-size:12px;color:#B9C3D0;margin-bottom:6px;}
.eqd-field input,.eqd-field select,.eqd-field textarea{width:100%;background:#1e2a38;border:1px solid rgba(234, 161, 0,.15);color:#FFF8EC;border-radius:8px;padding:9px 10px;font-size:14px;}
.eqd-field input:focus,.eqd-field select:focus,.eqd-field textarea:focus{outline:none;border-color:#EAA100;}
.eqd-field textarea{resize:vertical;min-height:90px;}
.eqd-field.full{grid-column:1/-1;}
.eqd-readonly{background:#1e2a38;border:1px solid rgba(234, 161, 0,.1);border-radius:8px;padding:9px 10px;font-size:14px;color:#B9C3D0;}
.eqd-checkline{display:flex;align-items:center;gap:8px;font-size:13.5px;color:#B9C3D0;margin-top:6px;}
.eqd-checkline input{width:auto;accent-color:#EAA100;}
.eqd-actionbar{position:sticky;bottom:16px;display:flex;gap:10px;background:#161D30;border:1px solid rgba(234, 161, 0,.2);border-radius:12px;padding:12px;margin-top:8px;z-index:10;}
.eqd-btn{flex:1;padding:11px 16px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;border:1px solid rgba(234, 161, 0,.2);background:#1e2a38;color:#FFF8EC;transition:background .2s;}
.eqd-btn:hover:not(:disabled){background:rgba(234, 161, 0,.1);}
.eqd-btn:disabled{opacity:.5;cursor:not-allowed;}
.eqd-btn.primary{background:#EAA100;border-color:#EAA100;color:#1a1300;font-weight:600;}
.eqd-btn.primary:hover:not(:disabled){filter:brightness(1.07);background:#EAA100;}
.eqd-btn.ghost{flex:0 0 auto;background:none;}
.eqd-notice{padding:14px 16px;border-radius:12px;border:1px solid;font-size:12px;font-weight:600;margin-bottom:16px;}
.eqd-notice.success{background:rgba(31,132,87,.1);border-color:rgba(31,132,87,.3);color:#5CB87D;}
.eqd-notice.danger{background:rgba(177,66,85,.1);border-color:rgba(177,66,85,.3);color:#F3A3A6;}
.eqd-validated{padding:14px 16px;border-radius:12px;border:1px solid rgba(31,132,87,.3);background:rgba(31,132,87,.1);color:#5CB87D;font-size:12px;font-weight:600;margin-bottom:16px;}
@media(max-width:640px){.eqd-grid{grid-template-columns:1fr;}.eqd-actionbar{flex-direction:column;}}
`;

export function EditDevisSection({ id }: { id: string }) {
  const { showToast } = useToast();
  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [reloadIndex, setReloadIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("tarif");
  const [lines, setLines] = useState<LineRow[]>([]);
  const [formStatus, setFormStatus] = useState("");
  const [formDeposit, setFormDeposit] = useState("");
  const [formBalance, setFormBalance] = useState("");
  const [depositPaid, setDepositPaid] = useState(false);
  const [balancePaid, setBalancePaid] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);
  const [confirmationDays, setConfirmationDays] = useState(7);
  const [generatingProforma, setGeneratingProforma] = useState(false);
  const [formDeliveryDate, setFormDeliveryDate] = useState("");

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setLoadError(null);
    setNotice(null);
    setQuote(null);
    setLines([]);
    setFormStatus("");
    setFormDeposit("");
    setFormBalance("");
    setDepositPaid(false);
    setBalancePaid(false);

    async function fetchQuote() {
      try {
        const response = await authAPI.get<QuoteRecord | { data?: QuoteRecord }>(`/quotes/${id}`);

        if (!active) {
          return;
        }

        // Le backend peut renvoyer soit { status, data: devis }, soit { data: devis },
        // soit le devis brut. fetchWithAuth normalise déjà, mais on reste défensif.
        const raw = response?.data as QuoteRecord | { data?: QuoteRecord } | null | undefined;
        const nextQuote = (raw && typeof raw === "object" && "data" in (raw as object)
          ? ((raw as { data?: QuoteRecord }).data as QuoteRecord | undefined)
          : (raw as QuoteRecord | undefined)) as QuoteRecord | undefined;

        if (!nextQuote || typeof nextQuote !== "object" || nextQuote.id === undefined) {
          throw new Error("Devis introuvable ou réponse API invalide.");
        }

        setQuote(nextQuote);
        setLines(buildLinesFromQuote(nextQuote));
        setFormStatus(normalizeText(nextQuote.status));
        setFormDeposit(normalizeText(nextQuote.deposit_amount));
        setFormBalance(normalizeText(nextQuote.balance_amount));
        setDepositPaid(nextQuote.deposit_paid === true || nextQuote.deposit_paid === 1 || (nextQuote.deposit_paid as unknown) === "1");
        setBalancePaid(nextQuote.balance_paid === true || nextQuote.balance_paid === 1 || (nextQuote.balance_paid as unknown) === "1");
        setFormDeliveryDate(normalizeText(nextQuote.date_livraison_prevue));
      } catch (fetchError) {
        if (!active) {
          return;
        }

        console.error("Chargement devis: échec technique.", fetchError);
        const message = fetchError instanceof Error && fetchError.message
          ? fetchError.message
          : "Impossible de charger ce devis pour le moment.";
        // Évite l'écran générique quand le backend dit précisément 404 / 403.
        setLoadError(
          /introuvable|not found|404/i.test(message)
            ? "Devis introuvable. Vérifiez la référence ou retournez à la liste."
            : message,
        );
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

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    for (const line of lines) {
      const lineSubtotal = (line.qty || 0) * (line.unitPrice || 0);
      subtotal += lineSubtotal;
      tax += lineSubtotal * ((line.tva || 0) / 100);
    }
    return { subtotal, tax, total: subtotal + tax };
  }, [lines]);

  function updateLine(lineId: string, key: "unitPrice" | "tva", value: number) {
    setLines((prev) => prev.map((line) => (line.id === lineId ? { ...line, [key]: value } : line)));
  }

  async function updateQuote() {
    const nextStatus = formStatus.trim();
    const nextTotal = Math.round(totals.total);
    const nextDeposit = normalizeText(formDeposit);
    const nextBalance = normalizeText(formBalance);

    const errors: string[] = [];
    if (!nextStatus) errors.push("Le statut est requis.");
    if (!(nextTotal > 0)) errors.push("Fixez au moins un prix unitaire — le total doit être supérieur à 0.");
    if (nextDeposit && (isNaN(Number(nextDeposit)) || Number(nextDeposit) < 0)) errors.push("L'acompte doit être un nombre positif.");
    if (nextBalance && (isNaN(Number(nextBalance)) || Number(nextBalance) < 0)) errors.push("Le solde doit être un nombre positif.");
    if (nextDeposit && Number(nextDeposit) > nextTotal) errors.push("L'acompte ne peut pas dépasser le montant total.");
    if (nextBalance && Number(nextBalance) > nextTotal) errors.push("Le solde ne peut pas dépasser le montant total.");

    if (errors.length > 0) {
      setNotice({ tone: "danger", message: errors.join(" ") });
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      await authAPI.put(`/quotes/${id}`, {
        status: nextStatus,
        amount: String(nextTotal),
        deposit_amount: nextDeposit,
        balance_amount: nextBalance,
        deposit_paid: depositPaid,
        balance_paid: balancePaid,
        date_livraison_prevue: formDeliveryDate || null,
      });

      setQuote((current) =>
        current
          ? {
              ...current,
              status: nextStatus,
              amount: String(nextTotal),
              deposit_amount: nextDeposit,
              balance_amount: nextBalance,
              deposit_paid: depositPaid,
              balance_paid: balancePaid,
            }
          : current,
      );
      setNotice({
        tone: "success",
        message: "Le devis et les tranches de paiement ont été mis à jour.",
      });
    } catch (error) {
      setNotice({
        tone: "danger",
        message: error instanceof Error ? error.message : "La mise à jour a échoué. Veuillez réessayer.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function notifyClient(alertType: string) {
    if (!alertType) return;

    setNotice(null);
    try {
      await authAPI.post(`/quotes/${id}/notify`, { type: alertType });
      showToast("Notification envoyée au client. Il sera prévenu même hors du site.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Impossible d'envoyer la notification.", "error");
    }
  }

  async function sendQuote() {
    if (!quote || isSaving || quote.status === "production") {
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      await authAPI.put(`/quotes/${id}`, { status: "sent", confirmation_days: confirmationDays });

      setQuote((current) => (current ? { ...current, status: "sent" } : current));
      setFormStatus("sent");
      setNotice({
        tone: "success",
        message: "Le devis a été envoyé au client.",
      });
    } catch (error) {
      setNotice({
        tone: "danger",
        message: error instanceof Error ? error.message : "L'envoi a échoué. Veuillez réessayer.",
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

    void updateQuote();
  }

  function quoteToQuoteDoc(q: QuoteRecord, rows?: LineRow[]): Omit<TextileDocumentProps, "kind"> {
    const amount = parseFloat(String(q.amount ?? "0"));
    const deposit = parseFloat(String(q.deposit_amount ?? "0"));
    const balance = parseFloat(String(q.balance_amount ?? "0"));
    const taxRate = 20;

    // Lignes issues de l'onglet Tarification (prix HT) — sinon repli sur les tranches.
    const docLines: DocumentLineItem[] = [];
    const pricedRows = (rows ?? []).filter((r) => r.designation.trim() && r.qty > 0 && r.unitPrice >= 0);
    if (pricedRows.length > 0) {
      for (const r of pricedRows) {
        docLines.push({
          description: r.designation.trim(),
          quantity: r.qty,
          unit: "pce",
          unitPrice: r.unitPrice,
          taxRate: r.tva,
          reference: r.detail ? r.detail.slice(0, 80) : undefined,
        });
      }
    } else {
      const subtotal = amount / (1 + taxRate / 100);
      if (deposit > 0) {
        docLines.push({
          description: "Acompte à la commande",
          quantity: 1,
          unit: "lot",
          unitPrice: deposit / (1 + taxRate / 100),
          taxRate,
          reference: "Tranche 1",
        });
      }
      if (balance > 0) {
        docLines.push({
          description: "Solde à livraison",
          quantity: 1,
          unit: "lot",
          unitPrice: balance / (1 + taxRate / 100),
          taxRate,
          reference: "Tranche 2",
        });
      }
      if (docLines.length === 0) {
        docLines.push({
          description: q.category ? `Prestation de confection — ${q.category}` : "Prestation de confection textile",
          quantity: parseQty(q.quantite),
          unit: "pce",
          unitPrice: subtotal,
          taxRate,
        });
      }
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
      lines: docLines,
      currency: "MGA",
      status: formatStatusLabel(q.status),
      notes: q.message ?? undefined,
      paymentTerms: deposit > 0 && balance > 0
        ? `Acompte de ${fmtAr(deposit)} · Solde de ${fmtAr(balance)} à livraison`
        : "Acompte de 50% à la commande, solde à la livraison",
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

  const handleGenerateProforma = async () => {
    if (!quote) return;
    setGeneratingProforma(true);
    setNotice(null);
    try {
      const res = await authAPI.post<{ data?: { id: string; number?: string }; id?: string; number?: string }>(`/proformas/from-quote/${id}`, {});
      const d = res.data as { data?: { id: string; number?: string }; id?: string; number?: string };
      const pid = d?.data?.id ?? d?.id;
      const pnum = d?.data?.number ?? d?.number ?? "";
      if (pid) {
        setNotice({ tone: "success", message: `Proforma ${pnum} générée.` });
        window.location.href = `/backoffice/proformas?id=${pid}`;
      } else {
        setNotice({ tone: "danger", message: "Proforma créée mais ID introuvable." });
      }
    } catch (e) {
      setNotice({ tone: "danger", message: e instanceof Error ? e.message : "Génération impossible (devis non chiffré ?)." });
    } finally {
      setGeneratingProforma(false);
    }
  };

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
    } catch (error) {
      setNotice({ tone: "danger", message: error instanceof Error ? error.message : "Erreur lors de la création de la commande" });
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 md:px-12 py-10 animate-pulse">
        <div className="h-8 w-64 bg-[#EAA100]/10 rounded mb-4"></div>
        <div className="h-4 w-96 bg-[#EAA100]/10 rounded mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-[#161D30] rounded-[2rem] border border-[#EAA100]/10"></div>
          <div className="h-64 bg-[#161D30] rounded-[2rem] border border-[#EAA100]/10"></div>
        </div>
      </div>
    );
  }

  if (loadError && !quote) {
    return (
      <div className="px-6 md:px-12 py-10 text-center">
        <span className="material-symbols-outlined text-[#F3A3A6] text-6xl mb-4">error</span>
        <h2 className="font-headline text-2xl text-[#EAA100] mb-2">{loadError}</h2>
        <button
          onClick={() => setReloadIndex(i => i + 1)}
          className="mt-6 px-8 py-3 bg-[#163526] text-white font-bold text-caption uppercase tracking-widest rounded-xl"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!quote) return null;

  const statusLabel = formatStatusLabel(quote.status);
  const statusOptions = buildStatusOptions(quote.status);
  const isClientValidated = quote.status === "accepted" || quote.status === "production";
  // Aperçu en direct : même document A4 qu'avant, avec le total issu de la tarification.
  const previewQuote: QuoteRecord = {
    ...quote,
    amount: String(Math.round(totals.total)),
    deposit_amount: formDeposit,
    balance_amount: formBalance,
  };
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "tarif", label: "Tarification" },
    { id: "client", label: "Client" },
    { id: "statut", label: "Statut & suivi" },
    { id: "apercu", label: "Aperçu du devis" },
  ];

  return (
    <div className="px-6 md:px-12 py-10">
      <style>{scopedStyles}</style>
      <div className="eqd-page">
        <Link href="/backoffice/devis" className="eqd-crumb">
          <span aria-hidden="true">←</span> Retour aux devis
        </Link>

        <div className="eqd-head">
          <div>
            <h1>Modifier le devis</h1>
            <div className="ref">Référence #{String(quote.id).slice(0, 8).toUpperCase()} · {quote.name || "Client sans nom"}</div>
          </div>
          <span className="eqd-badge">{statusLabel}</span>
        </div>

        {notice && (
          <div className={`eqd-notice ${notice.tone}`}>
            {notice.message}
          </div>
        )}

        {isClientValidated ? (
          <div className="eqd-validated">
            Le client a validé et signé cette version. Toute correction ou ajout passe par une nouvelle version signée.
          </div>
        ) : null}

        <div className="eqd-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`eqd-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Onglet Tarification */}
          <div className={`eqd-panel${activeTab === "tarif" ? " active" : ""}`} role="tabpanel">
            <div className="eqd-card">
              <div className="eqd-client-msg-label">Demande du client — pour référence, non modifiable ici</div>
              <div className="eqd-client-msg">
                {quote.message || "Aucun message fourni par le client."}
              </div>
            </div>

            <div className="eqd-card">
              <h2>Lignes du devis</h2>
              <p className="card-sub">Désignation et quantité proviennent de la demande du client (verrouillées). Fixez uniquement le prix unitaire et la TVA — le total se calcule automatiquement.</p>

              <div className="eqd-table-wrap">
                <table className="eqd-lines">
                  <thead>
                    <tr>
                      <th>Désignation (demande client)</th>
                      <th className="eqd-col-qty">Qté</th>
                      <th className="eqd-col-price">Prix unit. (Ar)</th>
                      <th className="eqd-col-tva">TVA</th>
                      <th className="eqd-col-total">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.id}>
                        <td className="eqd-locked">
                          {line.designation}
                          {line.detail ? <span className="sub">{line.detail}</span> : null}
                        </td>
                        <td className="eqd-col-qty eqd-locked">{line.qty}</td>
                        <td className="eqd-col-price">
                          <input
                            type="number"
                            min={0}
                            value={Number.isFinite(line.unitPrice) ? line.unitPrice : 0}
                            onChange={(e) => updateLine(line.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            disabled={isSaving}
                            aria-label={`Prix unitaire — ${line.designation}`}
                          />
                        </td>
                        <td className="eqd-col-tva">
                          <select
                            value={line.tva}
                            onChange={(e) => updateLine(line.id, "tva", Number(e.target.value))}
                            disabled={isSaving}
                            aria-label={`TVA — ${line.designation}`}
                          >
                            {TVA_OPTIONS.map((v) => (
                              <option key={v} value={v}>{v}%</option>
                            ))}
                          </select>
                        </td>
                        <td className="eqd-col-total">{fmtAr(line.qty * line.unitPrice * (1 + line.tva / 100))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="eqd-totals">
                <div className="eqd-totals-box">
                  <div className="eqd-totals-row"><span>Sous-total</span><span>{fmtAr(totals.subtotal)}</span></div>
                  <div className="eqd-totals-row"><span>Taxes</span><span>{fmtAr(totals.tax)}</span></div>
                  <div className="eqd-totals-row grand"><span>Total</span><span>{fmtAr(totals.total)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Onglet Client */}
          <div className={`eqd-panel${activeTab === "client" ? " active" : ""}`} role="tabpanel">
            <div className="eqd-card">
              <h2>Coordonnées du client</h2>
              <p className="card-sub">Informations transmises par le client lors de sa demande — non modifiables ici.</p>
              <div className="eqd-grid">
                <div className="eqd-field">
                  <label>Nom</label>
                  <div className="eqd-readonly">{quote.name || "—"}</div>
                </div>
                <div className="eqd-field">
                  <label>Téléphone</label>
                  <div className="eqd-readonly">{quote.phone || "—"}</div>
                </div>
                <div className="eqd-field full">
                  <label>E-mail</label>
                  <div className="eqd-readonly">{quote.email || "—"}</div>
                </div>
                <div className="eqd-field full">
                  <label>Message complet du client</label>
                  <div className="eqd-readonly" style={{ whiteSpace: "pre-wrap" }}>{quote.message || "—"}</div>
                </div>
              </div>
            </div>

            <div className="eqd-card">
              <h2>Documents & pièces jointes</h2>
              <p className="card-sub">Fichiers liés à ce dossier.</p>
              <AttachmentUploader entityType="cotation" entityId={id} />
            </div>
          </div>

          {/* Onglet Statut & suivi */}
          <div className={`eqd-panel${activeTab === "statut" ? " active" : ""}`} role="tabpanel">
            <div className="eqd-card">
              <h2>Suivi des tranches de paiement</h2>
              <p className="card-sub">Montants en Ariary. L&apos;acompte et le solde ne peuvent pas dépasser le total ({fmtAr(totals.total)}). Le passage à « Payé » doit venir de la vérification de la preuve image/PDF (page Paiements) — ne cochez manuellement qu&apos;en cas d&apos;exception.</p>
              <div className="eqd-grid">
                <div className="eqd-field">
                  <label>Acompte (Ar)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(e.target.value)}
                    placeholder="Montant acompte"
                    disabled={isSaving}
                  />
                  <label className="eqd-checkline">
                    <input
                      type="checkbox"
                      checked={depositPaid}
                      onChange={(e) => setDepositPaid(e.target.checked)}
                    />
                    Payé (acompte)
                  </label>
                </div>
                <div className="eqd-field">
                  <label>Solde (Ar)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formBalance}
                    onChange={(e) => setFormBalance(e.target.value)}
                    placeholder="Montant solde"
                    disabled={isSaving}
                  />
                  <label className="eqd-checkline">
                    <input
                      type="checkbox"
                      checked={balancePaid}
                      onChange={(e) => setBalancePaid(e.target.checked)}
                    />
                    Payé (solde)
                  </label>
                </div>
                <div className="eqd-field">
                  <label>Statut du dossier</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    disabled={isSaving}
                  >
                    <option value="">Choisir un statut</option>
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="eqd-field">
                  <label>Date de livraison prévue</label>
                  <input
                    type="date"
                    value={formDeliveryDate}
                    onChange={(e) => setFormDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    disabled={isSaving}
                  />
                </div>
                {quote.status !== "sent" && quote.status !== "production" && (
                  <div className="eqd-field">
                    <label>Délai de confirmation (jours)</label>
                    <select
                      value={confirmationDays}
                      onChange={(e) => setConfirmationDays(Number(e.target.value))}
                      disabled={isSaving}
                    >
                      <option value={3}>3 jours</option>
                      <option value={5}>5 jours</option>
                      <option value={7}>7 jours</option>
                      <option value={10}>10 jours</option>
                      <option value={14}>14 jours</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="eqd-card">
              <h2>Notifier le client</h2>
              <p className="card-sub">Le client sera prévenu même hors du site.</p>
              <div className="eqd-grid">
                <div className="eqd-field full">
                  <label>Type d&apos;alerte</label>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        void notifyClient(value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">Sélectionner un type d&apos;alerte…</option>
                    <option value="delay">Retard de production</option>
                    <option value="error">Erreur de conception / technique</option>
                    <option value="ready">Prêt pour livraison</option>
                    <option value="info">Besoin d&apos;informations complémentaires</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="eqd-card">
              <h2>Problèmes & sous-problèmes</h2>
              <p className="card-sub">Zone secondaire, réservée à la gestion de litiges ou blocages sur ce dossier.</p>
              <ProblemHierarchyPanel
                className="space-y-4"
                mode="admin"
                problems={TEXTILE_PROBLEM_THREADS}
                theme="light"
              />
            </div>

            {quote.status === "accepted" && (
              <div className="eqd-card">
                <h2>Production & commande</h2>
                <p className="card-sub">Devis accepté par le client — lancez la production ou créez la commande.</p>
                <div className="eqd-grid">
                  <div className="eqd-field">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await authAPI.put(`/quotes/${id}`, { status: "production" });
                          setQuote((c) => c ? { ...c, status: "production" } : c);
                          setFormStatus("production");
                          setNotice({ tone: "success", message: "Production lancée — statut mis à jour." });
                        } catch {
                          setNotice({ tone: "danger", message: "Impossible de lancer la production." });
                        }
                      }}
                      className="eqd-btn"
                    >
                      Lancer la production
                    </button>
                  </div>
                  <div className="eqd-field">
                    <button
                      type="button"
                      onClick={handleCreateOrder}
                      className="eqd-btn"
                    >
                      <ShoppingCart className="h-4 w-4" style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
                      Créer la commande
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Onglet Aperçu — même document A4 qu'avant, inchangé */}
          <div className={`eqd-panel${activeTab === "apercu" ? " active" : ""}`} role="tabpanel">
            <div className="eqd-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2>Aperçu du document A4</h2>
                  <p className="card-sub">Généré à partir des lignes saisies dans l&apos;onglet Tarification.</p>
                </div>
                <Link
                  href={`/backoffice/devis/proforma?id=${quote.id}`}
                  className="eqd-btn ghost"
                  style={{ textDecoration: "none", fontSize: 12, padding: "9px 14px", flex: "0 0 auto" }}
                >
                  Aperçu rapide →
                </Link>
                <button
                  type="button"
                  className="eqd-btn"
                  style={{ fontSize: 12, padding: "9px 14px", flex: "0 0 auto" }}
                  disabled={generatingProforma}
                  onClick={handleGenerateProforma}
                >
                  {generatingProforma ? "Génération…" : "Générer la proforma PRO →"}
                </button>
              </div>
              <TextileDocument kind="quote" {...quoteToQuoteDoc(previewQuote, lines)} />
              <div className="print:hidden max-w-[210mm] mx-auto" style={{ marginTop: 24 }}>
                {savingSignature ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#EAA100]/30 bg-[#fffdf8] p-6 text-[#172d42] shadow-sm">
                    <Loader className="h-4 w-4 animate-spin text-[#EAA100]" />
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
            </div>
          </div>

          <div className="eqd-actionbar">
            <button type="submit" className="eqd-btn" disabled={isSaving}>
              {isSaving ? "Sauvegarde en cours..." : "Enregistrer"}
            </button>
            <button
              type="button"
              className="eqd-btn primary"
              onClick={sendQuote}
              disabled={isSaving || quote.status === "sent" || quote.status === "production"}
            >
              {quote.status === "production"
                ? "Déjà en production"
                : quote.status === "sent"
                  ? "Déjà envoyé"
                  : "Envoyer le devis au client"}
            </button>
            <button type="button" className="eqd-btn ghost" onClick={() => window.print()}>
              <Printer className="h-4 w-4" style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
              Imprimer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
