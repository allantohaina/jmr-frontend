"use client";

import { authAPI } from "../../lib/api";

export function PaiementSection({ id }: { id: string }) {
  async function submitPayment(formData: FormData) {
    const payment_type = formData.get("payment_type") as string;
    const transaction_ref = formData.get("transaction_ref") as string;
    const proof_of_payment = formData.get("proof_of_payment") as File;

    const data = new FormData();
    data.append("payment_type", payment_type);
    data.append("transaction_ref", transaction_ref);
    data.append("proof_of_payment", proof_of_payment);

    await authAPI.post(`/quotes/${id}/payments`, data);
  }

  return (
    <section className="access-page ui-section-shell" aria-labelledby="paiement-title">
      <header className="access-page__header ui-section-header">
        <h1 className="ui-section-title" id="paiement-title">
          Paiement
        </h1>
        <span className="access-page__underline ui-section-underline" aria-hidden="true" />
      </header>

      <div className="access-page__panel ui-panel-shell">
        <form action={submitPayment} className="access-page__card ui-soft-card">
          <div className="flex flex-col gap-4">
            <select className="rounded border bg-white/50 p-2" name="payment_type">
              <option value="mvola">MVola</option>
              <option value="orange_money">Orange Money</option>
              <option value="virement">Virement bancaire</option>
            </select>
            <input
              className="rounded border bg-white/50 p-2"
              name="transaction_ref"
              placeholder="Reference de la transaction"
              type="text"
            />
            <input className="rounded border bg-white/50 p-2" name="proof_of_payment" type="file" />
          </div>
          <button className="access-page__action access-page__action--primary mt-4" type="submit">
            Envoyer
          </button>
        </form>
      </div>
    </section>
  );
}
