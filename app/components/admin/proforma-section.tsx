"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { authAPI } from "@/app/lib";
import { TextileDocument } from "@/app/components/documents";
import type { DocumentLineItem, TextileDocumentProps } from "@/app/components/documents/types";

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
  created_at?: string;
  request_type?: string | null;
  admin_signature_name?: string | null;
  admin_signature_at?: string | null;
  date_livraison_prevue?: string | null;
};

function formatStatusLabel(status?: string | null) {
  switch ((status ?? "").trim()) {
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
      return (status ?? "").trim() || "Inconnu";
  }
}

function toNumber(value?: string | number | null) {
  const n = Number(String(value ?? "0").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function parseQty(raw?: string | number | null) {
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function quoteToProforma(q: QuoteRecord): Omit<TextileDocumentProps, "kind"> {
  const taxRate = 20;
  const qty = parseQty(q.quantite);
  const amountTTC = toNumber(q.amount);
  const deposit = toNumber(q.deposit_amount);
  const balance = toNumber(q.balance_amount);
  const unitHT = amountTTC > 0 && qty > 0 ? amountTTC / (1 + taxRate / 100) / qty : 0;

  const lines: DocumentLineItem[] = [
    {
      description: q.category ? `Confection textile — ${q.category}` : "Prestation de confection textile",
      quantity: qty,
      unit: "pce",
      unitPrice: unitHT,
      taxRate,
      reference: q.message ? q.message.slice(0, 80) : undefined,
    },
  ];

  const now = new Date();
  const validUntil = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();

  return {
    number: `PRO-${String(q.id).slice(0, 8).toUpperCase()}`,
    issuedAt: now.toISOString(),
    validUntil,
    orderReference: `DEV-${String(q.id).slice(0, 8).toUpperCase()}`,
    client: {
      name: q.name ?? "Client",
      email: q.email ?? undefined,
      phone: q.phone ?? undefined,
      address: q.message ? `Projet : ${q.message.slice(0, 120)}` : undefined,
    },
    lines,
    currency: "MGA",
    status: formatStatusLabel(q.status),
    notes: q.message ?? undefined,
    paymentTerms:
      deposit > 0 || balance > 0
        ? `Acompte de ${Math.round(deposit).toLocaleString("fr-FR")} Ar à la commande${balance > 0 ? ` · Solde de ${Math.round(balance).toLocaleString("fr-FR")} Ar à la livraison` : ""}`
        : "Paiement selon conditions du devis",
    signature:
      q.admin_signature_name && q.admin_signature_at
        ? { name: q.admin_signature_name, signedAt: q.admin_signature_at }
        : undefined,
  };
}

export function ProformaSection({ id }: { id: string }) {
  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);

    async function fetchQuote() {
      try {
        const response = await authAPI.get<QuoteRecord | { data?: QuoteRecord }>(`/quotes/${id}`);
        if (!active) return;
        const raw = response?.data as QuoteRecord | { data?: QuoteRecord } | null | undefined;
        const nextQuote = (raw && typeof raw === "object" && "data" in (raw as object)
          ? ((raw as { data?: QuoteRecord }).data as QuoteRecord | undefined)
          : (raw as QuoteRecord | undefined)) as QuoteRecord | undefined;
        if (!nextQuote || typeof nextQuote !== "object" || nextQuote.id === undefined) {
          throw new Error("Devis introuvable ou réponse API invalide.");
        }
        setQuote(nextQuote);
      } catch (fetchError) {
        if (!active) return;
        const message = fetchError instanceof Error && fetchError.message ? fetchError.message : "Impossible de charger ce devis.";
        setLoadError(/introuvable|not found|404/i.test(message) ? "Devis introuvable. Vérifiez la référence." : message);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void fetchQuote();
    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="px-6 md:px-12 py-10 animate-pulse">
        <div className="h-8 w-64 bg-[#EAA100]/10 rounded mb-4"></div>
        <div className="h-96 bg-[#25303a] rounded-[2rem] border border-[#EAA100]/10"></div>
      </div>
    );
  }

  if (loadError || !quote) {
    return (
      <div className="px-6 md:px-12 py-10 text-center">
        <h2 className="font-headline text-2xl text-[#EAA100] mb-4">{loadError ?? "Devis introuvable."}</h2>
        <Link href="/backoffice/devis" className="text-sm text-[#EAA100]/60 underline">← Retour aux devis</Link>
      </div>
    );
  }

  const chiffré = toNumber(quote.amount) > 0;

  return (
    <div className="px-6 md:px-12 py-10">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link
          href={`/backoffice/devis/edit?id=${quote.id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(234, 161, 0,.4)", marginBottom: 14, textDecoration: "none" }}
        >
          <span aria-hidden="true">←</span> Retour au devis
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px", color: "#f3e9d6" }}>Facture proforma</h1>
            <div style={{ fontSize: 13, color: "#9aa7b4" }}>
              Proforma PRO-{String(quote.id).slice(0, 8).toUpperCase()} · Devis DEV-{String(quote.id).slice(0, 8).toUpperCase()} · {quote.name || "Client sans nom"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="print:hidden"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 12, border: "1px solid rgba(234, 161, 0,.2)", background: "#25303a", padding: "10px 20px", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#EAA100", cursor: "pointer" }}
          >
            <Printer style={{ height: 16, width: 16 }} /> Imprimer
          </button>
        </div>

        {!chiffré ? (
          <div style={{ background: "#25303a", border: "1px solid rgba(234, 161, 0,.1)", borderRadius: 12, padding: "32px 24px", textAlign: "center", color: "#9aa7b4", fontSize: 14 }}>
            Devis non chiffré — la proforma sera disponible une fois le devis chiffré par l&apos;atelier (onglet Tarification).
          </div>
        ) : (
          <TextileDocument kind="proforma" {...quoteToProforma(quote)} />
        )}
      </div>
    </div>
  );
}
