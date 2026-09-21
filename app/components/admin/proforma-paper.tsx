"use client";

import type { ProformaRecord } from "@/app/lib/proforma";
import { formatMoney, proformaStatusLabel } from "@/app/lib/proforma";

function fmtDate(v?: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

/** Vrai document proforma A4 — imprimable / PDF via impression. */
export function ProformaPaper({ proforma }: { proforma: ProformaRecord }) {
  const t = {
    subtotal: Number(proforma.subtotal ?? 0),
    discount: Number(proforma.discount_amount ?? 0),
    tax: Number(proforma.tax_amount ?? 0),
    total: Number(proforma.total ?? 0),
    deposit: Number(proforma.deposit_amount ?? 0),
    balance: Number(proforma.balance_amount ?? 0),
  };
  const cur = proforma.currency ?? "MGA";

  return (
    <article className="proforma-paper">
      {/* En-tête */}
      <header className="pp-head">
        <div className="pp-brand">
          <div>
            <img src="/navbar/logo-dark.svg" alt="JMR Textile" className="pp-official-logo" />
            <p className="pp-sub">Atelier de confection · Madagascar</p>
            <p className="pp-contact">contact@jmrtextile.com · +261 00 00 000 00</p>
          </div>
        </div>
        <div className="pp-title">
          <p className="pp-kicker">Facture proforma</p>
          <h1>{proforma.number}</h1>
          <p className="pp-ref">
            Émise le {fmtDate(proforma.issue_date)}
            <br />Valable jusqu&apos;au {fmtDate(proforma.valid_until)}
          </p>
          <span className="pp-status">{proformaStatusLabel(proforma.status)}</span>
        </div>
      </header>

      {/* Parties */}
      <section className="pp-parties">
        <div>
          <p className="pp-label">Facturé à</p>
          <h2>{proforma.client_name}</h2>
          {proforma.client_address ? <p className="pp-pre">{proforma.client_address}</p> : null}
          <p className="pp-meta">{[proforma.client_email, proforma.client_phone].filter(Boolean).join(" · ") || "—"}</p>
          {proforma.client_tax_id ? <p className="pp-meta">NIF / STAT : {proforma.client_tax_id}</p> : null}
        </div>
        <div className="pp-from">
          <p className="pp-label">Émis par</p>
          <p className="pp-strong">JMR Textile — Atelier</p>
          <p className="pp-meta">Antananarivo, Madagascar</p>
          {proforma.order_reference ? <p className="pp-meta">Réf. commande : <strong>{proforma.order_reference}</strong></p> : null}
          {proforma.quote_id ? <p className="pp-meta">Devis lié : {String(proforma.quote_id).slice(0, 8).toUpperCase()}</p> : null}
          {proforma.delivery_address ? <p className="pp-meta">Livraison : {proforma.delivery_address}</p> : null}
        </div>
      </section>

      {/* Lignes */}
      <section className="pp-table-wrap">
        <table className="pp-table">
          <thead>
            <tr>
              <th className="l">#</th>
              <th className="l">Désignation</th>
              <th className="c">Qté</th>
              <th className="r">P.U. HT</th>
              <th className="r">TVA</th>
              <th className="r">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {proforma.lines.map((l, i) => (
              <tr key={i}>
                <td className="l muted">{String(i + 1).padStart(2, "0")}</td>
                <td className="l">
                  <p className="pp-desc">{l.description}</p>
                  {l.detail ? <p className="pp-detail">{l.detail}</p> : null}
                </td>
                <td className="c">{l.quantity} {l.unit || ""}</td>
                <td className="r">{formatMoney(l.unitPrice, cur)}</td>
                <td className="r">{l.taxRate ?? proforma.tax_rate}%</td>
                <td className="r strong">{formatMoney(l.quantity * l.unitPrice, cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totaux + conditions */}
      <section className="pp-bottom">
        <div className="pp-conds">
          {proforma.payment_terms ? (
            <div className="pp-block">
              <p className="pp-label">Conditions de paiement</p>
              <p>{proforma.payment_terms}</p>
            </div>
          ) : null}
          {proforma.notes ? (
            <div className="pp-block pp-notes">
              <p className="pp-label">Notes</p>
              <p className="pp-pre">{proforma.notes}</p>
            </div>
          ) : null}
          <div className="pp-block pp-legal">
            <p className="pp-label">Mentions</p>
            <p>
              Proforma sans valeur comptable — ne tient pas lieu de facture.
              La commande devient ferme après validation écrite et versement de l&apos;acompte
              de {formatMoney(t.deposit, cur)} ({Number(proforma.deposit_pct ?? 0)}%).
              Solde de {formatMoney(t.balance, cur)} à la livraison.
            </p>
          </div>
        </div>
        <dl className="pp-totals">
          <div><dt>Sous-total HT</dt><dd>{formatMoney(t.subtotal, cur)}</dd></div>
          {t.discount > 0 ? <div><dt>Remise ({Number(proforma.discount_pct ?? 0)}%)</dt><dd>−{formatMoney(t.discount, cur)}</dd></div> : null}
          <div><dt>TVA</dt><dd>{formatMoney(t.tax, cur)}</dd></div>
          <div className="pp-grand"><dt>Total TTC</dt><dd>{formatMoney(t.total, cur)}</dd></div>
          <div className="pp-acompte"><dt>Acompte ({Number(proforma.deposit_pct ?? 0)}%)</dt><dd>{formatMoney(t.deposit, cur)}</dd></div>
          <div><dt>Solde dû</dt><dd>{formatMoney(t.balance, cur)}</dd></div>
        </dl>
      </section>

      {/* Signatures */}
      <section className="pp-signs">
        <div className="pp-sign">
          <p className="pp-label">Signature client</p>
          <div className="pp-sign-box"><span>Nom, date et signature</span></div>
        </div>
        <div className="pp-sign">
          <p className="pp-label">Pour JMR Textile</p>
          <div className="pp-sign-box">
            {proforma.admin_signature_name ? (
              <>
                <p className="pp-sign-name">{proforma.admin_signature_name}</p>
                <p className="pp-meta">Signé le {fmtDate(proforma.admin_signature_at)}</p>
              </>
            ) : (
              <span>Cachet et signature de l&apos;atelier</span>
            )}
          </div>
        </div>
      </section>

      <footer className="pp-foot">
        <p>JMR Textile · Atelier de confection · Antananarivo, Madagascar · contact@jmrtextile.com</p>
        <p>{proforma.number} · émise le {fmtDate(proforma.issue_date)} · document généré par JMR Atelier</p>
      </footer>

      <style jsx>{`
        .proforma-paper {
          margin: 0 auto; width: 100%; max-width: 210mm;
          background: #fffdf8; color: #172d42;
          box-shadow: 0 24px 80px rgba(3,24,43,.18);
          font-size: 13px; line-height: 1.55;
        }
        .pp-head {
          display: flex; justify-content: space-between; gap: 24px;
          background: #172d42; color: #fff; padding: 28px 36px 24px;
        }
        .pp-brand { display: flex; gap: 12px; align-items: flex-start; }
        .pp-official-logo { height: 46px; width: auto; max-width: 230px; display: block; }
        .pp-sub { margin: 2px 0 0; font-size: 9px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: #EAA100; }
        .pp-contact { margin: 6px 0 0; font-size: 11px; color: rgba(255,255,255,.7); }
        .pp-title { text-align: right; }
        .pp-kicker { margin: 0; font-size: 10px; font-weight: 700; letter-spacing: .26em; text-transform: uppercase; color: #EAA100; }
        .pp-title h1 { font-family: Georgia, serif; font-size: 30px; margin: 4px 0; }
        .pp-ref { margin: 0; font-size: 12px; color: rgba(255,255,255,.75); }
        .pp-status {
          display: inline-block; margin-top: 10px; padding: 3px 12px;
          background: #EAA100; color: #172d42; font-size: 10px; font-weight: 800;
          letter-spacing: .14em; text-transform: uppercase;
        }
        .pp-parties {
          display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;
          padding: 24px 36px; border-bottom: 1px solid rgba(23,45,66,.15);
        }
        .pp-label { margin: 0 0 6px; font-size: 9px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: #b07a1a; }
        .pp-parties h2 { font-family: Georgia, serif; font-size: 19px; margin: 0 0 4px; }
        .pp-pre { white-space: pre-line; margin: 0; color: #40566a; }
        .pp-meta { margin: 4px 0 0; font-size: 12px; color: #40566a; }
        .pp-strong { font-weight: 700; margin: 0; }
        .pp-table-wrap { padding: 8px 36px 0; overflow-x: auto; }
        .pp-table { width: 100%; min-width: 560px; border-collapse: collapse; font-size: 13px; }
        .pp-table thead tr { border-top: 1px solid rgba(23,45,66,.2); border-bottom: 1px solid rgba(23,45,66,.2); }
        .pp-table th { padding: 10px 4px; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: #6f8292; }
        .pp-table td { padding: 12px 4px; border-bottom: 1px solid rgba(23,45,66,.1); vertical-align: top; }
        .l { text-align: left; } .c { text-align: center; } .r { text-align: right; }
        .muted { color: #6f8292; } .strong { font-weight: 700; }
        .pp-desc { margin: 0; font-weight: 600; }
        .pp-detail { margin: 2px 0 0; font-size: 11px; color: #6f8292; }
        .pp-bottom { display: grid; grid-template-columns: 1fr 250px; gap: 24px; padding: 20px 36px; }
        .pp-block { margin-bottom: 14px; font-size: 12px; color: #40566a; }
        .pp-block p { margin: 0; }
        .pp-notes { border-left: 2px solid #EAA100; background: rgba(244,234,212,.45); padding: 10px 12px; }
        .pp-legal { font-size: 11px; }
        .pp-totals { margin: 0; border-top: 2px solid #172d42; padding-top: 8px; font-size: 13px; }
        .pp-totals div { display: flex; justify-content: space-between; padding: 5px 0; color: #40566a; }
        .pp-totals dd { margin: 0; font-weight: 600; color: #172d42; }
        .pp-grand { background: #172d42; color: #fff !important; padding: 10px 12px !important; margin-top: 6px; font-size: 16px; }
        .pp-grand dt, .pp-grand dd { color: #fff !important; }
        .pp-grand dd { color: #EAA100 !important; font-family: Georgia, serif; }
        .pp-acompte dd { color: #1f8457; }
        .pp-signs { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 8px 36px 24px; }
        .pp-sign-box {
          border: 1px dashed rgba(23,45,66,.3); background: #faf6ec;
          min-height: 110px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; padding: 16px; text-align: center;
        }
        .pp-sign-box span { font-size: 11px; color: #6f8292; }
        .pp-sign-name { font-family: Georgia, serif; font-style: italic; font-size: 24px; margin: 0; }
        .pp-foot { border-top: 1px solid rgba(23,45,66,.15); padding: 14px 36px 18px; font-size: 10px; color: #6f8292; }
        .pp-foot p { margin: 2px 0; }
        @media (max-width: 640px) {
          .pp-head, .pp-parties, .pp-bottom, .pp-signs { grid-template-columns: 1fr; }
          .pp-head { flex-direction: column; } .pp-title { text-align: left; }
          .pp-head, .pp-parties, .pp-table-wrap, .pp-bottom, .pp-signs, .pp-foot { padding-left: 20px; padding-right: 20px; }
        }
        @media print {
          .proforma-paper { box-shadow: none; max-width: none; }
        }
      `}</style>
    </article>
  );
}
