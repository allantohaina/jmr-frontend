"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  useEffect(() => {
    async function fetchQuotes() {
      const response = await authAPI.get<QuoteRecord[]>("/quotes");
      setQuotes(response.data);
    }

    void fetchQuotes();
  }, []);

  return (
    <div className="px-6 md:px-12 py-10 space-y-10">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="font-headline text-3xl text-[#163526]">Demandes de Devis</h2>
          <p className="text-[#1b1c19]/40 text-xs font-bold uppercase tracking-widest mt-1">Consultation et gestion des demandes clients</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#163526]/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#163526]/5 border-b border-[#163526]/5">
                <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40">Client</th>
                <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40">Contact</th>
                <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40">Message</th>
                <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40">Statut</th>
                <th className="px-8 py-6 font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#1b1c19]/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#163526]/5">
              {quotes.length > 0 ? (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-[#163526]/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-sm text-[#163526]">{quote.name ?? "-"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-[#163526]">{quote.email ?? "-"}</p>
                      <p className="text-[10px] text-[#1b1c19]/40">{quote.phone ?? "-"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-[#163526]/60 line-clamp-1 max-w-xs">{quote.message ?? "-"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-[#163526]/10 text-[#163526] text-[9px] font-bold uppercase rounded-full tracking-widest border border-[#163526]/5">
                        {formatQuoteStatusLabel(quote.status)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        href={`/backoffice/devis/${quote.id}`}
                        className="text-orange-500 hover:text-orange-600 font-bold text-[10px] uppercase tracking-widest"
                      >
                        Gérer
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center">
                    <p className="text-[#1b1c19]/40 italic text-sm font-body">Aucune demande de devis pour le moment.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
