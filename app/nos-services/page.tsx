import Link from "next/link";

type ServiceStep = {
  key: string;
  title: string;
  alt: string;
};

const SERVICE_STEPS: ServiceStep[] = [
  {
    key: "fabrication",
    title: "Fabrication de vetements.",
    alt: "Atelier de fabrication textile",
  },
  {
    key: "organisation",
    title: "Organisation de la production.",
    alt: "Organisation de la production",
  },
  {
    key: "matieres",
    title: "Gestion des matieres et finitions.",
    alt: "Gestion des matieres et des finitions",
  },
  {
    key: "delais",
    title: "Suivi des delais.",
    alt: "Suivi des delais",
  },
];

export default function NosServicesPage() {
  return (
    <section className="services-page" aria-labelledby="services-page-title">
      <header className="services-page__header">
        <h1 id="services-page-title">Ce que nous faisons ?</h1>
        <span className="services-page__underline" aria-hidden="true" />
      </header>

      <ol className="services-flow" aria-label="Etapes du service">
        {SERVICE_STEPS.map((step, index) => (
          <li className="services-flow__step" key={step.key}>
            <p className="services-flow__label">
              <span className="services-flow__index" aria-hidden="true">
                {index + 1}.
              </span>
              <span className="services-flow__title">{step.title}</span>
            </p>
            <div className="services-flow__media-wrap">
              <div
                className={`services-flow__media services-flow__media--${step.key}`}
                role="img"
                aria-label={step.alt}
              />
              {index < SERVICE_STEPS.length - 1 ? (
                <span className="services-flow__arrow" aria-hidden="true">
                  ⇄
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <p className="services-page__claim">Un seul contact, un cadre clair.</p>

      <Link className="services-page__cta" href="/suivi-projet">
        Faites votre demande.
      </Link>
    </section>
  );
}
