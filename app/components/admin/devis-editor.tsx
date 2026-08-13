"use client";

import { useMemo, useRef, useState } from "react";
import { Printer, Plus, X } from "lucide-react";
import { useExchangeRate } from "@/app/lib/use-exchange-rate";

type LineItem = {
  id: number;
  qty: number;
  price: number;
};

const fmt = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/,/g, " ")} Ar`;
const fmtPlain = (n: number) => Math.round(n).toLocaleString("fr-FR").replace(/,/g, " ");

function Editable({
  initial,
  placeholder,
  className,
  as = "span",
}: {
  initial: string;
  placeholder?: string;
  className?: string;
  as?: "span" | "div" | "h4" | "li";
}) {
  const [html, setHtml] = useState(initial);
  const Tag = as;
  return (
    <Tag
      className={`doc-editable ${className ?? ""}`}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={(e: React.FormEvent<HTMLElement>) => setHtml((e.target as HTMLElement).innerHTML)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function DevisEditor() {
  const [lines, setLines] = useState<LineItem[]>([
    { id: 1, qty: 300, price: 18000 },
    { id: 2, qty: 300, price: 3500 },
    { id: 3, qty: 1, price: 250000 },
  ]);
  const [discountPct, setDiscountPct] = useState(0);
  const [vatPct, setVatPct] = useState(20);
  const [logo, setLogo] = useState<string | null>(null);
  const nextIdRef = useRef(4);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { rates, isLoading } = useExchangeRate("USD", "MGA,EUR");
  const eurToMga = rates && rates.MGA != null && rates.EUR != null ? rates.MGA / rates.EUR : null;

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => sum + line.qty * line.price, 0);
    const discountAmt = subtotal * (discountPct / 100);
    const afterDiscount = subtotal - discountAmt;
    const vatAmt = afterDiscount * (vatPct / 100);
    const grand = afterDiscount + vatAmt;
    return { subtotal, discountAmt, afterDiscount, vatAmt, grand };
  }, [lines, discountPct, vatPct]);

  function updateLine(id: number, key: "qty" | "price", value: number) {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [key]: value } : line)));
  }

  function removeLine(id: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
  }

  function addLine() {
    setLines((prev) => [...prev, { id: nextIdRef.current++, qty: 1, price: 0 }]);
  }

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setLogo(url);
    };
    reader.readAsDataURL(file);
  }

  function exportJson() {
    const snapshot = {
      document: "Devis",
      number: "généré par la BDD",
      lines: lines.map((line) => ({
        designation: line.qty,
        qty: line.qty,
        unitPrice: line.price,
        total: line.qty * line.price,
      })),
      discountPct,
      vatPct,
      subtotal: totals.subtotal,
      grandTotal: totals.grand,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devis-jmr-textile.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="doc-print-root bg-[#eef0f3] px-4 py-8 md:px-8">
      <div className="doc-print-toolbar sticky top-0 z-10 -mx-4 mb-5 flex flex-wrap items-center justify-center gap-3 border-b border-[#172d42]/10 bg-[#fffdf8] px-4 py-3 shadow-sm md:-mx-8">
        <button
          type="button"
          onClick={addLine}
          className="inline-flex items-center gap-2 rounded border border-[#172d42]/25 bg-[#fffdf8] px-4 py-2 text-[12.5px] font-medium text-[#40566a] transition-colors hover:border-[#6f8292] hover:text-[#172d42]"
        >
          <Plus className="h-4 w-4" /> + Ligne prestation
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded border border-[#172d42] bg-[#172d42] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#16294a]"
        >
          <Printer className="h-4 w-4" /> Aperçu impression / PDF
        </button>
        <button
          type="button"
          onClick={exportJson}
          className="inline-flex items-center gap-2 rounded border border-[#172d42]/25 bg-[#fffdf8] px-4 py-2 text-[12.5px] font-medium text-[#40566a] transition-colors hover:border-[#6f8292] hover:text-[#172d42]"
        >
          Exporter JSON
        </button>
        <span className="inline-flex items-center gap-2 rounded border border-[#172d42]/15 bg-[#faf6ec] px-3 py-1.5 font-mono text-[11px] text-[#6f8292]">
          {isLoading || !eurToMga ? (
            "Taux de change…"
          ) : (
            <>
              1 EUR ≈ {fmtPlain(eurToMga)} Ar
              <span className="text-[#a67428]">{new Date().toLocaleDateString("fr-FR")}</span>
            </>
          )}
        </span>
      </div>

      <div className="hint mx-auto mb-4 max-w-[820px] text-center text-xs text-[#6f8292]">
        Tout le document est éditable au survol (fond <b className="text-[#172d42]">clair</b>). Numéro, dates et statut
        viendront de ta BDD à l&apos;envoi.
      </div>

      <div className="mx-auto w-full max-w-[820px] border border-[#172d42]/10 bg-[#fffdf8] shadow-[0_1px_3px_rgba(28,36,48,0.06)]">
        {/* EN-TETE */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-[#172d42] px-8 py-7 md:px-12 md:py-10">
          <div className="flex items-center gap-3.5">
            <label
              className="relative flex h-[52px] w-[52px] shrink-0 cursor-pointer items-center justify-center border border-[#172d42]/25 text-xl font-bold text-[#172d42] transition-all hover:after:absolute hover:after:inset-0 hover:after:flex hover:after:items-center hover:after:justify-center hover:after:bg-[#172d42]/80 hover:after:content-['changer_le_logo'] hover:after:text-center hover:after:px-1 hover:after:py-0.5 hover:after:text-[9px] hover:after:font-normal hover:after:text-white"
              style={logo ? { backgroundImage: `url(${logo})`, backgroundSize: "cover", backgroundPosition: "center", color: "transparent" } : undefined}
            >
              J
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
            </label>
            <div>
              <Editable as="div" initial="JMR Textile" placeholder="Nom atelier" className="text-[19px] font-bold tracking-[-0.01em] text-[#172d42]" />
              <Editable as="div" initial="Atelier de confection — Madagascar" placeholder="Accroche / activité" className="mt-0.5 text-[11.5px] text-[#6f8292]" />
            </div>
          </div>
          <div className="text-right">
            <Editable as="div" initial="Devis" className="mb-2 text-[22px] font-bold uppercase tracking-[0.02em] text-[#172d42]" />
            <div className="flex items-center justify-end gap-1.5 text-[13px] text-[#40566a]">
              <span className="text-[#6f8292]">N°</span>
              <span className="font-mono font-semibold text-[#172d42]">généré par la BDD</span>
            </div>
            <div className="mt-2 space-y-1.5 text-[12.5px] leading-6 text-[#6f8292]">
              <div className="flex items-center justify-end gap-1.5">
                Émis le <span className="font-mono text-xs text-[#40566a]">auto</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                Valable jusqu&apos;au <span className="font-mono text-xs text-[#40566a]">auto</span>
              </div>
            </div>
          </div>
        </div>

        {/* PARTIES */}
        <div className="grid grid-cols-1 border-b border-[#172d42]/15 md:grid-cols-2">
          <div className="border-b border-[#172d42]/15 px-8 py-6 md:border-b-0 md:border-r md:px-12 md:py-7">
            <Editable as="div" initial="Émis par" className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#6f8292]" />
            <Editable as="div" initial="JMR Textile" placeholder="Nom de l'atelier" className="mb-1.5 min-h-[20px] text-[15px] font-semibold text-[#172d42]" />
            <Editable as="div" initial="Atelier de confection haut de gamme&#10;Antananarivo, Madagascar&#10;contact@jmrtextile.com" placeholder="Adresse, ville" className="min-h-[20px] text-[13px] leading-[1.8] whitespace-pre-line text-[#40566a]" />
          </div>
          <div className="px-8 py-6 md:px-12 md:py-7">
            <Editable as="div" initial="Destinataire" className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#6f8292]" />
            <Editable as="div" initial="Allan Tohaina" placeholder="Nom du client" className="mb-1.5 min-h-[20px] text-[15px] font-semibold text-[#172d42]" />
            <Editable as="div" initial="allantohaina2@gmail.com&#10;+261 34 608 8600&#10;Réf. demande #0ea30a18" placeholder="Email, téléphone" className="min-h-[20px] text-[13px] leading-[1.8] whitespace-pre-line text-[#40566a]" />
          </div>
        </div>

        {/* TABLEAU */}
        <div className="px-8 pt-8 md:px-12">
          <div className="mb-3.5 flex items-center justify-between">
            <Editable as="span" initial="Détail de la prestation" className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#6f8292]" />
            <button
              type="button"
              onClick={addLine}
              className="rounded border border-[#172d42]/25 px-2.5 py-1 text-[11px] font-medium text-[#172d42] transition-colors hover:border-[#172d42] hover:bg-[#faf6ec]"
            >
              + ajouter une ligne
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-[1.5px] border-[#172d42] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6f8292]">
                <th className="w-[48%] py-2.5 pl-1 pr-1 text-left">
                  <Editable as="span" initial="Désignation" />
                </th>
                <th className="py-2.5 pr-1 text-right">
                  <Editable as="span" initial="Qté" />
                </th>
                <th className="py-2.5 pr-1 text-right">
                  <Editable as="span" initial="Prix unit." />
                </th>
                <th className="py-2.5 pr-1 text-right">
                  <Editable as="span" initial="Total" />
                </th>
                <th className="w-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={line.id} className="border-b border-[#172d42]/10 align-top text-[13.5px]">
                  <td className="py-3.5 pr-1">
                    <Editable
                      as="div"
                      initial={
                        index === 0
                          ? "Sweat-shirt / Hoodie oversize — coton 180g/m²"
                          : index === 1
                            ? "Broderie logo"
                            : "Frais de préparation atelier"
                      }
                      placeholder="Désignation"
                      className="mb-0.5 min-h-[18px] font-semibold text-[#172d42]"
                    />
                    <Editable
                      as="div"
                      initial={
                        index === 0
                          ? "Coupe oversize, style casual, taille XL, gabarit standard."
                          : index === 1
                            ? "Finition brodée, emplacement à définir avec le client."
                            : "Patronage, échantillon de validation, mise en production."
                      }
                      placeholder="Détail, précisions"
                      className="min-h-[16px] text-[12.5px] leading-[1.5] text-[#6f8292]"
                    />
                  </td>
                  <td className="py-3.5 pr-1 text-right">
                    <input
                      type="number"
                      value={Number.isFinite(line.qty) ? line.qty : 0}
                      min={0}
                      onChange={(e) => updateLine(line.id, "qty", parseFloat(e.target.value) || 0)}
                      className="num-input w-[70px] rounded-[3px] border-none bg-transparent p-0.5 text-right font-mono text-[13px] text-[#40566a] transition-colors hover:bg-[#faf6ec] focus:bg-[#faf6ec] focus:outline-none focus:ring-1 focus:ring-[#172d42]"
                    />
                  </td>
                  <td className="py-3.5 pr-1 text-right">
                    <input
                      type="number"
                      value={Number.isFinite(line.price) ? line.price : 0}
                      min={0}
                      onChange={(e) => updateLine(line.id, "price", parseFloat(e.target.value) || 0)}
                      className="num-input w-[70px] rounded-[3px] border-none bg-transparent p-0.5 text-right font-mono text-[13px] text-[#40566a] transition-colors hover:bg-[#faf6ec] focus:bg-[#faf6ec] focus:outline-none focus:ring-1 focus:ring-[#172d42]"
                    />
                  </td>
                  <td className="whitespace-nowrap py-3.5 pr-1 text-right font-mono text-[13px] font-semibold text-[#172d42]">
                    {fmtPlain(line.qty * line.price)}
                  </td>
                  <td className="py-3.5">
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      title="Supprimer"
                      className="p-0 align-middle text-sm leading-none text-[#6f8292] transition-colors hover:text-[#b3413a]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAUX */}
        <div className="flex justify-end px-8 py-5 md:px-12 md:py-8">
          <div className="w-full max-w-[300px]">
            <div className="flex items-center justify-between py-2 text-[13px] text-[#40566a]">
              <Editable as="span" initial="Sous-total" />
              <span className="font-mono">{fmt(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-[13px] text-[#40566a]">
              <Editable as="span" initial="Remise (%)" />
              <input
                type="number"
                value={discountPct}
                min={0}
                max={100}
                onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                className="w-[110px] rounded-[3px] border-none bg-transparent p-0.5 text-right font-mono text-[13px] text-[#40566a] transition-colors hover:bg-[#faf6ec] focus:bg-[#faf6ec] focus:outline-none focus:ring-1 focus:ring-[#172d42]"
              />
            </div>
            <div className="flex items-center justify-between py-2 text-[13px] text-[#40566a]">
              <Editable as="span" initial="TVA (%)" />
              <input
                type="number"
                value={vatPct}
                min={0}
                max={100}
                onChange={(e) => setVatPct(parseFloat(e.target.value) || 0)}
                className="w-[110px] rounded-[3px] border-none bg-transparent p-0.5 text-right font-mono text-[13px] text-[#40566a] transition-colors hover:bg-[#faf6ec] focus:bg-[#faf6ec] focus:outline-none focus:ring-1 focus:ring-[#172d42]"
              />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between border-t-2 border-[#172d42] pt-3.5">
              <Editable as="span" initial="Total TTC" className="text-[14px] font-bold text-[#172d42]" />
              <span className="font-mono text-[22px] font-bold text-[#172d42]">{fmt(totals.grand)}</span>
            </div>
            {eurToMga ? (
              <p className="mt-1 text-right font-mono text-[11px] text-[#6f8292]">≈ {fmtPlain(totals.grand / eurToMga)} EUR</p>
            ) : null}
          </div>
        </div>

        {/* CONDITIONS */}
        <div className="grid grid-cols-1 gap-7 border-t border-[#172d42]/15 bg-[#faf6ec] px-8 py-7 md:grid-cols-2 md:px-12">
          <div>
            <Editable as="h4" initial="Conditions de paiement" className="mb-2 text-[12.5px] font-bold tracking-[0.01em] text-[#172d42]" />
            <ul contentEditable suppressContentEditableWarning data-placeholder="Modifie les conditions" className="list-none p-0 text-[12.5px] leading-[1.9] text-[#40566a]">
              <li>— Acompte de 40% à la commande</li>
              <li>— Solde à la livraison</li>
              <li>— Paiement par virement ou Mobile Money</li>
            </ul>
          </div>
          <div>
            <Editable as="h4" initial="Délais et livraison" className="mb-2 text-[12.5px] font-bold tracking-[0.01em] text-[#172d42]" />
            <ul contentEditable suppressContentEditableWarning data-placeholder="Modifie les délais" className="list-none p-0 text-[12.5px] leading-[1.9] text-[#40566a]">
              <li>— Production estimée à 6 semaines après acompte</li>
              <li>— Livraison souhaitée avant le 3 juillet 2027</li>
              <li>— Échantillon validé avant lancement série</li>
            </ul>
          </div>
        </div>

        {/* SIGNATURE */}
        <div className="grid grid-cols-1 gap-7 border-t border-[#172d42]/15 px-8 py-7 md:grid-cols-2 md:px-12">
          <div className="flex min-h-[100px] flex-col justify-between border border-[#172d42]/15 p-4.5">
            <Editable as="span" initial="Pour JMR Textile" className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6f8292]" />
            <Editable as="span" initial="Signature et cachet de l'atelier" className="text-[11px] italic text-[#6f8292]" />
          </div>
          <div className="flex min-h-[100px] flex-col justify-between border-[1.5px] border-[#172d42] p-4.5">
            <Editable as="span" initial="Bon pour accord" className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#172d42]" />
            <Editable as="span" initial="Signature précédée de la mention manuscrite « Bon pour accord »" className="text-[11px] italic text-[#6f8292]" />
          </div>
        </div>

        {/* PIED */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#172d42]/15 px-8 py-4 text-[11px] text-[#6f8292] md:px-12">
          <Editable as="span" initial="JMR Textile © 2026 — Atelier de confection, Madagascar" />
          <span className="font-mono">réf. générée à l&apos;envoi</span>
        </div>
      </div>
    </div>
  );
}