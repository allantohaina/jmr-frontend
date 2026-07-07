"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_COOKIE_NAME, readBrowserCookie } from "@/app/lib/auth";

type StepStatus = "complete" | "active" | "pending";
export type ProjectStepId = 1 | 2 | 3;
export type ProjectStepSearchParam = string | string[] | undefined;
export type ProjectTrackingView = "intro" | "request" | "tracking";
export type ProjectTrackingViewSearchParam = string | string[] | undefined;

type ProjectStep = {
  id: ProjectStepId;
  label: string;
};

const PROJECT_STEPS: ProjectStep[] = [
  {
    id: 1,
    label: "Demande envoyée.",
  },
  {
    id: 2,
    label: "Attente devis, validation client & acompte.",
  },
  {
    id: 3,
    label: "Paiement solde & Livraison.",
  },
];

const REQUEST_ENTRY_HREF = "/mon-profil?next=%2Fsuivi-projet%3Fview%3Dtracking%26step%3D2";

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatEstimatedResponseDate(date: Date) {
  const monthNames = [
    "janvier",
    "fevrier",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "aout",
    "septembre",
    "octobre",
    "novembre",
    "decembre",
  ];

  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function ProjectRequestHeader({ lead }: { lead: string }) {
  return (
    <header className="project-tracking-page__header ui-section-header">
      <p className="project-tracking-page__eyebrow">Premiere etape du parcours</p>
      <h1 className="ui-section-title" id="project-request-title">
        Decrivez votre besoin
      </h1>
      <span className="project-tracking-page__underline ui-section-underline" aria-hidden="true" />
      <p className="project-tracking-page__lead">{lead}</p>
    </header>
  );
}

export function parseCurrentProjectStep(stepValue: ProjectStepSearchParam): ProjectStepId {
  const rawValue = Array.isArray(stepValue) ? stepValue[0] : stepValue;

  if (rawValue === "1" || rawValue === "2" || rawValue === "3") {
    return Number(rawValue) as ProjectStepId;
  }

  return 1;
}

export function parseProjectTrackingView(
  viewValue: ProjectTrackingViewSearchParam,
  stepValue?: ProjectStepSearchParam,
): ProjectTrackingView {
  const rawView = Array.isArray(viewValue) ? viewValue[0] : viewValue;
  const rawStep = Array.isArray(stepValue) ? stepValue[0] : stepValue;

  if (rawView === "request") {
    return "request";
  }

  if (rawView === "tracking") {
    return "tracking";
  }

  if (rawStep === "1" || rawStep === "2" || rawStep === "3") {
    return "tracking";
  }

  return "intro";
}

function getStepStatus(stepId: ProjectStepId, currentStep: ProjectStepId): StepStatus {
  if (currentStep === 1) {
    return stepId === 1 ? "complete" : "pending";
  }

  if (currentStep === 2) {
    if (stepId === 1) {
      return "complete";
    }

    if (stepId === 2) {
      return "active";
    }

    return "pending";
  }

  return stepId <= 2 ? "complete" : "pending";
}

export function ProjectTrackingSection({
  view = "intro",
  currentStep = 1,
}: {
  view?: ProjectTrackingView;
  currentStep?: ProjectStepId;
}) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    setIsSignedIn(Boolean(readBrowserCookie(AUTH_COOKIE_NAME)));
    setHasCheckedAuth(true);
  }, []);

  if (view === "intro") {
    return (
      <section
        className="project-tracking-page project-tracking-page--intro ui-section-shell"
        aria-labelledby="project-tracking-title"
      >
        <header className="project-tracking-page__header ui-section-header">
          <p className="project-tracking-page__eyebrow">Fonction cle du parcours client</p>
          <h1 className="ui-section-title" id="project-tracking-title">
            Comment ca se passe ?
          </h1>
          <span className="project-tracking-page__underline ui-section-underline" aria-hidden="true" />
          <p className="project-tracking-page__lead">
            Decouvrez les grandes etapes du devis a la production avant de lancer votre demande.
          </p>
        </header>

        <div className="project-tracking-diagram" data-reveal>
          <article className="project-tracking-step project-tracking-step--top-left">
            <div className="project-tracking-step__visual" aria-hidden="true">
              <span className="project-tracking-step__badge">1</span>
              <Image
                className="project-tracking-step__icon"
                src="/icone-feuille.svg"
                alt=""
                width={180}
                height={180}
              />
            </div>
            <p className="project-tracking-step__text">Vous decrivez votre besoin.</p>
          </article>

          <div className="project-tracking-connector project-tracking-connector--top-left" aria-hidden="true">
            <Image
              className="project-tracking-connector__asset"
              src="/fleche.svg"
              alt=""
              width={640}
              height={390}
            />
          </div>

          <article className="project-tracking-step project-tracking-step--top-right">
            <div className="project-tracking-step__visual" aria-hidden="true">
              <span className="project-tracking-step__badge">2</span>
              <Image
                className="project-tracking-step__icon"
                src="/icones-stat.svg"
                alt=""
                width={180}
                height={180}
              />
            </div>
            <p className="project-tracking-step__text">Nous analysons la faisabilite.</p>
          </article>

          <div className="project-tracking-connector project-tracking-connector--top-right" aria-hidden="true">
            <Image
              className="project-tracking-connector__asset"
              src="/fleche.svg"
              alt=""
              width={640}
              height={390}
            />
          </div>

          <article className="project-tracking-center">
            <div className="project-tracking-center__visual" aria-hidden="true">
              <span className="project-tracking-step__badge project-tracking-step__badge--center">5</span>
              <Image
                className="project-tracking-center__icon"
                src="/icone-final-product.svg"
                alt=""
                width={238}
                height={238}
              />
            </div>
            <p className="project-tracking-center__text">
              Le projet est suivi jusqu&apos;a sa finalisation.
            </p>
          </article>

          <div className="project-tracking-connector project-tracking-connector--bottom-left" aria-hidden="true">
            <Image
              className="project-tracking-connector__asset"
              src="/fleche.svg"
              alt=""
              width={640}
              height={390}
            />
          </div>

          <article className="project-tracking-step project-tracking-step--bottom-left">
            <div className="project-tracking-step__visual" aria-hidden="true">
              <span className="project-tracking-step__badge">4</span>
              <Image
                className="project-tracking-step__icon"
                src="/icone-production.svg"
                alt=""
                width={180}
                height={180}
              />
            </div>
            <p className="project-tracking-step__text">
              Apres validation, la production demarre.
            </p>
          </article>

          <div className="project-tracking-connector project-tracking-connector--bottom-right" aria-hidden="true">
            <Image
              className="project-tracking-connector__asset"
              src="/fleche.svg"
              alt=""
              width={640}
              height={390}
            />
          </div>

          <article className="project-tracking-step project-tracking-step--bottom-right">
            <div className="project-tracking-step__visual" aria-hidden="true">
              <span className="project-tracking-step__badge">3</span>
              <Image
                className="project-tracking-step__icon"
                src="/icone-livraison.svg"
                alt=""
                width={180}
                height={180}
              />
            </div>
            <p className="project-tracking-step__text">Nous vous faisons une proposition.</p>
          </article>
        </div>

        <Link className="project-tracking-page__cta" href={REQUEST_ENTRY_HREF}>
          Faites votre demande.
        </Link>
      </section>
    );
  }

  if (view === "request") {
    const requestLead = isSignedIn
      ? "Dites-nous le produit souhaite, les quantites et les details utiles pour preparer votre devis."
      : hasCheckedAuth
        ? "Pour demander un devis, il faut d'abord vous connecter."
        : "Verification de votre session.";
    const nextPath = "/demande-devis";

    return (
      <section
        className="project-tracking-page project-request-page ui-section-shell"
        aria-labelledby="project-request-title"
      >
        <ProjectRequestHeader lead={requestLead} />
        <div className="project-request-page__panel" data-reveal>
          {!hasCheckedAuth ? (
            <div className="project-request-form">
              <p>Verification de votre session...</p>
            </div>
          ) : isSignedIn ? (
            <form action="/suivi-projet" className="project-request-form" method="get">
              <input name="view" type="hidden" value="tracking" />
              <input name="step" type="hidden" value="2" />

              <div className="project-request-form__grid">
                <label className="project-request-form__field">
                  <span className="project-request-form__label">Produit souhaite</span>
                  <input
                    className="project-request-form__input"
                    placeholder="Ex: polos, chemises, accessoires"
                    type="text"
                  />
                </label>

                <label className="project-request-form__field">
                  <span className="project-request-form__label">Quantite estimee</span>
                  <input
                    className="project-request-form__input"
                    placeholder="Ex: 300 pieces"
                    type="text"
                  />
                </label>

                <label className="project-request-form__field">
                  <span className="project-request-form__label">Matiere ou finition</span>
                  <input
                    className="project-request-form__input"
                    placeholder="Ex: coton pique, broderie, etiquette"
                    type="text"
                  />
                </label>

                <label className="project-request-form__field">
                  <span className="project-request-form__label">Delai souhaite</span>
                  <input
                    className="project-request-form__input"
                    placeholder="Ex: avant fin avril"
                    type="text"
                  />
                </label>

                <label className="project-request-form__field project-request-form__field--full">
                  <span className="project-request-form__label">Description du besoin</span>
                  <textarea
                    className="project-request-form__textarea"
                    placeholder="Decrivez le produit, les tailles, les contraintes et toute precision utile."
                    rows={7}
                  />
                </label>
              </div>

              <div className="project-request-form__actions">
                <Link className="project-request-form__secondary" href="/suivi-projet">
                  Retour au parcours
                </Link>
                <button className="project-request-form__submit" type="submit">
                  Envoyer la demande
                </button>
              </div>
            </form>
          ) : (
            <div className="project-request-form">
              <p>
                Une fois connecte, vous pourrez envoyer les informations du projet et suivre la suite
                (devis, acompte, production, livraison) dans votre espace client.
              </p>

              <div className="project-request-form__actions">
                <Link
                  className="project-request-form__submit"
                  href={`/mon-profil?next=${encodeURIComponent(nextPath)}`}
                >
                  Se connecter
                </Link>
                <Link className="project-request-form__secondary" href="/suivi-projet">
                  Retour au parcours
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  const isPaymentStep = currentStep === 2;
  const isProcessingStep = currentStep === 1;
  const statusCtaHref = isProcessingStep ? "/suivi-projet?view=tracking&step=2" : REQUEST_ENTRY_HREF;
  const statusCtaLabel = isProcessingStep
    ? "Valider la demande de devis"
    : "Demander un nouveau devis";
  const estimatedResponseDate = formatEstimatedResponseDate(addDays(new Date(), 3));

  return (
    <section
      className={`project-tracking-page project-tracking-page--status ui-section-shell${
        isPaymentStep ? " project-payment-page" : ""
      }`}
      aria-labelledby="project-tracking-title"
    >
      <header className="project-tracking-page__header ui-section-header">
        <p className="project-tracking-page__eyebrow">Fonction cle du parcours client</p>
        <h1 className="ui-section-title" id="project-tracking-title">
          Suivi de projet
        </h1>
        <span className="project-tracking-page__underline ui-section-underline" aria-hidden="true" />
        <p className="project-tracking-page__lead">
          Gardez un oeil sur le devis, l&apos;acompte, la production et la livraison depuis un seul
          point de suivi.
        </p>
      </header>

      <ol
        className={`project-status-flow project-status-flow--progress-${currentStep}`}
        aria-label="Etapes du suivi de projet"
        data-reveal
      >
        {PROJECT_STEPS.map((step) => {
          const status = getStepStatus(step.id, currentStep);

          return (
            <li className={`project-status-flow__step is-${status}`} key={step.id}>
              <span className="project-status-flow__dot" aria-hidden="true">
                {status === "complete" ? (
                  <svg
                    className="project-status-flow__check"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12.5L9.5 18L20 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <p className="project-status-flow__label">{step.label}</p>
            </li>
          );
        })}
      </ol>

      {isPaymentStep ? (
        <div className="project-status-page__summary" data-reveal style={{ transitionDelay: "90ms" }}>
          <p className="project-status-page__message">
            Votre demande a été bien reçue.
            <br />
            L&apos;administrateur prépare votre devis personnalisé.
          </p>
          <p className="project-status-page__message mt-3 text-sm text-[#163526]/65">
            Certaines etapes demanderont votre validation avant que le dossier avance.
          </p>
          <p className="project-status-page__eta">
            Réponse estimée le <strong>{estimatedResponseDate}</strong>.
          </p>
          <div className="mt-8 p-6 bg-[#163526]/5 rounded-2xl border border-[#163526]/10 text-left max-w-2xl mx-auto">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#163526] mb-2">Prochaine étape :</h3>
            <p className="text-xs text-[#163526]/70 leading-relaxed">
              Dès que le devis sera prêt, vous recevrez une notification dans votre espace client. 
              Vous pourrez alors le valider et régler l&apos;acompte de 50% pour lancer la production.
            </p>
          </div>
          <Link className="project-status-page__cta mt-8" href="/mon-profil">
            Retour à mon profil
          </Link>
        </div>
      ) : (
        <div className="project-status-page__summary" data-reveal style={{ transitionDelay: "90ms" }}>
          <p className="project-status-page__message">
            {isProcessingStep ? (
              <>
                Votre devis est en cours de traitement.
                <br />
                Merci de votre patience.
              </>
            ) : (
              <>
                Votre commande est <strong>en production.</strong>
                <br />
                Merci pour votre patience.
              </>
            )}
          </p>

          {isProcessingStep ? (
            <p className="project-status-page__eta">
              Reponse estimee le <strong>{estimatedResponseDate}</strong>.
            </p>
          ) : null}

          <Link className="project-status-page__cta" href={statusCtaHref}>
            {statusCtaLabel}
          </Link>
        </div>
      )}
    </section>
  );
}
