"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { sendQuoteRequest } from "@/app/actions";

function QuoteFormContent() {
  const searchParams = useSearchParams();
  const modifyCode = searchParams.get("modify");

  return (
    <div className="quote-page pt-32">
      <section className="quote-page__content" id="demande-devis-form" aria-labelledby="demande-devis-form-title">
        <header className="quote-page__section-header">
          <span className="quote-page__section-kicker">Demande de devis</span>
          <h2 className="quote-page__section-title" id="demande-devis-form-title">
            {modifyCode ? `Modification du devis ${modifyCode}` : "Parlons de votre prochain projet textile"}
          </h2>
          <p className="quote-page__section-lead">
            {modifyCode 
              ? "Précisez ici les modifications souhaitées. Cela générera une nouvelle demande basée sur votre devis existant."
              : "Remplissez le formulaire pour nous faire part de votre projet. Nous revenons vers vous avec une estimation claire et un suivi adapte a votre besoin."}
          </p>
        </header>

        <div className="quote-page__panel-shell ui-panel-shell">
          <div className="quote-page__panel">
            <div className="quote-page__intro text-white rounded-[2.5rem] p-10 shadow-xl border border-[#ce812f]/20">
              <span className="text-[#ce812f] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">Preparation rapide</span>
              <h3 className="font-headline text-3xl font-bold mb-6">Ce qu&apos;il nous faut</h3>
              <p className="text-white/70 mb-8">Quelques informations suffisent pour etablir un devis precis et vous repondre rapidement.</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ce812f] mt-2 flex-shrink-0"></span>
                  <span className="text-sm">Type de produit, style et finitions souhaitees.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ce812f] mt-2 flex-shrink-0"></span>
                  <span className="text-sm">Quantites estimees, tailles et informations techniques utiles.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ce812f] mt-2 flex-shrink-0"></span>
                  <span className="text-sm">Delai souhaite, contraintes de production et niveau de finition attendu.</span>
                </li>
              </ul>

              <div className="h-px bg-white/10 my-8"></div>

              <p className="text-xs italic text-white/50">
                Plus les informations sont precises, plus le devis sera fiable.
              </p>
            </div>

            <form className="quote-page__form ui-soft-card project-request-form" action={sendQuoteRequest}>
              <input type="hidden" name="modify_code" value={modifyCode || ""} />
              <div className="project-request-form__grid">
                <label className="project-request-form__field project-request-form__field--full">
                  <span className="project-request-form__label">Type de produit (Catégorie)</span>
                  <select
                    name="category"
                    className="project-request-form__input appearance-none"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 -960 960 960' width='24'%3E%3Cpath d='M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '24px'
                    }}
                    required
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    <option value="pantalon">Pantalon</option>
                    <option value="jupe">Jupe</option>
                    <option value="shirt">T-shirt / Débardeur</option>
                    <option value="polo">Polo</option>
                    <option value="chemise">Chemise / Chemisier</option>
                    <option value="veste">Veste / Blazer</option>
                    <option value="manteau">Manteau / Parka</option>
                    <option value="robe">Robe</option>
                    <option value="sweat">Sweat-shirt / Hoodie</option>
                    <option value="short">Short / Bermuda</option>
                    <option value="pull">Pull / Cardigan</option>
                    <option value="sous-vetement">Sous-vêtements / Lingerie</option>
                    <option value="accessoire">Accessoires (Écharpes, Bonnets, etc.)</option>
                    <option value="uniforme">Uniforme / Workwear</option>
                    <option value="sport">Sportswear</option>
                    <option value="enfant">Enfant / Bébé</option>
                    <option value="autre">Autre projet sur-mesure</option>
                  </select>
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Nom complet</span>
                  <input
                    name="name"
                    type="text"
                    placeholder="Votre nom et prenom"
                    className="project-request-form__input"
                    required
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Email</span>
                  <input
                    name="email"
                    type="email"
                    placeholder="contact@entreprise.com"
                    className="project-request-form__input"
                    required
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Telephone</span>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+261 34 00 000 00"
                    className="project-request-form__input"
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Tissu</span>
                  <input
                    name="tissu"
                    type="text"
                    placeholder="Ex: coton, jersey, denim"
                    className="project-request-form__input"
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Coupe</span>
                  <input
                    name="coupe"
                    type="text"
                    placeholder="Ex: droite, ajuste, oversize"
                    className="project-request-form__input"
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Gabarit</span>
                  <input
                    name="gabarit"
                    type="text"
                    placeholder="Ex: standard, sur-mesure"
                    className="project-request-form__input"
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Style</span>
                  <input
                    name="style"
                    type="text"
                    placeholder="Ex: casual, workwear, premium"
                    className="project-request-form__input"
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Grammage</span>
                  <input
                    name="grammage"
                    type="text"
                    placeholder="Ex: 180 g/m2"
                    className="project-request-form__input"
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Tailles</span>
                  <input
                    name="tailles"
                    type="text"
                    placeholder="Ex: XS-XL, 36-44"
                    className="project-request-form__input"
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Quantite</span>
                  <input
                    name="quantite"
                    type="text"
                    placeholder="Ex: 300 pieces"
                    className="project-request-form__input"
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Finitions</span>
                  <input
                    name="finitions"
                    type="text"
                    placeholder="Ex: broderie, impression, etiquette"
                    className="project-request-form__input"
                  />
                </label>
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Delai souhaite</span>
                  <input
                    name="delai_souhaite"
                    type="text"
                    placeholder="Ex: avant fin avril"
                    className="project-request-form__input"
                  />
                </label>
                <label className="project-request-form__field project-request-form__field--full">
                  <span className="project-request-form__label">Documents techniques / Croquis</span>
                  <div className="relative">
                    <input
                      name="technical_files"
                      type="file"
                      multiple
                      className="project-request-form__input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#163526]/5 file:text-[#163526] hover:file:bg-[#163526]/10 cursor-pointer"
                    />
                    <p className="text-[10px] text-[#163526]/40 mt-2 uppercase tracking-widest">Formats acceptés : PDF, PNG, JPG (Max 10Mo)</p>
                  </div>
                </label>
                <label className="project-request-form__field project-request-form__field--full">
                  <span className="project-request-form__label">Votre demande</span>
                  <textarea
                    name="message"
                    placeholder="Decrivez votre projet, quantites, delais, matiere, finitions, contraintes."
                    className="project-request-form__textarea"
                    rows={7}
                    required
                  />
                </label>
              </div>

              <div className="project-request-form__actions">
                <p className="quote-page__action-note">Nous confirmons la reception et revenons vers vous si besoin.</p>
                <button className="project-request-form__submit" type="submit">
                  Envoyer la demande
                </button>
              </div>
            </form>
          </div>
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
