"use client";

import { useState } from "react";
import { Check, PenLine } from "lucide-react";
import type { DocumentSignature } from "./types";

export function AdminSignaturePanel({
  initialSignature,
  onApprove,
}: {
  initialSignature?: DocumentSignature;
  onApprove?: (signature: DocumentSignature) => void;
}) {
  const [name, setName] = useState(initialSignature?.name ?? "");
  const [confirmed, setConfirmed] = useState(Boolean(initialSignature));
  const [signature, setSignature] = useState<DocumentSignature | undefined>(initialSignature);

  function approve() {
    const next = { name: name.trim(), signedAt: new Date() };
    if (!next.name) return;
    setSignature(next);
    setConfirmed(true);
    onApprove?.(next);
  }

  if (signature) return <section className="border border-emerald-700/20 bg-emerald-50 p-5 text-[#172d42]"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-800"><Check className="h-4 w-4" /> Approbation interne enregistrée</div><p className="mt-4 font-serif text-2xl italic">{signature.name}</p><p className="mt-1 text-xs text-slate-600">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(signature.signedAt))}</p></section>;

  return <section className="border border-[#172d42]/15 bg-[#fffdf8] p-5 text-[#172d42]"><div className="flex gap-3"><PenLine className="mt-0.5 h-5 w-5 text-[#a67428]" /><div><h2 className="font-serif text-xl font-bold">Validation administrative</h2><p className="mt-1 text-xs leading-5 text-slate-600">Cette validation est une approbation interne, et non une signature électronique qualifiée.</p></div></div><label className="mt-5 block text-[10px] font-bold uppercase tracking-[.16em] text-slate-600">Nom du signataire<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Mario Rossi" className="mt-2 w-full border border-[#172d42]/20 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a67428] focus:ring-2 focus:ring-[#e5ad46]/25" /></label><label className="mt-4 flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-700"><input checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" className="mt-1 accent-[#a67428]" />Je confirme avoir vérifié ce document et l’approuver au nom de JMR Textile.</label><button type="button" disabled={!name.trim() || !confirmed} onClick={approve} className="mt-5 inline-flex items-center gap-2 bg-[#172d42] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#a67428] disabled:cursor-not-allowed disabled:opacity-45"><PenLine className="h-4 w-4" /> Signer l’approbation</button></section>;
}
