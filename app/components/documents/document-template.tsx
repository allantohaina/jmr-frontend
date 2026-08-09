import type { DocumentKind, DocumentLineItem, TextileDocumentProps } from "./types";

const labels: Record<DocumentKind, string> = {
  quote: "Devis",
  purchase_order: "Bon de commande",
  delivery_note: "Bon de livraison",
  invoice: "Facture",
};

const statusTone: Record<string, string> = {
  brouillon: "bg-slate-100 text-slate-600",
  en_attente: "bg-amber-100 text-amber-800",
  envoyée: "bg-blue-100 text-blue-800",
  validé: "bg-emerald-100 text-emerald-800",
  payée: "bg-emerald-100 text-emerald-800",
  livrée: "bg-emerald-100 text-emerald-800",
};

function date(value: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(value));
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);
}

function lineSubtotal(line: DocumentLineItem) {
  return line.quantity * line.unitPrice;
}

export function TextileDocument({
  kind,
  number,
  issuedAt,
  client,
  lines,
  currency = "EUR",
  status,
  validUntil,
  orderReference,
  deliveryAddress,
  notes,
  paymentTerms,
  signature,
  company,
}: TextileDocumentProps) {
  const subtotal = lines.reduce((sum, line) => sum + lineSubtotal(line), 0);
  const tax = lines.reduce((sum, line) => sum + lineSubtotal(line) * ((line.taxRate ?? 0) / 100), 0);
  const total = subtotal + tax;
  const companyInfo = {
    name: "JMR Textile",
    address: "Atelier de confection textile\nMadagascar",
    email: "contact@jmrtextile.com",
    ...company,
  };
  const normalizedStatus = status?.toLocaleLowerCase("fr-FR").replaceAll(" ", "_") ?? "";

  return (
    <article className="document-sheet mx-auto w-full max-w-[210mm] overflow-hidden bg-[#fffdf8] text-[#172d42] shadow-[0_24px_80px_rgba(3,24,43,.18)] print:max-w-none print:shadow-none">
      <header className="relative overflow-hidden bg-[#172d42] px-7 pb-8 pt-7 text-white sm:px-10">
        <div className="absolute -right-10 -top-14 h-48 w-48 rotate-12 border-[22px] border-[#e5ad46]/20" aria-hidden="true" />
        <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 grid-cols-2 gap-1 border-2 border-[#e5ad46] p-1" aria-hidden="true">
              <i className="bg-[#e5ad46]" /><i className="bg-[#e5ad46]/45" /><i className="bg-[#e5ad46]/45" /><i className="bg-[#e5ad46]" />
            </div>
            <div>
              <p className="font-serif text-2xl font-bold leading-none tracking-tight">JMR <span className="text-[#e5ad46]">Textile</span></p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[.24em] text-[#eccc90]">Atelier · Madagascar</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#eccc90]">Document opérationnel</p>
            <h1 className="mt-1 font-serif text-3xl leading-none">{labels[kind]}</h1>
            <p className="mt-2 font-mono text-sm text-white/80">{number}</p>
          </div>
        </div>
      </header>

      <main className="p-7 sm:p-10">
        <section className="grid gap-6 border-b border-[#172d42]/15 pb-7 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a67428]">Destinataire</p>
            <h2 className="mt-2 font-serif text-xl font-bold">{client.name}</h2>
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#40566a]">{client.address}</p>
            <p className="mt-2 text-sm text-[#40566a]">{[client.email, client.phone].filter(Boolean).join(" · ")}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-7 gap-y-3 text-sm sm:text-right">
            <div><dt className="text-[9px] font-bold uppercase tracking-wider text-[#6f8292]">Émis le</dt><dd className="mt-1 font-semibold">{date(issuedAt)}</dd></div>
            {validUntil ? <div><dt className="text-[9px] font-bold uppercase tracking-wider text-[#6f8292]">{kind === "quote" ? "Valable jusqu’au" : "Échéance"}</dt><dd className="mt-1 font-semibold">{date(validUntil)}</dd></div> : null}
            {orderReference ? <div><dt className="text-[9px] font-bold uppercase tracking-wider text-[#6f8292]">Réf. commande</dt><dd className="mt-1 font-semibold">{orderReference}</dd></div> : null}
            {status ? <div><dt className="text-[9px] font-bold uppercase tracking-wider text-[#6f8292]">Statut</dt><dd className={`mt-1 inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusTone[normalizedStatus] ?? "bg-slate-100 text-slate-600"}`}>{status}</dd></div> : null}
          </dl>
        </section>

        <section className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[610px] border-collapse text-left text-sm">
            <thead><tr className="border-y border-[#172d42]/20 text-[9px] uppercase tracking-[.16em] text-[#6f8292]"><th className="py-3 font-bold">Désignation</th><th className="py-3 text-center font-bold">Qté</th><th className="py-3 text-right font-bold">Prix unitaire</th><th className="py-3 text-right font-bold">TVA</th><th className="py-3 text-right font-bold">Total</th></tr></thead>
            <tbody>
              {lines.map((line, index) => <tr key={`${line.description}-${index}`} className="border-b border-[#172d42]/10 align-top"><td className="py-4 pr-4"><p className="font-semibold text-[#172d42]">{line.description}</p>{line.reference ? <p className="mt-1 font-mono text-[10px] text-[#6f8292]">{line.reference}</p> : null}</td><td className="py-4 text-center text-[#40566a]">{line.quantity} {line.unit ?? ""}</td><td className="py-4 text-right text-[#40566a]">{money(line.unitPrice, currency)}</td><td className="py-4 text-right text-[#40566a]">{line.taxRate ?? 0}%</td><td className="py-4 text-right font-semibold">{money(lineSubtotal(line), currency)}</td></tr>)}
            </tbody>
          </table>
        </section>

        <section className="mt-7 grid gap-7 sm:grid-cols-[1fr_245px]">
          <div className="space-y-4 text-sm leading-6 text-[#40566a]">
            {deliveryAddress ? <div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#a67428]">Lieu de livraison</p><p className="mt-1 whitespace-pre-line">{deliveryAddress}</p></div> : null}
            {notes ? <div className="border-l-2 border-[#e5ad46] bg-[#f4ead4]/45 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#a67428]">Notes</p><p className="mt-1 whitespace-pre-line">{notes}</p></div> : null}
            {paymentTerms ? <p><span className="font-semibold text-[#172d42]">Conditions de paiement · </span>{paymentTerms}</p> : null}
          </div>
          <dl className="border-t-2 border-[#172d42] pt-3 text-sm"><div className="flex justify-between py-1.5 text-[#40566a]"><dt>Sous-total</dt><dd>{money(subtotal, currency)}</dd></div><div className="flex justify-between py-1.5 text-[#40566a]"><dt>Taxes</dt><dd>{money(tax, currency)}</dd></div><div className="mt-2 flex justify-between bg-[#172d42] px-4 py-3 font-serif text-lg font-bold text-white"><dt>Total</dt><dd className="text-[#eccc90]">{money(total, currency)}</dd></div></dl>
        </section>

        {signature ? <section className="mt-9 max-w-xs border border-[#172d42]/15 bg-[#faf6ec] p-4"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#a67428]">Approbation interne</p><p className="mt-3 font-serif text-2xl italic text-[#172d42]">{signature.name}</p><p className="mt-2 text-xs text-[#40566a]">Confirmé le {date(signature.signedAt)}</p></section> : null}
      </main>

      <footer className="border-t border-[#172d42]/15 px-7 py-5 text-[10px] leading-5 text-[#6f8292] sm:px-10"><div className="flex flex-col justify-between gap-2 sm:flex-row"><p className="whitespace-pre-line">{companyInfo.name}{companyInfo.address ? ` · ${companyInfo.address}` : ""}</p><p>{companyInfo.email}</p></div><p className="mt-3 text-[#a67428]">Ce document est édité par JMR Textile. Toute validation interne affichée ici n’est pas une signature électronique qualifiée.</p></footer>
      <style jsx>{`@media print { .document-sheet { min-height: 297mm; } }`}</style>
    </article>
  );
}
