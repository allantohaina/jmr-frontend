"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, UploadCloud } from "lucide-react";
import { authAPI } from "@/app/lib";
import { getErrorMessage } from "@/app/lib/errors";

export function PaiementSection({ id }: { id: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; message: string } | null>(null);

  async function submitPayment(formData: FormData) {
    const paymentType = String(formData.get("payment_type") ?? "");
    const transactionRef = String(formData.get("transaction_ref") ?? "");
    const proofOfPayment = formData.get("proof_of_payment");

    const errors: string[] = [];
    if (!paymentType) errors.push("La méthode de paiement est requise.");
    if (transactionRef.trim().length < 5) errors.push("La référence de la transaction doit comporter au moins 5 caractères.");
    if (!proofOfPayment || !(proofOfPayment instanceof File) || proofOfPayment.size === 0) {
      errors.push("La preuve de paiement est requise (PDF, PNG, JPG ou WEBP).");
    } else {
      if (proofOfPayment.size > 10 * 1024 * 1024) errors.push("Le fichier ne doit pas dépasser 10 Mo.");
      const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!allowed.includes(proofOfPayment.type)) errors.push("Format non autorisé. Utilisez PDF, PNG, JPG ou WEBP.");
    }
    if (errors.length > 0) {
      throw new Error(errors.join(" "));
    }

    const data = new FormData();
    data.append("payment_type", paymentType);
    data.append("transaction_ref", transactionRef.trim());

    if (proofOfPayment instanceof File && proofOfPayment.size > 0) {
      data.append("proof_of_payment", proofOfPayment);
    }

    await authAPI.post(`/quotes/${id}/payments`, data);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      await submitPayment(new FormData(event.currentTarget));
      setNotice({
        tone: "success",
        message: "Preuve de paiement envoyee avec succes.",
      });
      event.currentTarget.reset();
    } catch (error) {
      setNotice({ tone: "danger", message: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="paiement-title"
      className="mx-auto max-w-2xl rounded-[2rem] border border-[#e5ad46]/5 bg-[#25303a] p-5 shadow-sm sm:p-8 md:rounded-[2.5rem] md:p-10"
    >
      <header className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5ad46]/10 text-[#e5ad46]">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h1 className="font-headline text-2xl font-bold text-[#e5ad46] sm:text-3xl" id="paiement-title">
          Confirmer le paiement
        </h1>
        <p className="mt-2 text-sm text-[#eccc90]/60">
          Transmettez votre preuve de paiement pour valider votre commande.
        </p>
      </header>

      {notice ? (
        <div
          className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
            notice.tone === "success"
              ? "border-green-400/20 bg-green-400/10 text-green-100"
              : "border-red-400/20 bg-red-400/10 text-red-100"
          }`}
          role="alert"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {notice.message}
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">
              Methode de paiement
            </span>
            <div className="relative">
              <select
                className="h-14 w-full appearance-none rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-4 pr-12 font-medium text-[#eccc90] outline-none transition-all focus:border-[#e5ad46]"
                name="payment_type"
                required
              >
                <option value="mvola">MVola</option>
                <option value="orange_money">Orange Money</option>
                <option value="virement">Virement bancaire</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#e5ad46]" />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">
              Reference de la transaction
            </span>
            <input
              className="h-14 w-full rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-4 font-medium text-[#eccc90] outline-none transition-all placeholder:text-[#eccc90]/20 focus:border-[#e5ad46]"
              name="transaction_ref"
              placeholder="Ex: T240326.1234.C56789"
              required
              type="text"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">
              Preuve de paiement
            </span>
            <input
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="h-14 w-full cursor-pointer rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-4 py-3 text-[#eccc90] transition-all file:mr-4 file:rounded-full file:border-0 file:bg-[#e5ad46]/10 file:px-4 file:py-1 file:text-[10px] file:font-bold file:uppercase file:text-[#e5ad46] hover:file:bg-[#e5ad46]/20"
              name="proof_of_payment"
              required
              type="file"
            />
          </label>
        </div>

        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#e5ad46] py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1e2a38] shadow-lg transition-all hover:bg-[#eccc90] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {isSubmitting ? "Envoi en cours..." : "Envoyer la preuve"}
        </button>
      </form>
    </section>
  );
}
