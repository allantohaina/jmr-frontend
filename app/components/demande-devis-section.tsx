import Image from "next/image";
import Link from "next/link";
import { sendQuoteRequest } from "../actions/quotes";

export function DemandeDevisSection() {
  return (
    <div className="quote-page">
      <section className="quote-page__hero" aria-labelledby="demande-devis-title">
        <div className="quote-page__hero-background" aria-hidden="true">
          <Image
            className="quote-page__hero-background-image"
            src="/human_images/08_salle_machines_coudre.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="quote-page__hero-overlay" />
        </div>

        <div className="quote-page__hero-inner">
          <p className="quote-page__hero-kicker">Savoir-faire textile industriel</p>
          <h1 className="quote-page__hero-title" id="demande-devis-title">
            L&apos;excellence au coeur de chaque <span>fil.</span>
          </h1>
          <p className="quote-page__hero-description">
            Expertise industrielle en patronage, coupe et confection textile de haute precision.
          </p>

          <div className="quote-page__hero-actions">
            <Link className="quote-page__hero-action quote-page__hero-action--primary" href="/#nos-services">
              Decouvrir nos services
            </Link>
            <a className="quote-page__hero-action quote-page__hero-action--secondary" href="#demande-devis-form">
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      <section className="quote-page__content" id="demande-devis-form" aria-labelledby="demande-devis-form-title">
        <header className="quote-page__section-header">
          <span className="quote-page__section-kicker">Demande de devis</span>
          <h2 className="quote-page__section-title" id="demande-devis-form-title">
            Parlons de votre prochain projet textile
          </h2>
          <p className="quote-page__section-lead">
            Remplissez le formulaire pour nous faire part de votre projet. Nous revenons vers vous avec
            une estimation claire et un suivi adapte a votre besoin.
          </p>
        </header>

        <div className="quote-page__panel-shell ui-panel-shell">
          <div className="quote-page__panel">
            <div className="quote-page__intro access-page__card ui-soft-card">
              <span className="access-page__card-eyebrow">Preparation rapide</span>
              <h3>Ce qu&apos;il nous faut</h3>
              <p>Quelques informations suffisent pour etablir un devis precis et vous repondre rapidement.</p>

              <ul className="quote-page__list">
                <li>Type de produit, style et finitions souhaitees.</li>
                <li>Quantites estimees, tailles et informations techniques utiles.</li>
                <li>Delai souhaite, contraintes de production et niveau de finition attendu.</li>
              </ul>

              <p className="quote-page__note">
                Plus les informations sont precises, plus le devis sera fiable.
              </p>
            </div>

            <form className="quote-page__form ui-soft-card project-request-form" action={sendQuoteRequest}>
              <div className="project-request-form__grid">
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
