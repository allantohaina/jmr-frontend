"use client";

import { useEffect, useState } from "react";
import { authAPI, type QuoteRecord } from "../../lib/api";

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
    <section className="access-page ui-section-shell" aria-labelledby="devis-title">
      <header className="access-page__header ui-section-header">
        <h1 className="ui-section-title" id="devis-title">
          Demandes de devis
        </h1>
        <span className="access-page__underline ui-section-underline" aria-hidden="true" />
      </header>

      <div className="access-page__panel ui-panel-shell">
        <div className="access-page__card ui-soft-card">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">Nom</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Telephone</th>
                <th className="p-2 text-left">Message</th>
                <th className="p-2 text-left">Statut</th>
                <th className="p-2 text-left">Montant</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="p-2">{quote.name ?? "-"}</td>
                  <td className="p-2">{quote.email ?? "-"}</td>
                  <td className="p-2">{quote.phone ?? "-"}</td>
                  <td className="p-2">{quote.message ?? "-"}</td>
                  <td className="p-2">{quote.status ?? "-"}</td>
                  <td className="p-2">{quote.amount ?? "-"}</td>
                  <td className="p-2">
                    <a className="text-blue-600 hover:underline" href={`/admin/devis/${quote.id}`}>
                      Modifier
                    </a>
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
