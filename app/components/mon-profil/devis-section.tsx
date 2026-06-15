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
    <section className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 shadow-sm overflow-hidden" aria-labelledby="devis-title">
      <header className="px-10 py-8 border-b border-[#e5ad46]/5 flex justify-between items-center">
        <h2 className="font-headline text-2xl text-[#e5ad46] font-bold" id="devis-title">
          Mes devis
        </h2>
      </header>

      <div className="p-4 md:p-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5ad46]/10">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">Message</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">Statut</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">Montant</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ad46]/5">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-[#e5ad46]/5 transition-colors group">
                  <td className="p-4 text-[#eccc90] text-sm">{quote.message ?? "-"}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        quote.status === 'accepted' || quote.status === 'production' 
                        ? 'bg-[#e5ad46] text-[#1e2a38]' 
                        : 'bg-[#e5ad46]/10 text-[#e5ad46]'
                      }`}>
                        {formatQuoteStatusLabel(quote.status)}
                      </span>
                      {quote.status === "accepted" || quote.status === "production" ? (
                        <p className="text-[10px] text-[#eccc90]/40 leading-tight max-w-[200px] mt-2">
                          Version signee et verrouillee. Les corrections ou ajouts passent par une nouvelle demande.
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-4 font-headline font-bold text-[#e5ad46] text-lg">{quote.amount ?? "-"}</td>
                  <td className="p-4">
                    {quote.status === "sent" ? (
                      <div className="flex gap-3">
                        <button 
                          className="px-4 py-2 bg-[#e5ad46] text-[#1e2a38] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#eccc90] transition-all shadow-lg shadow-[#e5ad46]/10" 
                          onClick={() => acceptQuote(quote.id)}
                        >
                          Accepter
                        </button>
                        <button 
                          className="px-4 py-2 bg-transparent border border-[#e5ad46]/20 text-[#e5ad46] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#e5ad46]/10 transition-all" 
                          onClick={() => rejectQuote(quote.id)}
                        >
                          Refuser
                        </button>
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-[#e5ad46]/20">check_circle</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quotes.length === 0 && (
            <div className="py-20 text-center">
              <span className="material-symbols-outlined text-5xl text-[#e5ad46]/10 mb-4">description</span>
              <p className="text-[#eccc90]/40 text-sm font-medium">Aucun devis disponible pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
