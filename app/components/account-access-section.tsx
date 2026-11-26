import Link from "next/link";

type AccessCard = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  tone: "primary" | "secondary";
};

type AccessStep = {
  step: string;
  title: string;
  description: string;
};

const ACCESS_CARDS: AccessCard[] = [
  {
    key: "existing",
    eyebrow: "Déjà client",
    title: "J'ai déjà un espace client",
    description:
      "Je me connecte pour retrouver mes devis, mes documents, mes notifications et les prochaines actions sans tout ressaisir.",
    ctaLabel: "Accéder à mon espace",
    href: "/mon-profil",
    tone: "secondary",
  },
  {
    key: "new",
    eyebrow: "Première demande",
    title: "Je n'ai pas encore de compte",
    description:
      "Je lance ma demande de devis. Mon accès client se crée pendant le parcours pour suivre la suite dans le même espace.",
    ctaLabel: "Faites votre demande.",
    href: "/mon-profil?next=%2Fsuivi-projet%3Fview%3Dtracking%26step%3D2",
    tone: "primary",
  },
];

const ACCESS_STEPS: AccessStep[] = [
  {
    step: "1",
    title: "Vous envoyez votre besoin",
    description: "Produit, quantités, délai et précisions utiles pour préparer le devis.",
  },
  {
    step: "2",
    title: "On ouvre votre accès si besoin",
    description: "Si vous n'avez pas encore de compte, il se crée au moment utile, pas avant.",
  },
  {
    step: "3",
    title: "Vous suivez tout au même endroit",
    description: "Devis, acompte, production et documents restent centralisés dans votre espace client.",
  },
];

export function AccountAccessSection() {
  return (
    <section className="access-page ui-section-shell" aria-labelledby="access-page-title">
      <header className="access-page__header ui-section-header">
        <h1 className="ui-section-title" id="access-page-title">
          Connexion ou inscription
        </h1>
        <span className="access-page__underline ui-section-underline" aria-hidden="true" />
        <p className="access-page__lead">
          L&apos;accès client sert à entrer si vous avez déjà un espace. Si c&apos;est votre première
          demande, il se crée pendant le parcours de devis.
        </p>
      </header>

      <div className="access-page__panel ui-panel-shell">
        <div className="access-page__cards">
          {ACCESS_CARDS.map((card, index) => (
            <article
              className={`access-page__card ui-soft-card access-page__card--${card.tone}`}
              key={card.key}
              data-reveal
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <span className="access-page__card-eyebrow">{card.eyebrow}</span>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <Link
                className={`access-page__action access-page__action--${card.tone}`}
                href={card.href}
              >
                {card.ctaLabel}
              </Link>
            </article>
          ))}
        </div>

        <div
          className="access-page__flow-wrap ui-soft-card"
          data-reveal
          style={{ transitionDelay: "160ms" }}
        >
          <p className="access-page__flow-label">Dans les deux cas, le parcours reste simple</p>

          <ol className="access-page__flow" aria-label="Parcours d'accès client">
            {ACCESS_STEPS.map((item) => (
              <li className="access-page__step ui-soft-card" key={item.step}>
                <span className="access-page__step-number" aria-hidden="true">
                  {item.step}
                </span>
                <div className="access-page__step-copy">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
