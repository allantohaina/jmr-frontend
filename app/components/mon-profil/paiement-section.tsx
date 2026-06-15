"use client";

import { authAPI } from "@/app/lib";

export function PaiementSection({ id }: { id: string }) {
  async function submitPayment(formData: FormData) {
    const payment_type = formData.get("payment_type") as string;
    const transaction_ref = formData.get("transaction_ref") as string;
    const proof_of_payment = formData.get("proof_of_payment") as File;

    const data = new FormData();
    data.append("payment_type", payment_type);
    data.append("transaction_ref", transaction_ref);
    if (proof_of_payment.size > 0) {
      data.append("proof_of_payment", proof_of_payment);
    }

    console.log("[STORAGE LOCAL] Enregistrement de la preuve de paiement localement.");
    await authAPI.post(`/quotes/${id}/payments`, data);
    alert("Preuve de paiement envoyée avec succès ! (Simulation de stockage local)");
  }

  return (
    <section className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 shadow-sm p-10 max-w-2xl mx-auto" aria-labelledby="paiement-title">
      <header className="mb-8">
        <h1 className="font-headline text-3xl text-[#e5ad46] font-bold" id="paiement-title">
          Confirmer le paiement
        </h1>
        <p className="text-[#eccc90]/60 text-sm mt-2">Transmettez votre preuve de paiement pour valider votre commande.</p>
      </header>

      <form action={submitPayment} className="space-y-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-2 block">Méthode de paiement</span>
            <select 
              className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-4 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all appearance-none" 
              name="payment_type"
            >
              <option value="mvola">MVola</option>
              <option value="orange_money">Orange Money</option>
              <option value="virement">Virement bancaire</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-2 block">Référence de la transaction</span>
            <input
              className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-4 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
              name="transaction_ref"
              placeholder="Ex: T240326.1234.C56789"
              type="text"
              required
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-2 block">Preuve de paiement (Capture d'écran / PDF)</span>
            <div className="relative group">
              <input 
                className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-4 py-3 text-[#eccc90] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#e5ad46]/10 file:text-[#e5ad46] hover:file:bg-[#e5ad46]/20 cursor-pointer transition-all" 
                name="proof_of_payment" 
                type="file" 
                required
              />
            </div>
          </label>
        </div>

        <button 
          className="w-full py-4 bg-[#e5ad46] text-[#1e2a38] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg hover:bg-[#eccc90] transition-all mt-4" 
          type="submit"
        >
          Envoyer la preuve
        </button>
      </form>
    </section>
  );
}
