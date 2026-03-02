import Image from "next/image";
import Link from "next/link";

type CornerStep = {
  id: 1 | 2 | 3 | 4;
  position: "top-left" | "top-right" | "bottom-right" | "bottom-left";
  icon: string;
  alt: string;
  label: string;
};

const CORNER_STEPS: CornerStep[] = [
  {
    id: 1,
    position: "top-left",
    icon: "/icone-feuille.svg",
    alt: "Description du besoin",
    label: "Vous décrivez votre besoin.",
  },
  {
    id: 2,
    position: "top-right",
    icon: "/icones-stat.svg",
    alt: "Analyse de la faisabilité",
    label: "Nous analysons la faisabilité.",
  },
  {
    id: 3,
    position: "bottom-right",
    icon: "/icone-livraison.svg",
    alt: "Proposition commerciale",
    label: "Nous vous faisons une proposition.",
  },
  {
    id: 4,
    position: "bottom-left",
    icon: "/icone-production.svg",
    alt: "Démarrage de la production",
    label: "Après validation, la production démarre.",
  },
];

export default function SuiviProjetPage() {
  return (
    <section className="project-tracking-page" aria-labelledby="project-tracking-title">
      <header className="project-tracking-page__header">
        <h1 id="project-tracking-title">Comment ça se passe ?</h1>
        <span className="project-tracking-page__underline" aria-hidden="true" />
      </header>

      <div className="project-tracking-diagram" aria-label="Étapes du suivi de projet">
        {CORNER_STEPS.map((step) => (
          <article
            className={`project-tracking-step project-tracking-step--${step.position}`}
            key={step.id}
          >
            <span className="project-tracking-step__badge" aria-hidden="true">
              {step.id}
            </span>
            <div className="project-tracking-step__visual">
              <Image
                className="project-tracking-step__icon"
                src={step.icon}
                alt={step.alt}
                width={260}
                height={260}
              />
            </div>
            <p className="project-tracking-step__text">{step.label}</p>
          </article>
        ))}

        <article className="project-tracking-center">
          <span className="project-tracking-step__badge project-tracking-step__badge--center" aria-hidden="true">
            5
          </span>
          <div className="project-tracking-center__visual">
            <Image
              className="project-tracking-center__icon"
              src="/icone-final-product.svg"
              alt="Suivi du projet jusqu'au produit final"
              width={320}
              height={320}
            />
          </div>
          <p className="project-tracking-center__text">Le projet est suivi jusqu&apos;à sa finalisation.</p>
        </article>

        <div
          className="project-tracking-connector project-tracking-connector--top-left"
          aria-hidden="true"
        >
          <Image
            className="project-tracking-connector__asset"
            src="/fleche.svg"
            alt=""
            width={1420}
            height={865}
          />
        </div>
        <div
          className="project-tracking-connector project-tracking-connector--top-right"
          aria-hidden="true"
        >
          <Image
            className="project-tracking-connector__asset"
            src="/fleche.svg"
            alt=""
            width={1420}
            height={865}
          />
        </div>
        <div
          className="project-tracking-connector project-tracking-connector--bottom-left"
          aria-hidden="true"
        >
          <Image
            className="project-tracking-connector__asset"
            src="/fleche.svg"
            alt=""
            width={1420}
            height={865}
          />
        </div>
        <div
          className="project-tracking-connector project-tracking-connector--bottom-right"
          aria-hidden="true"
        >
          <Image
            className="project-tracking-connector__asset"
            src="/fleche.svg"
            alt=""
            width={1420}
            height={865}
          />
        </div>
      </div>

      <Link className="project-tracking-page__cta" href="/mon-profil">
        Faites votre demande.
      </Link>
    </section>
  );
}
