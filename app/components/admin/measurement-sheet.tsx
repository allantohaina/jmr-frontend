"use client";

import { useRef, useState } from "react";
import { Printer } from "lucide-react";

type PayField = { price: string; advance: string };

export function MeasurementSheet() {
  const [idDate, setIdDate] = useState("");
  const [idReceipt, setIdReceipt] = useState("");
  const [idClient, setIdClient] = useState("");
  const [idContact, setIdContact] = useState("");
  const [measures, setMeasures] = useState<Record<string, string>>({});
  const [modele, setModele] = useState("");
  const [remarques, setRemarques] = useState("");
  const [nbPagnes, setNbPagnes] = useState("");
  const [tissusDeposes, setTissusDeposes] = useState("");
  const [pay, setPay] = useState<PayField>({ price: "", advance: "" });
  const [retraitDate, setRetraitDate] = useState("");
  const [soldeDate, setSoldeDate] = useState("");
  const [swatches, setSwatches] = useState<string[]>([]);
  const swatchInputRef = useRef<HTMLInputElement>(null);

  function setMeasure(label: string, value: string) {
    setMeasures((prev) => ({ ...prev, [label]: value }));
  }

  function onSwatchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSwatches((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  const priceNum = parseFloat(pay.price.replace(/\s/g, "")) || 0;
  const advanceNum = parseFloat(pay.advance.replace(/\s/g, "")) || 0;
  const resteNum = priceNum - advanceNum;

  const fieldCls = "w-full border-none border-b border-[#172d42]/25 bg-transparent px-0 py-0.5 pb-1 font-mono text-[13.5px] text-[#172d42] focus:outline-none focus:border-[#172d42]";
  const idFieldCls = "flex-1 border-none bg-transparent px-0 py-0.5 pb-1 text-[13.5px] focus:outline-none";
  const measureInputCls = "w-14 text-right border-none border-b border-[#172d42]/25 bg-transparent px-0 py-0.5 pb-0.5 font-mono text-[13.5px] font-semibold text-[#172d42] focus:outline-none focus:border-[#172d42]";

  const haut = ["Dos", "Épaule", "Poitrine", "Longueur manche", "Tour manche", "Poignet", "Longueur taille", "Col", "Pinces"];
  const bas = ["Tour de taille", "Bassin", "Cuisse", "Genoux", "Longueur pantalon", "Bas", "Longueur jupe", "Ceinture"];
  const specifiques = ["Longueur camisole", "Longueur robe", "Longueur chemise"];

  function MeasureGrid({ labels }: { labels: string[] }) {
    return (
      <div className="grid grid-cols-1 gap-px border border-[#172d42]/15 bg-[#172d42]/15 sm:grid-cols-2 lg:grid-cols-3">
        {labels.map((label) => (
          <div key={label} className="flex items-center justify-between gap-2.5 bg-[#fffdf8] px-4 py-3">
            <label className="flex-1 text-[12.5px] text-[#40566a]">{label}</label>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                step="0.5"
                value={measures[label] ?? ""}
                onChange={(e) => setMeasure(label, e.target.value)}
                className={measureInputCls}
              />
              <span className="text-[10.5px] text-[#6f8292]">cm</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="doc-print-root bg-[#eef0f3] px-4 py-8 md:px-8">
      <div className="doc-print-toolbar sticky top-0 z-10 -mx-4 mb-5 flex items-center justify-center gap-3 border-b border-[#172d42]/10 bg-[#fffdf8] px-4 py-3 shadow-sm md:-mx-8">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded border border-[#172d42] bg-[#172d42] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#16294a]"
        >
          <Printer className="h-4 w-4" /> Aperçu impression / PDF
        </button>
      </div>

      <div className="hint mx-auto mb-4 max-w-[860px] text-center text-xs text-[#6f8292]">
        Fiche numérique — remplie par l&apos;atelier à la prise de mesures. Tous les champs sont <b className="text-[#172d42]">saisissables</b>.
      </div>

      <div className="mx-auto w-full max-w-[860px] border border-[#172d42]/10 bg-[#fffdf8] shadow-[0_1px_3px_rgba(28,36,48,0.06)]">
        {/* EN-TETE */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-[#172d42] px-8 py-6 md:px-11 md:py-9">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#172d42]/25 text-[17px] font-bold text-[#172d42]">
              J
            </div>
            <div>
              <div className="text-[17px] font-bold text-[#172d42]">JMR Textile</div>
              <div className="mt-0.5 text-[11px] text-[#6f8292]">Atelier de confection — Madagascar</div>
            </div>
          </div>
          <div className="text-right">
            <div className="mb-1.5 text-[19px] font-bold uppercase tracking-[0.02em] text-[#172d42]">Fiche de mesures</div>
            <div className="text-[11.5px] text-[#6f8292]">Couture sur mesure — mixte</div>
          </div>
        </div>

        {/* BANDEAU IDENTIFICATION */}
        <div className="grid grid-cols-1 border-b border-[#172d42]/15 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Date", input: <input type="date" value={idDate} onChange={(e) => setIdDate(e.target.value)} className={`${idFieldCls} font-mono`} /> },
            { label: "N° de reçu", input: <input type="text" placeholder="0000" value={idReceipt} onChange={(e) => setIdReceipt(e.target.value)} className={idFieldCls} /> },
            { label: "Nom du client", input: <input type="text" placeholder="Nom complet" value={idClient} onChange={(e) => setIdClient(e.target.value)} className={idFieldCls} /> },
            { label: "Contact", input: <input type="text" placeholder="Téléphone" value={idContact} onChange={(e) => setIdContact(e.target.value)} className={idFieldCls} /> },
          ].map(({ label, input }, i) => (
            <div key={label} className={`border-[#172d42]/15 px-5 py-4 lg:border-r last:border-r-0 ${i > 0 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-t-0" : ""}`}>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f8292]">{label}</label>
              {input}
            </div>
          ))}
        </div>

        {/* HAUT DU CORPS */}
        <div className="px-8 py-7 md:px-11">
          <div className="section-title mb-4 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#172d42]">
            Haut du corps
            <span className="h-px flex-1 bg-[#172d42]/15" />
          </div>
          <MeasureGrid labels={haut} />
        </div>

        {/* BAS DU CORPS */}
        <div className="border-t border-[#172d42]/15 px-8 py-7 md:px-11">
          <div className="section-title mb-4 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#172d42]">
            Bas du corps
            <span className="h-px flex-1 bg-[#172d42]/15" />
          </div>
          <MeasureGrid labels={bas} />
        </div>

        {/* PIECES SPECIFIQUES */}
        <div className="border-t border-[#172d42]/15 px-8 py-7 md:px-11">
          <div className="section-title mb-4 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#172d42]">
            Pièces spécifiques
            <span className="h-px flex-1 bg-[#172d42]/15" />
          </div>
          <MeasureGrid labels={specifiques} />
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f8292]">Modèle souhaité</label>
              <input type="text" placeholder="Ex. robe portefeuille, manches longues" value={modele} onChange={(e) => setModele(e.target.value)} className="w-full rounded border border-[#172d42]/25 bg-transparent px-2.5 py-2 text-[13px] text-[#172d42] focus:border-[#172d42] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f8292]">Remarques</label>
              <textarea placeholder="Détails ou précisions supplémentaires" value={remarques} onChange={(e) => setRemarques(e.target.value)} className="min-h-[56px] w-full resize-y rounded border border-[#172d42]/25 bg-transparent px-2.5 py-2 text-[13px] text-[#172d42] focus:border-[#172d42] focus:outline-none" />
            </div>
          </div>
        </div>

        {/* TISSUS & ECHANTILLONS */}
        <div className="border-t border-[#172d42]/15 px-8 py-7 md:px-11">
          <div className="section-title mb-4 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#172d42]">
            Tissus &amp; échantillons
            <span className="h-px flex-1 bg-[#172d42]/15" />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#172d42]/15 pb-2">
                <label className="text-[12.5px] text-[#40566a]">Nombre de pagnes</label>
                <input type="number" placeholder="0" value={nbPagnes} onChange={(e) => setNbPagnes(e.target.value)} className="w-[120px] border-none bg-transparent text-right font-mono text-[13px] text-[#172d42] focus:outline-none" />
              </div>
              <div className="flex items-center justify-between border-b border-[#172d42]/15 pb-2">
                <label className="text-[12.5px] text-[#40566a]">Tissus déposés</label>
                <input type="text" placeholder="Ex. 3 coupons coton" value={tissusDeposes} onChange={(e) => setTissusDeposes(e.target.value)} className="w-[120px] border-none bg-transparent text-right font-mono text-[13px] text-[#172d42] focus:outline-none" />
              </div>
            </div>
            <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-[#172d42]/25 px-4 py-4 text-center text-[#6f8292] transition-colors hover:border-[#172d42] hover:text-[#172d42]">
              {swatches.length === 0 ? (
                <>
                  <div className="text-[11.5px]">Échantillons tissus</div>
                  <span className="text-[11.5px]">cliquer pour ajouter une photo</span>
                </>
              ) : (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {swatches.map((src, i) => (
                    <img key={`${src.slice(0, 32)}-${i}`} src={src} alt="Échantillon tissu" className="h-11 w-11 rounded border border-[#172d42]/25 object-cover" />
                  ))}
                </div>
              )}
              <input ref={swatchInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onSwatchChange} />
            </label>
          </div>
        </div>

        {/* PAIEMENT */}
        <div className="border-t border-[#172d42]/15 px-8 py-7 md:px-11">
          <div className="section-title mb-4 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#172d42]">
            Paiement
            <span className="h-px flex-1 bg-[#172d42]/15" />
          </div>
          <div className="mb-5 grid grid-cols-1 gap-px border border-[#172d42]/15 bg-[#172d42]/15 sm:grid-cols-3">
            {[
              { label: "Prix", value: pay.price, onChange: (v: string) => setPay((prev) => ({ ...prev, price: v })), placeholder: "0 Ar", remainder: false },
              { label: "Avance", value: pay.advance, onChange: (v: string) => setPay((prev) => ({ ...prev, advance: v })), placeholder: "0 Ar", remainder: false },
              { label: "Reste", value: resteNum > 0 ? `${resteNum}` : "", onChange: () => {}, placeholder: "0 Ar", remainder: true },
            ].map(({ label, value, onChange, placeholder, remainder }) => (
              <div key={label} className={`px-4 py-3.5 ${remainder ? "bg-[#faf6ec]" : "bg-[#fffdf8]"}`}>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6f8292]">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className={`w-full border-none bg-transparent font-mono text-[15px] font-semibold focus:outline-none ${remainder ? "text-[#172d42]" : "text-[#172d42]"}`}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex items-center justify-between border-b border-[#172d42]/15 pb-2">
              <label className="text-[12.5px] text-[#40566a]">Retrait le</label>
              <input type="date" value={retraitDate} onChange={(e) => setRetraitDate(e.target.value)} className="border-none bg-transparent text-right font-mono text-[13px] text-[#172d42] focus:outline-none" />
            </div>
            <div className="flex items-center justify-between border-b border-[#172d42]/15 pb-2">
              <label className="text-[12.5px] text-[#40566a]">Soldé le</label>
              <input type="date" value={soldeDate} onChange={(e) => setSoldeDate(e.target.value)} className="border-none bg-transparent text-right font-mono text-[13px] text-[#172d42] focus:outline-none" />
            </div>
          </div>
        </div>

        {/* SIGNATURE */}
        <div className="grid grid-cols-1 gap-6 border-t border-[#172d42]/15 px-8 py-7 md:grid-cols-2 md:px-11">
          <div className="flex min-h-[90px] flex-col justify-between border border-[#172d42]/15 p-4.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6f8292]">Pris par</span>
            <span className="text-[11px] italic text-[#6f8292]">Signature du membre de l&apos;atelier</span>
          </div>
          <div className="flex min-h-[90px] flex-col justify-between border-[1.5px] border-[#172d42] p-4.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#172d42]">Signature du client</span>
            <span className="text-[11px] italic text-[#6f8292]">Confirme l&apos;exactitude des mesures prises</span>
          </div>
        </div>

        {/* PIED */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#172d42]/15 px-8 py-4 text-[11px] text-[#6f8292] md:px-11">
          <span>JMR Textile © 2026 — Atelier de confection, Madagascar</span>
          <span className="font-mono">fiche de mesures</span>
        </div>
      </div>
    </div>
  );
}