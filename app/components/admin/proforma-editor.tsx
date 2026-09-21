"use client";

import { useMemo, useState } from "react";
import {
  computeProformaTotals, defaultPaymentTerms, formatMoney,
  type ProformaCurrency, type ProformaInput, type ProformaLine, type ProformaRecord,
} from "@/app/lib/proforma";

const EMPTY_LINE: ProformaLine = { description: "", detail: "", quantity: 1, unit: "pce", unitPrice: 0, taxRate: null };

export function ProformaEditor({
  initial,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  initial?: ProformaRecord | null;
  saving: boolean;
  error: string | null;
  onSubmit: (input: ProformaInput) => void;
  onCancel: () => void;
}) {
  const [clientName, setClientName] = useState(initial?.client_name ?? "");
  const [clientEmail, setClientEmail] = useState(initial?.client_email ?? "");
  const [clientPhone, setClientPhone] = useState(initial?.client_phone ?? "");
  const [clientAddress, setClientAddress] = useState(initial?.client_address ?? "");
  const [clientTaxId, setClientTaxId] = useState(initial?.client_tax_id ?? "");
  const [currency, setCurrency] = useState<ProformaCurrency>(initial?.currency ?? "MGA");
  const [taxRate, setTaxRate] = useState<number>(Number(initial?.tax_rate ?? 20));
  const [discountPct, setDiscountPct] = useState<number>(Number(initial?.discount_pct ?? 0));
  const [depositPct, setDepositPct] = useState<number>(Number(initial?.deposit_pct ?? 50));
  const [lines, setLines] = useState<ProformaLine[]>(
    initial?.lines?.length ? initial.lines.map((l) => ({ ...l })) : [{ ...EMPTY_LINE }]
  );
  const [deliveryAddress, setDeliveryAddress] = useState(initial?.delivery_address ?? "");
  const [orderReference, setOrderReference] = useState(initial?.order_reference ?? "");
  const [paymentTerms, setPaymentTerms] = useState(initial?.payment_terms ?? defaultPaymentTerms(Number(initial?.deposit_pct ?? 50)));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [validUntil, setValidUntil] = useState((initial?.valid_until ?? "").slice(0, 10));

  const totals = useMemo(() => computeProformaTotals(lines, taxRate, discountPct, depositPct), [lines, taxRate, discountPct, depositPct]);

  const setLine = (i: number, patch: Partial<ProformaLine>) =>
    setLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const valid = clientName.trim().length >= 2 && lines.length > 0 && lines.every((l) => l.description.trim() && l.quantity > 0 && l.unitPrice >= 0);

  return (
    <form
      className="pe-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || saving) return;
        onSubmit({
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || undefined,
          client_phone: clientPhone.trim() || undefined,
          client_address: clientAddress.trim() || undefined,
          client_tax_id: clientTaxId.trim() || undefined,
          currency, tax_rate: taxRate, discount_pct: discountPct, deposit_pct: depositPct,
          lines: lines.map((l) => ({ ...l, description: l.description.trim(), quantity: Number(l.quantity), unitPrice: Number(l.unitPrice) })),
          delivery_address: deliveryAddress.trim() || undefined,
          order_reference: orderReference.trim() || undefined,
          payment_terms: paymentTerms.trim() || undefined,
          notes: notes.trim() || undefined,
          valid_until: validUntil || undefined,
        });
      }}
    >
      <div className="pe-grid">
        <label>Client *<input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nom complet / société" required /></label>
        <label>Email<input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@exemple.com" type="email" /></label>
        <label>Téléphone<input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+261 ..." /></label>
        <label>NIF / STAT<input value={clientTaxId} onChange={(e) => setClientTaxId(e.target.value)} placeholder="Optionnel" /></label>
        <label className="span2">Adresse client<textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} rows={2} placeholder="Adresse complète" /></label>
      </div>

      <div className="pe-row">
        <label>Devise
          <select value={currency} onChange={(e) => setCurrency(e.target.value as ProformaCurrency)}>
            <option value="MGA">MGA (Ar)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>
        </label>
        <label>TVA défaut %<input type="number" min={0} max={100} step={0.5} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} /></label>
        <label>Remise %<input type="number" min={0} max={100} step={0.5} value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} /></label>
        <label>Acompte %<input type="number" min={0} max={100} step={1} value={depositPct} onChange={(e) => { setDepositPct(Number(e.target.value)); }} /></label>
        <label>Valable jusqu&apos;au<input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></label>
      </div>

      <div className="pe-lines-head">
        <h3>Lignes ({lines.length})</h3>
        <button type="button" className="pe-add" onClick={() => setLines((p) => [...p, { ...EMPTY_LINE }])}>+ Ajouter une ligne</button>
      </div>
      {lines.map((l, i) => (
        <div className="pe-line" key={i}>
          <label className="span2">Désignation *<input value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} placeholder="Ex : Robe de soirée — satin" /></label>
          <label>Détail<input value={l.detail ?? ""} onChange={(e) => setLine(i, { detail: e.target.value })} placeholder="Tissu, finitions…" /></label>
          <label>Qté *<input type="number" min={0.5} step={0.5} value={l.quantity} onChange={(e) => setLine(i, { quantity: Number(e.target.value) })} /></label>
          <label>Unité<input value={l.unit ?? ""} onChange={(e) => setLine(i, { unit: e.target.value })} placeholder="pce" /></label>
          <label>P.U. HT *<input type="number" min={0} step={100} value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: Number(e.target.value) })} /></label>
          <label>TVA %<input type="number" min={0} max={100} step={0.5} value={l.taxRate ?? ""} placeholder={`${taxRate}`} onChange={(e) => setLine(i, { taxRate: e.target.value === "" ? null : Number(e.target.value) })} /></label>
          <div className="pe-line-total">{formatMoney(l.quantity * l.unitPrice, currency)}</div>
          {lines.length > 1 ? <button type="button" className="pe-del" onClick={() => setLines((p) => p.filter((_, j) => j !== i))} aria-label="Supprimer">×</button> : <span />}
        </div>
      ))}

      <div className="pe-grid">
        <label>Réf. commande<input value={orderReference} onChange={(e) => setOrderReference(e.target.value)} placeholder="DEV-… / CMD-…" /></label>
        <label>Lieu de livraison<input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Adresse de livraison" /></label>
        <label className="span2">Conditions de paiement<textarea value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} rows={2} /></label>
        <label className="span2">Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes visibles sur le document" /></label>
      </div>

      <div className="pe-totals">
        <span>Sous-total : <strong>{formatMoney(totals.subtotal, currency)}</strong></span>
        <span>Remise : <strong>−{formatMoney(totals.discount, currency)}</strong></span>
        <span>TVA : <strong>{formatMoney(totals.tax, currency)}</strong></span>
        <span className="grand">Total TTC : <strong>{formatMoney(totals.total, currency)}</strong></span>
        <span>Acompte ({depositPct}%) : <strong>{formatMoney(totals.deposit, currency)}</strong></span>
      </div>

      {error ? <p className="pe-error">{error}</p> : null}

      <div className="pe-actions">
        <button type="button" className="pe-btn ghost" onClick={onCancel} disabled={saving}>Annuler</button>
        <button type="submit" className="pe-btn" disabled={!valid || saving}>{saving ? "Enregistrement…" : initial ? "Enregistrer" : "Créer la proforma"}</button>
      </div>

      <style jsx>{`
        .pe-form { display: flex; flex-direction: column; gap: 16px; }
        .pe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .pe-grid label, .pe-row label, .pe-line label { display: flex; flex-direction: column; gap: 6px; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: rgba(234, 161, 0,.55); }
        .span2 { grid-column: span 2; }
        .pe-form input, .pe-form textarea, .pe-form select {
          background: #1e2a38; border: 1px solid rgba(234, 161, 0,.15); border-radius: 10px;
          padding: 10px 12px; color: #EAA100; font-size: 14px; text-transform: none; letter-spacing: normal; font-weight: 400; width: 100%;
        }
        .pe-form input:focus, .pe-form textarea:focus, .pe-form select:focus { outline: none; border-color: rgba(234, 161, 0,.5); }
        .pe-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .pe-lines-head { display: flex; justify-content: space-between; align-items: center; }
        .pe-lines-head h3 { margin: 0; font-size: 13px; color: #EAA100; text-transform: uppercase; letter-spacing: .14em; }
        .pe-add { background: rgba(234, 161, 0,.12); border: 1px solid rgba(234, 161, 0,.3); color: #EAA100; border-radius: 10px; padding: 8px 14px; font-size: 11px; font-weight: 700; cursor: pointer; }
        .pe-line { display: grid; grid-template-columns: 2fr 1.4fr .6fr .6fr 1fr .7fr auto auto; gap: 8px; align-items: end; background: rgba(30,42,56,.6); border: 1px solid rgba(234, 161, 0,.08); border-radius: 12px; padding: 10px; }
        .pe-line .span2 { grid-column: span 1; }
        .pe-line-total { font-size: 13px; font-weight: 700; color: #EAA100; padding-bottom: 10px; white-space: nowrap; }
        .pe-del { background: rgba(255,80,80,.12); border: 1px solid rgba(255,80,80,.3); color: #ff8080; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; font-size: 18px; }
        .pe-totals { display: flex; flex-wrap: wrap; gap: 8px 20px; background: #1e2a38; border: 1px solid rgba(234, 161, 0,.12); border-radius: 12px; padding: 12px 16px; font-size: 13px; color: rgba(234, 161, 0,.75); }
        .pe-totals .grand { color: #EAA100; font-size: 15px; }
        .pe-error { color: #ff8080; font-size: 13px; margin: 0; }
        .pe-actions { display: flex; justify-content: flex-end; gap: 10px; }
        .pe-btn { background: #EAA100; color: #1e2a38; border: 0; border-radius: 12px; padding: 12px 22px; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; }
        .pe-btn:disabled { opacity: .5; cursor: not-allowed; }
        .pe-btn.ghost { background: transparent; border: 1px solid rgba(234, 161, 0,.25); color: #EAA100; }
        @media (max-width: 900px) { .pe-grid { grid-template-columns: 1fr; } .span2 { grid-column: span 1; } .pe-row { grid-template-columns: 1fr 1fr; } .pe-line { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </form>
  );
}
