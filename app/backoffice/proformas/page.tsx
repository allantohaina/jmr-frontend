"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Loader2, Plus, Printer, Search, Trash2, X, PenLine, Receipt } from "lucide-react";
import { authAPI, type QuoteRecord } from "@/app/lib/api";
import {
  PROFORMA_STATUSES, formatMoney, proformaAPI, proformaStatusLabel,
  type ProformaInput, type ProformaRecord,
} from "@/app/lib/proforma";
import { ProformaPaper } from "@/app/components/admin/proforma-paper";
import { ProformaEditor } from "@/app/components/admin/proforma-editor";
import { TextileDocument, AdminSignaturePanel } from "@/app/components/documents";
import type { DocumentLineItem } from "@/app/components/documents/types";

function proformaToInvoiceLines(p: ProformaRecord): DocumentLineItem[] {
  return p.lines.map((l) => ({
    description: l.description,
    quantity: l.quantity,
    unit: l.unit || "pce",
    unitPrice: l.unitPrice,
    taxRate: l.taxRate ?? p.tax_rate,
    reference: l.detail || undefined,
  }));
}

function ProformasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<ProformaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") ?? "all");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("id"));
  const [mode, setMode] = useState<"view" | "edit" | "new">(searchParams.get("id") ? "view" : "view");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [showFromQuote, setShowFromQuote] = useState(false);
  const [fromQuoteId, setFromQuoteId] = useState("");
  const [fromQuoteBusy, setFromQuoteBusy] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const data = await proformaAPI.list({ status: filter, search: search || undefined });
      setRows(data);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Impossible de charger les proformas.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { void load(); }, [load]);

  const syncUrl = useCallback((id: string | null, m: "view" | "edit" | "new" | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("id", id); else params.delete("id");
    if (m === "edit") params.set("mode", "edit"); else params.delete("mode");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const openRow = (id: string, m: "view" | "edit" = "view") => {
    setSelectedId(id); setMode(m); setShowNew(false); setInvoicePreview(false);
    syncUrl(id, m === "edit" ? "edit" : null);
  };
  const closePanel = () => {
    setSelectedId(null); setMode("view"); setShowNew(false); setInvoicePreview(false);
    syncUrl(null, null);
  };

  const selected: ProformaRecord | null = useMemo(
    () => rows.find((r) => String(r.id) === String(selectedId)) ?? null,
    [rows, selectedId]
  );

  const totals = useMemo(() => {
    const sum = rows.reduce((s, r) => s + Number(r.total ?? 0), 0);
    const open = rows.filter((r) => !["accepted", "converted"].includes(r.status)).reduce((s, r) => s + Number(r.total ?? 0), 0);
    return { sum, open, count: rows.length };
  }, [rows]);

  const openQuotes = useCallback(async () => {
    setShowFromQuote(true);
    try {
      const res = await authAPI.get<QuoteRecord[] | { data?: QuoteRecord[] }>("/quotes");
      const d = res.data as QuoteRecord[] | { data?: QuoteRecord[] };
      const list = Array.isArray(d) ? d : (d?.data ?? []);
      setQuotes(list.filter((q) => Number(q.amount ?? 0) > 0));
    } catch { setQuotes([]); }
  }, []);

  const handleCreate = async (input: ProformaInput) => {
    setSaving(true); setFormError(null);
    try {
      const created = await proformaAPI.create(input);
      setRows((p) => [created, ...p]);
      setShowNew(false);
      openRow(created.id, "view");
      setActionMsg(`Proforma ${created.number} créée.`);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Création impossible.");
    } finally { setSaving(false); }
  };

  const handleUpdate = async (input: ProformaInput) => {
    if (!selected) return;
    setSaving(true); setFormError(null);
    try {
      const updated = await proformaAPI.update(selected.id, input);
      setRows((p) => p.map((r) => (r.id === updated.id ? updated : r)));
      setMode("view"); syncUrl(selected.id, null);
      setActionMsg(`Proforma ${updated.number} mise à jour.`);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Mise à jour impossible.");
    } finally { setSaving(false); }
  };

  const setStatus = async (id: string, status: ProformaRecord["status"]) => {
    try {
      const updated = await proformaAPI.update(id, { status } as Partial<ProformaInput>);
      setRows((p) => p.map((r) => (r.id === updated.id ? updated : r)));
      setActionMsg(`Proforma ${updated.number} → ${proformaStatusLabel(status)}.`);
      if (status === "converted") setInvoicePreview(true);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Changement de statut impossible.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette proforma ? Irréversible.")) return;
    try {
      await proformaAPI.remove(id);
      setRows((p) => p.filter((r) => r.id !== id));
      if (selectedId === id) closePanel();
      setActionMsg("Proforma supprimée.");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Suppression impossible.");
    }
  };

  const handleFromQuote = async () => {
    if (!fromQuoteId) return;
    setFromQuoteBusy(true); setActionError(null);
    try {
      const created = await proformaAPI.fromQuote(fromQuoteId);
      setRows((p) => [created, ...p.filter((r) => r.id !== created.id)]);
      setShowFromQuote(false); setFromQuoteId("");
      openRow(created.id, "view");
      setActionMsg(`Proforma ${created.number} générée depuis le devis.`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Génération impossible (devis non chiffré ?).");
    } finally { setFromQuoteBusy(false); }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl text-[#FFB31B]">Factures proforma</h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFB31B]/40">
            {totals.count} document{totals.count > 1 ? "s" : ""} · {formatMoney(totals.sum, "MGA")} au total
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={openQuotes} className="pf-btn ghost">Depuis un devis</button>
          <button type="button" onClick={() => { setShowNew(true); setSelectedId(null); }} className="pf-btn">
            <Plus className="h-4 w-4" /> Nouvelle proforma
          </button>
        </div>
      </div>

      {actionMsg ? <div className="pf-note ok" onClick={() => setActionMsg(null)}>{actionMsg}</div> : null}
      {actionError ? <div className="pf-note err" onClick={() => setActionError(null)}>{actionError}</div> : null}

      <div className="flex gap-2 flex-wrap items-center">
        {PROFORMA_STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`pf-chip ${filter === s.key ? "active" : ""}`}
          >
            {s.label}
          </button>
        ))}
        <label className="pf-search">
          <Search className="h-4 w-4" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="N°, client, email…" />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-[#FFB31B]" /></div>
      ) : rows.length === 0 ? (
        <div className="pf-empty">
          <FileText className="mx-auto mb-3 h-8 w-8 text-[#FFB31B]/20" />
          <p>Aucune proforma. Créez-en une ou générez-la depuis un devis chiffré.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <button key={r.id} onClick={() => openRow(r.id)} className="pf-row">
              <div className="min-w-0">
                <p className="font-bold text-[#FFB31B]">{r.number}</p>
                <p className="text-xs text-[#FFB31B]/55 truncate">{r.client_name} · {r.client_email || "—"}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="font-bold text-[#FFB31B]">{formatMoney(Number(r.total ?? 0), r.currency)}</p>
                <p className="pf-status">{proformaStatusLabel(r.status)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Création */}
      {showNew ? (
        <div className="pf-modal" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div className="pf-sheet">
            <div className="pf-sheet-head">
              <div><p className="pf-kicker">Nouvelle proforma</p><h2>Numérotation auto PRO-AAAA-XXXX</h2></div>
              <button type="button" onClick={() => setShowNew(false)} aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <ProformaEditor saving={saving} error={formError} onSubmit={handleCreate} onCancel={() => setShowNew(false)} />
          </div>
        </div>
      ) : null}

      {/* Depuis devis */}
      {showFromQuote ? (
        <div className="pf-modal" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowFromQuote(false); }}>
          <div className="pf-sheet small">
            <div className="pf-sheet-head">
              <div><p className="pf-kicker">Générer depuis un devis</p><h2>Devis chiffrés uniquement</h2></div>
              <button type="button" onClick={() => setShowFromQuote(false)} aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <select value={fromQuoteId} onChange={(e) => setFromQuoteId(e.target.value)} className="pf-select">
              <option value="">— Choisir un devis —</option>
              {quotes.map((q) => (
                <option key={String(q.id)} value={String(q.id)}>
                  {(q.titre || q.name || "Devis").slice(0, 40)} · {Number(q.amount ?? 0).toLocaleString("fr-FR")} Ar · {q.email || ""}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="pf-btn ghost" onClick={() => setShowFromQuote(false)}>Annuler</button>
              <button type="button" className="pf-btn" disabled={!fromQuoteId || fromQuoteBusy} onClick={handleFromQuote}>
                {fromQuoteBusy ? "Génération…" : "Générer la proforma"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Détail */}
      {selected ? (
        <div className="pf-modal" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) closePanel(); }}>
          <div className="pf-sheet wide">
            <div className="pf-sheet-head print:hidden">
              <div>
                <p className="pf-kicker">{selected.number}</p>
                <h2>{selected.client_name} · {formatMoney(Number(selected.total ?? 0), selected.currency)}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => window.print()} className="pf-btn ghost"><Printer className="h-4 w-4" /> Imprimer / PDF</button>
                <button type="button" onClick={() => closePanel()} aria-label="Fermer" className="pf-icon"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="pf-toolbar print:hidden">
              <button type="button" onClick={() => { setMode(mode === "edit" ? "view" : "edit"); syncUrl(selected.id, mode === "edit" ? null : "edit"); }} className="pf-btn ghost">
                <PenLine className="h-4 w-4" /> {mode === "edit" ? "Voir le document" : "Modifier"}
              </button>
              {selected.status === "draft" ? <button type="button" onClick={() => setStatus(selected.id, "sent")} className="pf-btn ghost">Marquer envoyée</button> : null}
              {selected.status === "sent" ? (
                <>
                  <button type="button" onClick={() => setStatus(selected.id, "accepted")} className="pf-btn ghost">Acceptée</button>
                  <button type="button" onClick={() => setStatus(selected.id, "rejected")} className="pf-btn ghost danger">Refusée</button>
                </>
              ) : null}
              {selected.status === "accepted" ? (
                <button type="button" onClick={() => setStatus(selected.id, "converted")} className="pf-btn">
                  <Receipt className="h-4 w-4" /> Convertir en facture
                </button>
              ) : null}
              <button type="button" onClick={() => handleDelete(selected.id)} className="pf-icon danger" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
            </div>

            {mode === "edit" ? (
              <div className="print:hidden">
                <ProformaEditor initial={selected} saving={saving} error={formError} onSubmit={handleUpdate} onCancel={() => { setMode("view"); syncUrl(selected.id, null); }} />
              </div>
            ) : invoicePreview || selected.status === "converted" ? (
              <div>
                <div className="pf-note ok print:hidden">Vue facture générée depuis {selected.number} — imprimez ou exportez en PDF.</div>
                <TextileDocument
                  kind="invoice"
                  number={selected.number.replace(/^PRO-/, "FACT-")}
                  issuedAt={selected.issue_date || selected.created_at || new Date().toISOString()}
                  client={{ name: selected.client_name, email: selected.client_email || undefined, phone: selected.client_phone || undefined, address: selected.client_address || undefined, taxId: selected.client_tax_id || undefined }}
                  lines={proformaToInvoiceLines(selected)}
                  currency={selected.currency}
                  status="Facture"
                  orderReference={selected.order_reference || undefined}
                  deliveryAddress={selected.delivery_address || undefined}
                  notes={selected.notes || undefined}
                  paymentTerms={selected.payment_terms || undefined}
                  signature={selected.admin_signature_name && selected.admin_signature_at ? { name: selected.admin_signature_name, signedAt: selected.admin_signature_at } : undefined}
                />
                <div className="print:hidden mt-4 max-w-[210mm] mx-auto">
                  <AdminSignaturePanel
                    initialSignature={selected.admin_signature_name && selected.admin_signature_at ? { name: selected.admin_signature_name, signedAt: selected.admin_signature_at } : undefined}
                    onApprove={async (sig) => {
                      const updated = await proformaAPI.sign(selected.id, { admin_signature_name: sig.name, admin_signature_at: new Date(sig.signedAt).toISOString().slice(0, 19).replace("T", " ") });
                      setRows((p) => p.map((r) => (r.id === updated.id ? updated : r)));
                    }}
                  />
                  <button type="button" className="pf-btn ghost mt-3" onClick={() => setInvoicePreview(false)}>← Retour à la proforma</button>
                </div>
              </div>
            ) : (
              <div>
                <ProformaPaper proforma={selected} />
                <div className="print:hidden mt-4 max-w-[210mm] mx-auto">
                  <AdminSignaturePanel
                    initialSignature={selected.admin_signature_name && selected.admin_signature_at ? { name: selected.admin_signature_name, signedAt: selected.admin_signature_at } : undefined}
                    onApprove={async (sig) => {
                      const updated = await proformaAPI.sign(selected.id, { admin_signature_name: sig.name, admin_signature_at: new Date(sig.signedAt).toISOString().slice(0, 19).replace("T", " ") });
                      setRows((p) => p.map((r) => (r.id === updated.id ? updated : r)));
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .pf-btn { display: inline-flex; align-items: center; gap: 8px; background: #FFB31B; color: #1e2a38; border: 0; border-radius: 12px; padding: 10px 18px; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; }
        .pf-btn:disabled { opacity: .5; cursor: not-allowed; }
        .pf-btn.ghost { background: transparent; border: 1px solid rgba(255,179,27,.3); color: #FFB31B; }
        .pf-btn.ghost.danger { border-color: rgba(255,80,80,.4); color: #ff8080; }
        .pf-icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 10px; border: 1px solid rgba(255,179,27,.2); background: transparent; color: #FFB31B; cursor: pointer; }
        .pf-icon.danger { color: #ff8080; border-color: rgba(255,80,80,.3); }
        .pf-note { border-radius: 12px; padding: 12px 16px; font-size: 13px; cursor: pointer; }
        .pf-note.ok { background: rgba(30,160,90,.12); border: 1px solid rgba(30,160,90,.3); color: #7ddba3; }
        .pf-note.err { background: rgba(255,80,80,.1); border: 1px solid rgba(255,80,80,.3); color: #ff8080; }
        .pf-chip { padding: 8px 14px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; background: #25303a; color: rgba(255,179,27,.6); border: 1px solid rgba(255,179,27,.12); cursor: pointer; }
        .pf-chip.active { background: #FFB31B; color: #1e2a38; border-color: #FFB31B; }
        .pf-search { display: flex; align-items: center; gap: 8px; background: #25303a; border: 1px solid rgba(255,179,27,.15); border-radius: 12px; padding: 8px 12px; color: rgba(255,179,27,.5); margin-left: auto; }
        .pf-search input { background: transparent; border: 0; outline: none; color: #FFB31B; font-size: 13px; width: 200px; }
        .pf-row { width: 100%; text-align: left; display: flex; justify-content: space-between; align-items: center; background: #25303a; border: 1px solid rgba(255,179,27,.1); border-radius: 14px; padding: 14px 18px; cursor: pointer; }
        .pf-row:hover { border-color: rgba(255,179,27,.35); }
        .pf-status { font-size: 9px; text-transform: uppercase; letter-spacing: .14em; color: rgba(255,179,27,.45); margin: 2px 0 0; }
        .pf-empty { background: #25303a; border: 1px dashed rgba(255,179,27,.15); border-radius: 16px; padding: 40px 24px; text-align: center; color: rgba(255,179,27,.5); font-size: 14px; }
        .pf-modal { position: fixed; inset: 0; z-index: 50; background: rgba(11,19,32,.7); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: flex-start; padding: 24px 12px; overflow-y: auto; }
        .pf-sheet { background: #141d2b; border: 1px solid rgba(255,179,27,.15); border-radius: 20px; padding: 24px; width: 100%; max-width: 760px; }
        .pf-sheet.wide { max-width: 960px; }
        .pf-sheet.small { max-width: 520px; }
        .pf-sheet-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 18px; color: #FFB31B; }
        .pf-sheet-head h2 { margin: 4px 0 0; font-size: 16px; }
        .pf-sheet-head button { background: transparent; border: 1px solid rgba(255,179,27,.2); color: #FFB31B; border-radius: 10px; width: 36px; height: 36px; display: grid; place-items: center; cursor: pointer; }
        .pf-kicker { margin: 0; font-size: 9px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; color: rgba(255,179,27,.5); }
        .pf-toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .pf-select { width: 100%; background: #1e2a38; border: 1px solid rgba(255,179,27,.2); border-radius: 10px; color: #FFB31B; padding: 12px; font-size: 14px; }
        @media print {
          .pf-modal { position: static; background: transparent; padding: 0; display: block; }
          .pf-sheet { border: 0; border-radius: 0; max-width: none; padding: 0; background: transparent; }
        }
      `}</style>
    </div>
  );
}

export default function ProformasPage() {
  return (
    <Suspense fallback={<div className="p-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-[#FFB31B]" /></div>}>
      <ProformasContent />
    </Suspense>
  );
}
