"use client";

import { useState, useRef } from "react";
import { usersAPI, type CSVImportResult } from "@/app/lib/api";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Props = {
  onImported: () => void;
};

export function CSVImport({ onImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImport() {
    if (!file) return;
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const res = await usersAPI.importCSV(file);
      setResult(res.data);
      if (res.data.errors.length === 0) {
        setTimeout(() => onImported(), 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'import.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith(".csv")) {
        setError("Veuillez sélectionner un fichier .csv");
        return;
      }
      setFile(selected);
      setError("");
      setResult(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-[#e5ad46]/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e5ad46]/10">
            <Upload className="h-5 w-5 text-[#e5ad46]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#eccc90]">Import CSV</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#eccc90]/40">
              Importez plusieurs employés d&apos;un seul coup
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-dashed border-[#e5ad46]/20 bg-white/5 p-8 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-[#eccc90]/20" />
          <p className="mb-2 text-sm text-[#eccc90]/60">
            {file ? file.name : "Glissez un fichier CSV ici ou cliquez pour sélectionner"}
          </p>
          <p className="mb-4 text-[10px] uppercase tracking-widest text-[#eccc90]/30">
            Format: email, password, first_name, last_name, phone, role, department, position, hire_date, cin
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-[#e5ad46]/20 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60 transition-colors hover:bg-white/10 hover:text-[#e5ad46]"
          >
            Sélectionner un fichier
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-white/5 p-4">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">
            Format attendu du CSV
          </h3>
          <pre className="overflow-x-auto text-xs text-[#eccc90]/40">
{`email,password,first_name,last_name,phone,role,department,position,hire_date,cin
ahmed@jmrtextile.com,motdepasse123,Ahmed,Benali,0600000001,worker,Production,Couteau,2024-01-15,AB123456
sara@jmrtextile.com,securepass456,Sara,Elouardi,0600000002,worker,Coupe,Surcheuse,2024-03-20,CD789012`}
          </pre>
          <p className="mt-2 text-[10px] text-[#eccc90]/30">
            Colonnes obligatoires: email, password, first_name, last_name. Le rôle par défaut est &quot;worker&quot;.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
        )}

        {result && (
          <div className="mb-6 space-y-3">
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-400">
              {result.message}
            </div>
            {result.created.length > 0 && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                <p className="mb-2 text-sm font-bold text-green-400">
                  <CheckCircle className="mr-1 inline h-4 w-4" />
                  {result.created.length} créé(s)
                </p>
                <ul className="space-y-1 text-xs text-green-400/70">
                  {result.created.map((c) => (
                    <li key={c.line}>Ligne {c.line}: {c.email} ({c.role})</li>
                  ))}
                </ul>
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="mb-2 text-sm font-bold text-red-400">
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                  {result.errors.length} erreur(s)
                </p>
                <ul className="space-y-1 text-xs text-red-400/70">
                  {result.errors.map((e) => (
                    <li key={e.line}>Ligne {e.line} ({e.email}): {e.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e5ad46] py-3 text-xs font-bold uppercase tracking-[0.3em] text-[#1e2a38] transition-all hover:bg-[#d4a03f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Import en cours...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Lancer l&apos;import
            </>
          )}
        </button>
      </div>
    </div>
  );
}
