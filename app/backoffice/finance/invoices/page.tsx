"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI, type QuoteRecord } from "@/app/lib/api";
import { Receipt, Loader, X, Printer, FileText } from "lucide-react";
import { TextileDocument, AdminSignaturePanel } from "@/app/components/documents";
import type { DocumentSignature, DocumentLineItem, TextileDocumentProps } from "@/app/components/documents/types";

function quoteToInvoiceDoc(q: QuoteRecord): Omit<TextileDocumentProps, "kind"> {
  const amount = parseFloat(String(q.amount ?? "0"));
  const taxRate = 20;
  const subtotal = amount / (1 + taxRate / 100);

  const lines: DocumentLineItem[] = [
    {
      description: q.message ? `Prestation textile — ${q.message.slice(0, 80)}` : "Prestation de confection textile",
      quantity: 1,
      unit: "lot",
      unitPrice: subtotal,
      taxRate,
      reference: q.request_type ?? "",
    },
  ];

  const statusLabel = q.balance_paid ? "Payée" : q.deposit_paid ? "En attente" : "Envoyée";

  return {
    number: `FACT-${String(q.id).slice(0, 8).toUpperCase()}`,
    issuedAt: q.created_at ?? new Date().toISOString(),
    client: {
      name: q.name ?? "Client",
      email: q.email,
      phone: q.phone,
      address: q.message ? `Projet : ${q.message.slice(0, 120)}` : undefined,
    },
    lines,
    currency: "EUR",
    status: statusLabel,
    paymentTerms: q.deposit_paid ? "Acompte perçu — Solde dû à livraison" : "Paiement à 30 jours",
    notes: q.message ?? undefined,
    signature: q.admin_signature_name && q.admin_signature_at
      ? { name: q.admin_signature_name, signedAt: q.admin_signature_at }
      : undefined,
  };
}

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | number | null>(searchParams.get("id"));
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">((searchParams.get("filter") as "all" | "paid" | "unpaid") || "all");
  const [savingSignature, setSavingSignature] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const res = await authAPI.get<QuoteRecord[]>("/quotes");
      setQuotes(Array.isArray(res.data) ? res.data : []);
    } catch {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onFilterChange = useCallback((f: "all" | "paid" | "unpaid") => {
    setFilter(f);
    const params = new URLSearchParams(searchParams.toString());
    if (f !== "all") params.set("filter", f);
    else params.delete("filter");
    params.delete("id");
    router.replace(`?${params.toString()}`, { scroll: false });
    setSelectedId(null);
  }, [router, searchParams]);

  const selectInvoice = (id: string | number | null) => {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("id", String(id));
    else params.delete("id");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const invoices = quotes.map((q) => ({
    id: q.id,
    ref: `FACT-${String(q.id).slice(0, 8).toUpperCase()}`,
    client: q.name || q.email || "Inconnu",
    amount: parseFloat(String(q.amount ?? "0")),
    status: q.balance_paid ? "paid" : q.deposit_paid ? "partial" : "unpaid",
    issuedAt: q.created_at,
    quote: q,
  }));

  const filtered = invoices.filter((inv) => {
    if (filter === "paid") return inv.status === "paid";
    if (filter === "unpaid") return inv.status === "unpaid" || inv.status === "partial";
    return true;
  });

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalUnpaid = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount, 0);

  const selected = invoices.find((i) => String(i.id) === String(selectedId)) ?? null;

  const handleApprove = async (signature: DocumentSignature) => {
    if (!selected) return;
    setSavingSignature(true);
    try {
      await authAPI.signQuote(selected.id, signature);
      await loadAll();
    } finally {
      setSavingSignature(false);
    }
  };

  const printSelected = () => window.print();

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-[#e5ad46]" />
        <h1 className="font-headline text-2xl text-[#e5ad46]">Factures</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-[#25303a] p-4 border border-green-500/20">
          <p className="text-xs text-green-400 uppercase tracking-widest font-bold">Payées</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{totalPaid.toFixed(2)} €</p>
        </div>
        <div className="rounded-xl bg-[#25303a] p-4 border border-red-500/20">
          <p className="text-xs text-red-400 uppercase tracking-widest font-bold">Impayées</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{totalUnpaid.toFixed(2)} €</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "paid", "unpaid"] as const).map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
              filter === f ? "bg-[#e5ad46] text-[#1e2a38]" : "bg-[#25303a] text-[#eccc90]/60 hover:bg-[#e5ad46]/10"
            }`}
          >
            {f === "all" ? "Toutes" : f === "paid" ? "Payées" : "Impayées"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader className="h-5 w-5 animate-spin text-[#e5ad46]" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#eccc90]/50">Aucune facture.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <button
              key={String(inv.id)}
              onClick={() => selectInvoice(selectedId === inv.id ? null : inv.id)}
              className="w-full text-left rounded-xl bg-[#25303a] p-4 border border-[#e5ad46]/10 hover:border-[#e5ad46]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-[#e5ad46]/60 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#eccc90] truncate">{inv.ref}</p>
                    <p className="text-xs text-[#eccc90]/50 truncate">{inv.client}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className={`font-bold ${inv.status === "paid" ? "text-green-400" : "text-yellow-400"}`}>{inv.amount.toFixed(2)} €</p>
                  <p className="text-[9px] uppercase tracking-widest text-[#eccc90]/40 mt-0.5">
                    {inv.status === "paid" ? "Payée" : inv.status === "partial" ? "Partielle" : "En attente"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0b1320]/70 p-0 sm:p-6 backdrop-blur-sm print:static print:bg-transparent print:p-0 print:backdrop-blur-0"
          role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) selectInvoice(null); }}
        >
          <div className="relative w-full max-w-[920px] max-h-[96vh] overflow-y-auto bg-transparent sm:rounded-2xl print:max-h-none print:overflow-visible">
            <div className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-[#1e2a38]/95 px-4 py-3 sm:px-6 sm:py-4 backdrop-blur border-b border-[#e5ad46]/15 print:hidden">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.22em] text-[#eccc90]/45">Facture ouverte</p>
                <h2 className="font-headline text-lg text-[#eccc90]">{selected.ref}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={printSelected}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e5ad46]/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#eccc90] hover:bg-[#e5ad46]/15 transition"
                >
                  <Printer className="h-4 w-4" /> Imprimer
                </button>
                <button
                  type="button"
                  onClick={() => selectInvoice(null)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#eccc90]/15 text-[#eccc90]/60 hover:bg-[#eccc90]/10 hover:text-[#eccc90] transition"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-0 py-4 sm:px-2 sm:py-6 print:px-0 print:py-0">
              <TextileDocument kind="invoice" {...quoteToInvoiceDoc(selected.quote)} />

              <div className="px-4 sm:px-6 mt-6 print:hidden max-w-[210mm] mx-auto">
                {savingSignature ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-[#e5ad46]/30 bg-[#fffdf8] p-5 text-[#172d42]">
                    <Loader className="h-4 w-4 animate-spin text-[#e5ad46]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Enregistrement de la signature…</span>
                  </div>
                ) : (
                  <AdminSignaturePanel
                    initialSignature={
                      selected.quote.admin_signature_name && selected.quote.admin_signature_at
                        ? { name: selected.quote.admin_signature_name, signedAt: selected.quote.admin_signature_at }
                        : undefined
                    }
                    onApprove={handleApprove}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
