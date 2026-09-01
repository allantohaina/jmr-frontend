"use client";

import React, { useState } from "react";
import { exportsAPI } from "@/app/lib/api";
import { FileDown, Loader } from "lucide-react";

const EXPORTS = [
  { key: "devis" as const, label: "Devis / Cotations", desc: "Export CSV des devis avec montants et statuts." },
  { key: "commandes" as const, label: "Commandes", desc: "Export CSV des commandes et statuts de production." },
  { key: "paiements" as const, label: "Paiements", desc: "Export CSV des paiements reçus et vérifiés." },
];

export default function ExportsPage() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = async (key: "devis" | "commandes" | "paiements", label: string) => {
    setBusy(key);
    setError(null);
    try {
      const res = await exportsAPI[key]();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.assign(`/admin-login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || data?.error || `Export impossible (${res.status})`);
      }
      const cd = res.headers.get("Content-Disposition") || "";
      const m = /filename="?([^"]+)"?/.exec(cd);
      const serverFilename = m ? m[1] : `export-${key}-${new Date().toISOString().slice(0, 10)}.csv`;
      const safeLabel = serverFilename.includes("/") || serverFilename.includes("\\") ? `export-${key}-${new Date().toISOString().slice(0, 10)}.csv` : serverFilename;
      const blob = await res.blob();
      // si blob est JSON d'erreur déguisé en 200
      if (blob.type.includes("json")) {
        const txt = await blob.text();
        try {
          const j = JSON.parse(txt);
          throw new Error(j.message || j.error || "Export impossible");
        } catch {}
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = safeLabel;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Délai dépassé (15s). Réessayez.");
      } else {
        setError(err instanceof Error ? err.message : "Erreur");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="px-6 md:px-12 py-10 space-y-8">
      <div className="px-2">
        <h2 className="font-headline text-3xl text-[#eccc90]">Exports comptables</h2>
        <p className="text-[#eccc90]/40 text-xs font-bold uppercase tracking-widest mt-1">Rapports CSV · JMR Atelier</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-700 font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {EXPORTS.map((e) => (
          <div key={e.key} className="bg-[#25303a] rounded-2xl border border-[#e5ad46]/10 p-6 shadow-sm flex flex-col">
            <p className="font-headline text-lg text-[#eccc90]">{e.label}</p>
            <p className="text-xs text-[#eccc90]/50 mt-1 flex-1">{e.desc}</p>
            <button
              onClick={() => download(e.key, e.label)}
              disabled={busy !== null}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#163526] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] hover:bg-[#1e4234] transition-colors disabled:opacity-50"
            >
              {busy === e.key ? <Loader className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              Télécharger CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}