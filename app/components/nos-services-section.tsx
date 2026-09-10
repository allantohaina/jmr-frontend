"use client";

import Image from "next/image";
import Link from "next/link";
import { EditableImage } from "@/app/components/editable-image";
import { EditableText } from "@/app/components/editable-text";

type ServiceStep = {
  key: string;
  title: string;
  alt: string;
  imageSrc: string;
};

const SERVICE_STEPS: ServiceStep[] = [
  {
    key: "fabrication",
    title: "Fabrication de vetements.",
    alt: "Decoupe textile en atelier",
    imageSrc: "/human_images/04_decoupe_machine_electrique.jpg",
  },
  {
    key: "organisation",
    title: "Organisation de la production.",
    alt: "Preparation des patrons textile sur table de travail",
    imageSrc: "/human_images/03_placement_patron_table.jpg",
  },
  {
    key: "matieres",
    title: "Gestion des matieres et finitions.",
    alt: "Equipe organisant le travail autour des patrons textile",
    imageSrc: "/human_images/05_equipe_tracage_patron.jpg",
  },
  {
    key: "delais",
    title: "Suivi des delais.",
    alt: "Suivi des etapes de production en atelier",
    imageSrc: "/human_images/07_coupe_machine_denim.jpg",
  },
];

export function NosServicesSection() {
  return (
    <section className="services-page ui-section-shell" aria-labelledby="services-page-title" id="nos-services">
      <header className="services-page__header ui-section-header">
        <h1 className="ui-section-title" id="services-page-title">
          <EditableText contentKey="nosservices.title" fallback="Ce que nous faisons ?" as="span" multiline />
        </h1>
        <span className="services-page__underline ui-section-underline" aria-hidden="true" />
      </header>

      <ol className="services-flow" aria-label="Etapes du service">
        {SERVICE_STEPS.map((step, index) => (
          <li
            className="services-flow__step"
            key={step.key}
            data-reveal
            style={{ transitionDelay: `${index * 90}ms` }}
          >
            <p className="services-flow__title"><EditableText contentKey={`nosservices.step.${step.key}.title`} fallback={step.title} as="span" multiline /></p>
            <div className="services-flow__media-wrap">
              <div className={`services-flow__media services-flow__media--${step.key}`}>
                <div className="services-flow__photo-shell">
                  <EditableImage
                    contentKey={`nosservices.step.${step.key}.image`}
                    className={`services-flow__photo services-flow__photo--${step.key} w-full h-full object-cover`}
                    src={step.imageSrc}
                    alt={step.alt}
                  />
                </div>
                <Image
                  className="services-flow__frame"
                  src="/hexagone.svg"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 900px) 68vw, (max-width: 1200px) 34vw, 22vw"
                />
              </div>
            </div>

            {index < SERVICE_STEPS.length - 1 ? (
              <span className="services-flow__connector" aria-hidden="true">
                &#8660;
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <p className="services-page__claim"><EditableText contentKey="nosservices.claim" fallback="Un seul contact, un cadre clair." as="span" /></p>

      <Link
        className="services-page__cta"
        href="/mon-profil?next=%2Fsuivi-projet%3Fview%3Dtracking%26step%3D2"
      >
        <EditableText contentKey="nosservices.cta" fallback="Faites votre demande." />
      </Link>
    </section>
  );
}
