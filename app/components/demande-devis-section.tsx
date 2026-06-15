"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { authAPI, validateEmail, validateName, ValidationError } from "@/app/lib";

function buildQuoteRequestPayload(formData: FormData) {
  const apiFormData = new FormData();
  const textFields = [
    "name",
    "email",
    "phone",
    "message",
    "request_type",
    "tissu",
    "coupe",
    "gabarit",
    "style",
    "grammage",
    "tailles",
    "quantite",
    "finitions",
    "delai_souhaite",
    "modify_code",
    "category",
  ] as const;

  for (const key of textFields) {
    const value = formData.get(key);
    apiFormData.append(key, typeof value === "string" ? value : "");
  }

  const files = formData.getAll("technical_files");

  files.forEach((file, index) => {
    if (file instanceof File && file.size > 0) {
      apiFormData.append(`technical_files[${index}]`, file);
    }
  });

  return apiFormData;
}

function QuoteFormContent() {
  const searchParams = useSearchParams();
  const modifyCode = searchParams.get("modify");
  const requestTypeDefault = modifyCode ? "edit" : "new";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  async function handleQuoteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmitError("");
    setValidationErrors([]);

    const formData = new FormData(event.currentTarget);

    // CLIENT-SIDE VALIDATION - Always validate user input first!
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    
    const errors: ValidationError[] = [
      ...validateName(name),
      ...validateEmail(email)
    ];

    if (!message || message.trim().length < 20) {
      errors.push({ 
        field: 'message', 
        message: 'Please provide more details (at least 20 characters)' 
      });
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = buildQuoteRequestPayload(formData);
      await authAPI.post("/quotes", payload);
      window.location.assign("/suivi-projet?view=tracking&step=2");
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Impossible d'envoyer votre demande pour le moment.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1e2a38] pt-32 pb-24">
      <section className="max-w-7xl mx-auto px-6" id="demande-devis-form" aria-labelledby="demande-devis-form-title">
        <header className="text-center mb-16">
          <span className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">Demande de devis</span>
          <h2 className="font-headline text-5xl md:text-6xl text-[#e5ad46] font-bold mb-6" id="demande-devis-form-title">
            {modifyCode ? `Modification du devis ${modifyCode}` : "Parlons de votre prochain projet textile"}
          </h2>
          <p className="text-[#eccc90]/60 text-lg max-w-3xl mx-auto leading-relaxed">
            {modifyCode
              ? "Precisez ici les modifications souhaitees. Choisissez edit pour une retouche ou add pour un ajout. La version precedente reste verrouillee et nous creerons une nouvelle demande signee."
              : "Remplissez le formulaire pour nous faire part de votre projet. Nous revenons vers vous avec une estimation claire et un suivi adapte a votre besoin."}
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[#25303a] text-[#eccc90] rounded-[2.5rem] p-10 shadow-xl border border-[#e5ad46]/10 relative overflow-hidden">
              {/* Decorative background logo */}
              <div className="absolute right-[-20%] bottom-[-20%] opacity-[0.03] pointer-events-none">
                <img src="/navbar/logo.svg" alt="" className="w-64 h-64 invert" />
              </div>

              <span className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">Preparation rapide</span>
              <h3 className="font-headline text-3xl font-bold mb-6 text-[#e5ad46]">Ce qu&apos;il nous faut</h3>
              <p className="text-[#eccc90]/70 mb-8 text-sm leading-relaxed">Quelques informations suffisent pour etablir un devis precis et vous repondre rapidement.</p>

              <ul className="space-y-6 mb-8 relative z-10">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#e5ad46]/10 flex items-center justify-center mt-0.5">
                    <span className="material-symbols-outlined text-xs text-[#e5ad46]">check</span>
                  </div>
                  <span className="text-sm font-medium">Type de produit, style et finitions souhaitees.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#e5ad46]/10 flex items-center justify-center mt-0.5">
                    <span className="material-symbols-outlined text-xs text-[#e5ad46]">check</span>
                  </div>
                  <span className="text-sm font-medium">Quantites estimees, tailles et informations techniques utiles.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#e5ad46]/10 flex items-center justify-center mt-0.5">
                    <span className="material-symbols-outlined text-xs text-[#e5ad46]">check</span>
                  </div>
                  <span className="text-sm font-medium">Delai souhaite, contraintes de production et niveau de finition attendu.</span>
                </li>
              </ul>

              <div className="h-px bg-[#e5ad46]/10 my-8"></div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-[#e5ad46]/40 italic">
                Plus les informations sont precises, plus le devis sera fiable.
              </p>
            </div>

            <div className="bg-[#e5ad46]/5 border border-[#e5ad46]/10 rounded-[2rem] p-8">
              <div className="flex items-center gap-4 mb-4 text-[#e5ad46]">
                <span className="material-symbols-outlined">shield</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Confidentialité garantie</span>
              </div>
              <p className="text-[#eccc90]/50 text-xs leading-relaxed">
                Vos documents techniques et vos idées sont protégés. JMR Textile s&apos;engage à ne jamais partager vos concepts sans votre accord.
              </p>
            </div>
          </div>

          <form className="lg:col-span-2 bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 p-8 md:p-12 shadow-2xl" onSubmit={handleQuoteSubmit}>
            <input type="hidden" name="modify_code" value={modifyCode || ""} />
            {submitError ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100 mb-8" role="alert">
                {submitError}
              </div>
            ) : null}
            {validationErrors.length > 0 ? (
              <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 px-5 py-4 mb-8" role="alert">
                <p className="text-orange-200 font-bold mb-3">Please fix the following errors:</p>
                <ul className="space-y-2">
                  {validationErrors.map((err, i) => (
                    <li key={i} className="text-orange-100 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-300 text-sm">warning</span>
                      <strong>{err.field}:</strong> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <label className="md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Type de produit (Categorie)</span>
                <div className="relative">
                  <select
                    name="category"
                    className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Selectionnez une categorie</option>
                    <option value="pantalon">Pantalon</option>
                    <option value="jupe">Jupe</option>
                    <option value="shirt">T-shirt / Debardeur</option>
                    <option value="polo">Polo</option>
                    <option value="chemise">Chemise / Chemisier</option>
                    <option value="veste">Veste / Blazer</option>
                    <option value="manteau">Manteau / Parka</option>
                    <option value="robe">Robe</option>
                    <option value="sweat">Sweat-shirt / Hoodie</option>
                    <option value="short">Short / Bermuda</option>
                    <option value="pull">Pull / Cardigan</option>
                    <option value="sous-vetement">Sous-vetements / Lingerie</option>
                    <option value="accessoire">Accessoires (Echarpes, Bonnets, etc.)</option>
                    <option value="uniforme">Uniforme / Workwear</option>
                    <option value="sport">Sportswear</option>
                    <option value="enfant">Enfant / Bebe</option>
                    <option value="autre">Autre projet sur-mesure</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#e5ad46] pointer-events-none">expand_more</span>
                </div>
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Nom complet</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Votre nom et prenom"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                  required
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="contact@entreprise.com"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                  required
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Telephone</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+261 34 00 000 00"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Tissu</span>
                <input
                  name="tissu"
                  type="text"
                  placeholder="Ex: coton, jersey, denim"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Coupe</span>
                <input
                  name="coupe"
                  type="text"
                  placeholder="Ex: droite, ajuste, oversize"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Gabarit</span>
                <input
                  name="gabarit"
                  type="text"
                  placeholder="Ex: standard, sur-mesure"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Style</span>
                <input
                  name="style"
                  type="text"
                  placeholder="Ex: casual, workwear, premium"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Grammage</span>
                <input
                  name="grammage"
                  type="text"
                  placeholder="Ex: 180 g/m2"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Tailles</span>
                <input
                  name="tailles"
                  type="text"
                  placeholder="Ex: XS-XL, 36-44"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Quantité</span>
                <input
                  name="quantite"
                  type="text"
                  placeholder="Ex: 50 pièces"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Finitions</span>
                <input
                  name="finitions"
                  type="text"
                  placeholder="Ex: broderie, impression, etiquette"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Delai souhaite</span>
                <input
                  name="delai_souhaite"
                  type="text"
                  placeholder="Ex: avant fin avril"
                  className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Genre de demande</span>
                <div className="relative">
                  <select
                    name="request_type"
                    defaultValue={requestTypeDefault}
                    className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="new">Nouveau projet</option>
                    <option value="edit">Edit / modification</option>
                    <option value="add">Ajout a un dossier</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#e5ad46] pointer-events-none">expand_more</span>
                </div>
                {modifyCode ? (
                  <p className="text-[10px] text-[#eccc90]/40 mt-2 uppercase tracking-widest">
                    Edit = ce qu&apos;il faut modifier. Add = ce qu&apos;il faut ajouter.
                  </p>
                ) : null}
              </label>

              <label className="md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">
                  {modifyCode ? "Quoi modifier ou ajouter ?" : "Message / Détails du projet"}
                </span>
                <textarea
                  name="message"
                  placeholder={
                    modifyCode
                      ? "Decrivez precisement ce qu'il faut changer, ajouter ou reprendre."
                      : "Décrivez votre projet en quelques lignes..."
                  }
                  className="w-full h-40 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] p-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20 resize-none"
                  rows={7}
                  required
                />
              </label>

              <div className="md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Fichiers techniques (Patrons, Fiches techniques, Photos)</span>
                <div className="relative group">
                  <input
                    name="technical_files"
                    type="file"
                    multiple
                    className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 py-3 text-[#eccc90] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#e5ad46]/10 file:text-[#e5ad46] hover:file:bg-[#e5ad46]/20 cursor-pointer transition-all"
                  />
                  <p className="text-[10px] text-[#eccc90]/40 mt-2 uppercase tracking-widest">Formats acceptes : PDF, PNG, JPG (Max 10Mo)</p>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-12 py-5 bg-[#e5ad46] text-[#1e2a38] text-xs font-bold uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-[#e5ad46]/10 hover:bg-[#eccc90] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#1e2a38]/30 border-t-[#1e2a38] rounded-full animate-spin"></span>
                  Envoi en cours...
                </>
              ) : (
                <>
                  Envoyer ma demande
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export function DemandeDevisSection() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <QuoteFormContent />
    </Suspense>
  );
}
