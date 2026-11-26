"use client";

import { EditableText } from "@/app/components/editable-text";
import { AnimeGrow } from "@/app/components/anime-reveal";

export function AProposSection() {
  return (
    <section className="about-page ui-section-shell" aria-labelledby="about-page-title" id="a-propos">
      <div className="about-page__visual about-page__visual--left" aria-hidden="true" />
      <div className="about-page__visual about-page__visual--right" aria-hidden="true" />

      <header className="about-page__header ui-section-header">
        <h1 className="ui-section-title" id="about-page-title">
          <EditableText contentKey="apropos.title" fallback="À propos" as="span" />
        </h1>
        <AnimeGrow>
          <span className="about-page__underline ui-section-underline" aria-hidden="true" />
        </AnimeGrow>
      </header>

      <div className="about-page__body">
        <p className="about-page__intro">
          <EditableText contentKey="apropos.intro" fallback="JMR Textile est une entreprise textile basée à Madagascar." as="span" multiline />
        </p>

        <p className="about-page__paragraph">
          <EditableText contentKey="apropos.p1" fallback="Nous travaillons avec une organisation locale et des partenaires techniques que nous coordonnons." as="span" multiline />
        </p>

        <p className="about-page__paragraph">
          <EditableText contentKey="apropos.p2" fallback="Notre rôle est de faire avancer les projets de manière structurée, sans complexité inutile." as="span" multiline />
        </p>

        <h2 className="about-page__subheading"><EditableText contentKey="apropos.subheading" fallback="Origine et conformité :" as="span" /></h2>

        <p className="about-page__paragraph">
          <EditableText contentKey="apropos.p3" fallback="Lorsque les matières sont disponibles localement, la fabrication peut être réalisée à Madagascar." as="span" multiline />
        </p>

        <p className="about-page__paragraph">
          <EditableText contentKey="apropos.p4" fallback="Selon le projet, des documents d'origine ou de conformité peuvent être fournis." as="span" multiline />
        </p>

        <p className="about-page__paragraph"><EditableText contentKey="apropos.p5" fallback="Chaque cas est traité séparément." as="span" /></p>

        <p className="about-page__contact">
          <span className="about-page__contact-label"><EditableText contentKey="apropos.contactLabel" fallback="CONTACT :" /></span>
          <a className="about-page__contact-email" href="mailto:contact@jmrtextile.com">
            contact@jmrtextile.com
          </a>
        </p>
      </div>
    </section>
  );
}
