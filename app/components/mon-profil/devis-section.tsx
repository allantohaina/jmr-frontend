"use client";

import { authAPI, type QuoteRecord } from "@/app/lib";

function formatQuoteStatusLabel(status?: string | null) {
  switch (status) {
    case "accepted":
      return "Valide";
    case "production":
      return "En production";
    case "rejected":
      return "Refuse";
    case "sent":
      return "En attente";
    default:
      return status ?? "-";
  }
}

export function DevisSection({ quotes }: { quotes: QuoteRecord[] }) {
  async function acceptQuote(id: QuoteRecord["id"]) {
    await authAPI.put(`/quotes/${id}`, { status: "accepted" });
    window.location.reload();
  }

  async function rejectQuote(id: QuoteRecord["id"]) {
    await authAPI.put(`/quotes/${id}`, { status: "rejected" });
    window.location.reload();
  }

  return (
    <section className="bg-[#25303a] rounded-[2.5rem] border border-[#FFB42D]/5 shadow-sm overflow-hidden" aria-labelledby="devis-title">
      <header className="px-10 py-8 border-b border-[#FFB42D]/5 flex justify-between items-center">
        <h2 className="font-headline text-2xl text-[#FFB42D] font-bold" id="devis-title">
          Mes devis
        </h2>
      </header>

      <div className="p-4 md:p-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#FFB42D]/10">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#FFB42D]/40">Message</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#FFB42D]/40">Statut</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#FFB42D]/40">Montant</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#FFB42D]/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFB42D]/5">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-[#FFB42D]/5 transition-colors group">
                  <td className="p-4 text-[#FFB42D] text-sm">{quote.message ?? "-"}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        quote.status === 'accepted' || quote.status === 'production' 
                        ? 'bg-[#FFB42D] text-[#1e2a38]' 
                        : 'bg-[#FFB42D]/10 text-[#FFB42D]'
                      }`}>
                        {formatQuoteStatusLabel(quote.status)}
                      </span>
                      {quote.status === "accepted" || quote.status === "production" ? (
                        <p className="text-[10px] text-[#FFB42D]/40 leading-tight max-w-[200px] mt-2">
                          Version signee et verrouillee. Les corrections ou ajouts passent par une nouvelle demande.
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-4 font-headline font-bold text-[#FFB42D] text-lg">{quote.amount ?? "-"}</td>
                  <td className="p-4">
                    {quote.status === "sent" ? (
                      <div className="flex gap-3">
                        <button 
                          className="px-4 py-2 bg-[#FFB42D] text-[#1e2a38] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#FFB42D] transition-all shadow-lg shadow-[#FFB42D]/10" 
                          onClick={() => acceptQuote(quote.id)}
                        >
                          Accepter
                        </button>
                        <button 
                          className="px-4 py-2 bg-transparent border border-[#FFB42D]/20 text-[#FFB42D] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#FFB42D]/10 transition-all" 
                          onClick={() => rejectQuote(quote.id)}
                        >
                          Refuser
                        </button>
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-[#FFB42D]/20">check_circle</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quotes.length === 0 && (
            <div className="py-12 md:py-20 text-center">
              <span className="material-symbols-outlined text-5xl text-[#FFB42D]/10 mb-4">description</span>
              <p className="text-[#FFB42D]/40 text-sm font-medium">Aucun devis disponible pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
