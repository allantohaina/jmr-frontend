"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ChevronRight, FileText, Loader2 } from "lucide-react";
import { authAPI, type QuoteRecord } from "@/app/lib";

function formatQuoteStatusLabel(status?: string | null) {
  switch (status) {
    case "draft":
      return "Brouillon";
    case "sent":
      return "Envoye";
    case "accepted":
      return "Accepte";
    case "production":
      return "Production";
    case "rejected":
      return "Refuse";
    default:
      return status ?? "Nouveau";
  }
}

export function DevisSection() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchQuotes() {
      setIsLoading(true);
      setError("");

      try {
        const response = await authAPI.get<QuoteRecord[]>("/quotes");

        if (active) {
          setQuotes(response.data);
        }
      } catch (fetchError) {
        if (active) {
          setError(
            fetchError instanceof Error && fetchError.message
              ? fetchError.message
              : "Impossible de charger les demandes de devis.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void fetchQuotes();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline text-2xl text-[#163526] sm:text-3xl">Demandes de Devis</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#1b1c19]/40">
            Consultation et gestion des demandes clients
          </p>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-[2rem] border border-[#163526]/5 bg-white py-10 md:py-16 text-[#163526]/50">
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          Chargement des devis...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {quotes.length > 0 ? (
              quotes.map((quote) => (
                <article key={quote.id} className="rounded-2xl border border-[#163526]/5 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#163526]">{quote.name ?? "-"}</p>
                      <p className="truncate text-xs text-[#163526]/60">{quote.email ?? "-"}</p>
                      <p className="truncate text-[10px] text-[#1b1c19]/40">{quote.phone ?? "-"}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#163526]/5 bg-[#163526]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#163526]">
                      {formatQuoteStatusLabel(quote.status)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-6 text-[#163526]/60">{quote.message ?? "-"}</p>
                  <Link
                    href={`/backoffice/devis/edit?id=${quote.id}`}
                    className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-orange-500"
                  >
                    Gerer <ChevronRight className="h-4 w-4" />
                  </Link>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#163526]/10 bg-white p-8 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-[#163526]/20" />
                <p className="text-sm italic text-[#1b1c19]/40">Aucune demande de devis pour le moment.</p>
              </div>
            )}
          </div>

          <div className="hidden overflow-hidden rounded-[2rem] border border-[#163526]/5 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#163526]/5 bg-[#163526]/5">
                    <th className="px-8 py-6 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c19]/40">
                      Client
                    </th>
                    <th className="px-8 py-6 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c19]/40">
                      Contact
                    </th>
                    <th className="px-8 py-6 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c19]/40">
                      Message
                    </th>
                    <th className="px-8 py-6 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c19]/40">
                      Statut
                    </th>
                    <th className="px-8 py-6 text-right font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c19]/40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#163526]/5">
                  {quotes.length > 0 ? (
                    quotes.map((quote) => (
                      <tr key={quote.id} className="group transition-colors hover:bg-[#163526]/[0.02]">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-[#163526]">{quote.name ?? "-"}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs text-[#163526]">{quote.email ?? "-"}</p>
                          <p className="text-[10px] text-[#1b1c19]/40">{quote.phone ?? "-"}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="line-clamp-1 max-w-xs text-xs text-[#163526]/60">{quote.message ?? "-"}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="rounded-full border border-[#163526]/5 bg-[#163526]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#163526]">
                            {formatQuoteStatusLabel(quote.status)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Link
                            href={`/backoffice/devis/edit?id=${quote.id}`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-600"
                          >
                            Gerer
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-12 text-center" colSpan={5}>
                        <p className="font-body text-sm italic text-[#1b1c19]/40">
                          Aucune demande de devis pour le moment.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
