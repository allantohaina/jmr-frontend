"use client";

import { authAPI, type QuoteRecord } from "../../lib/api";

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
    <section className="access-page ui-section-shell" aria-labelledby="devis-title">
      <header className="access-page__header ui-section-header">
        <h1 className="ui-section-title" id="devis-title">
          Mes devis
        </h1>
        <span className="access-page__underline ui-section-underline" aria-hidden="true" />
      </header>

      <div className="access-page__panel ui-panel-shell">
        <div className="access-page__card ui-soft-card">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">Message</th>
                <th className="p-2 text-left">Statut</th>
                <th className="p-2 text-left">Montant</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="p-2">{quote.message ?? "-"}</td>
                  <td className="p-2">{quote.status ?? "-"}</td>
                  <td className="p-2">{quote.amount ?? "-"}</td>
                  <td className="p-2">
                    {quote.status === "sent" ? (
                      <div className="flex gap-2">
                        <button className="text-green-600 hover:underline" onClick={() => acceptQuote(quote.id)}>
                          Accepter
                        </button>
                        <button className="text-red-600 hover:underline" onClick={() => rejectQuote(quote.id)}>
                          Refuser
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
