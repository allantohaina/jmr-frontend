export function AProposSection() {
  return (
    <section className="about-page ui-section-shell" aria-labelledby="about-page-title">
      <div className="about-page__visual about-page__visual--left" aria-hidden="true" />
      <div className="about-page__visual about-page__visual--right" aria-hidden="true" />

      <header className="about-page__header ui-section-header">
        <h1 className="ui-section-title" id="about-page-title">
          A propos
        </h1>
        <span className="about-page__underline ui-section-underline" aria-hidden="true" />
      </header>

      <div className="about-page__body">
        <p className="about-page__intro">
          JMR Textile est une entreprise textile basee a Madagascar.
        </p>

        <p className="about-page__paragraph">
          Nous travaillons avec une organisation locale et des partenaires techniques que nous
          coordonnons.
        </p>

        <p className="about-page__paragraph">
          Notre role est de faire avancer les projets de maniere structuree, sans complexite
          inutile.
        </p>

        <h2 className="about-page__subheading">Origine et conformite :</h2>

        <p className="about-page__paragraph">
          Lorsque les matieres sont disponibles localement, la fabrication peut etre realisee a
          Madagascar.
        </p>

        <p className="about-page__paragraph">
          Selon le projet, des documents d&apos;origine ou de conformite peuvent etre fournis.
        </p>

        <p className="about-page__paragraph">Chaque cas est traite separement.</p>

        <p className="about-page__contact">
          <span className="about-page__contact-label">CONTACT :</span>
          <a className="about-page__contact-email" href="mailto:contact@jmrtextile.com">
            contact@jmrtextile.com
          </a>
        </p>
      </div>
    </section>
  );
}
