import Image from "next/image";
import Link from "next/link";
import { signOut } from "../actions/auth";
import type { UserProfile } from "../lib/api";

type ProfileCard = {
  title: string;
  description: string;
};

type ProfileMetric = {
  label: string;
  value: string;
  detail: string;
};

type ProfileOrderStatus = "devis" | "production" | "livraison";

type ProfileOrder = {
  code: string;
  title: string;
  status: ProfileOrderStatus;
  summary: string;
  nextStep: string;
  amount: string;
};

type ProfileNotificationTone = "highlight" | "default";

type ProfileNotification = {
  title: string;
  message: string;
  date: string;
  tone: ProfileNotificationTone;
};

type ProfileActivity = {
  date: string;
  label: string;
  detail: string;
};

type ProfileDocument = {
  title: string;
  helper: string;
};

type MonProfilSectionProps = {
  variant?: "preview" | "dashboard";
  user?: UserProfile | null;
};

const PROFILE_ITEMS: ProfileCard[] = [
  {
    title: "Gardez vos coordonnees pretes pour chaque demande",
    description: "Retrouvez vos contacts, adresses et informations de facturation sans tout ressaisir.",
  },
  {
    title: "Retrouvez toutes vos commandes en un coup d'oeil",
    description: "Visualisez vos devis, commandes en cours et prochaines etapes depuis le meme espace.",
  },
  {
    title: "Recevez les alertes utiles au bon moment",
    description: "Soyez prevenu des qu'un devis arrive, qu'un document est depose ou qu'une etape change.",
  },
];

const PROFILE_METRICS: ProfileMetric[] = [
  {
    label: "Commandes actives",
    value: "03",
    detail: "2 en production et 1 en validation finale.",
  },
  {
    label: "Devis en attente",
    value: "01",
    detail: "Une demande de devis recue le 8 mars 2026.",
  },
  {
    label: "Notifications",
    value: "04",
    detail: "Nouveaux messages, documents et etapes valides.",
  },
];

const PROFILE_ORDERS: ProfileOrder[] = [
  {
    code: "CMD-104",
    title: "Serie de polos coton",
    status: "production",
    summary: "Commande confirmee. Coupe terminee, assemblage lance.",
    nextStep: "Verifier le point production du 12 mars 2026.",
    amount: "3 480 EUR",
  },
  {
    code: "DV-024",
    title: "Demande de devis chemises",
    status: "devis",
    summary: "Le devis est disponible et attend votre validation.",
    nextStep: "Ouvrir le devis et regler l'acompte.",
    amount: "Acompte a confirmer",
  },
  {
    code: "CMD-098",
    title: "Capsule accessoires",
    status: "livraison",
    summary: "Le solde est valide. Preparation de la livraison en cours.",
    nextStep: "Confirmer la reception des documents d'expedition.",
    amount: "1 920 EUR",
  },
];

export const PROFILE_NOTIFICATIONS: ProfileNotification[] = [
  {
    title: "Votre devis est arrive",
    message:
      "La demande DV-024 a ete preparee et mise a disposition dans votre espace client.",
    date: "8 mars 2026",
    tone: "highlight",
  },
  {
    title: "Mise a jour de production",
    message: "La commande CMD-104 passe de la coupe a l'assemblage le 9 mars 2026.",
    date: "9 mars 2026",
    tone: "default",
  },
  {
    title: "Document ajoute",
    message: "Le bon de commande signe pour CMD-098 est maintenant telechargeable.",
    date: "7 mars 2026",
    tone: "default",
  },
];

const PROFILE_ACTIVITY: ProfileActivity[] = [
  {
    date: "9 mars 2026",
    label: "Assemblage demarre",
    detail: "Ligne de production ouverte pour les polos CMD-104.",
  },
  {
    date: "8 mars 2026",
    label: "Devis emis",
    detail: "Le devis DV-024 a ete transmis avec les quantites revisees.",
  },
  {
    date: "6 mars 2026",
    label: "Solde confirme",
    detail: "Le paiement final de CMD-098 a ete enregistre.",
  },
];

const PROFILE_DOCUMENTS: ProfileDocument[] = [
  {
    title: "Devis DV-024",
    helper: "Disponible au format PDF pour validation.",
  },
  {
    title: "Bon de commande CMD-098",
    helper: "Document signe et archive dans votre espace.",
  },
  {
    title: "Fiche technique polos",
    helper: "Version approuvee pour la production en cours.",
  },
];

function getOrderStatusLabel(status: ProfileOrderStatus) {
  if (status === "devis") {
    return "Devis pret";
  }

  if (status === "production") {
    return "En production";
  }

  return "Livraison";
}

export function MonProfilSection({ variant = "preview", user }: MonProfilSectionProps) {
  if (variant === "dashboard") {
    return (
      <section
        className="profile-page profile-page--dashboard ui-section-shell"
        aria-labelledby="profile-page-title"
      >
        <header className="profile-page__header ui-section-header">
          <h1 className="ui-section-title" id="profile-page-title">
            Mon profil
          </h1>
          <span className="profile-page__underline ui-section-underline" aria-hidden="true" />
          
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className="text-xl font-medium">{user?.first_name} {user?.last_name}</p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            <form action={signOut}>
              <button type="submit" className="text-red-600 hover:underline">
                Se déconnecter
              </button>
            </form>
          </div>
        </header>

        <div className="profile-page__panel profile-page__panel--dashboard ui-panel-shell">
          <div className="profile-page__hero">
            <div className="profile-page__hero-icon" aria-hidden="true">
              <Image src="/bulle_de_compte.svg" alt="" width={170} height={170} />
            </div>

            <div className="profile-page__hero-copy">
              <p className="profile-page__hero-title">
                Bienvenue, {user?.first_name} ! Retrouvez vos commandes, devis et alertes en un coup d&apos;oeil.
              </p>
            </div>
          </div>

          <div className="profile-page__dashboard-grid">
            <div className="profile-page__metrics">
              {PROFILE_METRICS.map((metric, idx) => (
                <div className="profile-page__metric-card ui-soft-card" key={idx}>
                  <span className="profile-page__metric-label">{metric.label}</span>
                  <span className="profile-page__metric-value">{metric.value}</span>
                  <p className="profile-page__metric-detail">{metric.detail}</p>
                </div>
              ))}
            </div>

            <div className="profile-page__main-content">
              <div className="profile-page__orders ui-soft-card">
                <div className="profile-page__card-header">
                  <h2>Suivi des commandes</h2>
                  <Link className="profile-page__all-link" href="/suivi-projet">
                    Voir tout
                  </Link>
                </div>

                <div className="profile-page__orders-list">
                  {PROFILE_ORDERS.map((order) => (
                    <div className="profile-page__order-item" key={order.code}>
                      <div className="profile-page__order-head">
                        <span className="profile-page__order-code">{order.code}</span>
                        <span
                          className={`profile-page__order-status profile-page__order-status--${order.status}`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                      <h3 className="profile-page__order-title">{order.title}</h3>
                      <p className="profile-page__order-summary">{order.summary}</p>
                      <div className="profile-page__order-next">
                        <strong>Prochaine etape :</strong> {order.nextStep}
                      </div>
                      <div className="profile-page__order-footer">
                        <span className="profile-page__order-amount">{order.amount}</span>
                        <Link className="profile-page__order-link" href="/suivi-projet">
                          Detail
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-page__notifications ui-soft-card">
                <div className="profile-page__card-header">
                  <h2>Alertes et messages</h2>
                </div>
                <div className="profile-page__notifications-list">
                  {PROFILE_NOTIFICATIONS.map((notif, idx) => (
                    <div
                      className={`profile-page__notif-item profile-page__notif-item--${notif.tone}`}
                      key={idx}
                    >
                      <div className="profile-page__notif-date">{notif.date}</div>
                      <h3 className="profile-page__notif-title">{notif.title}</h3>
                      <p className="profile-page__notif-message">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="profile-page__sidebar">
              <div className="profile-page__activity ui-soft-card">
                <div className="profile-page__card-header">
                  <h2>Activite recente</h2>
                </div>
                <div className="profile-page__activity-list">
                  {PROFILE_ACTIVITY.map((activity, idx) => (
                    <div className="profile-page__activity-item" key={idx}>
                      <div className="profile-page__activity-dot" aria-hidden="true" />
                      <div className="profile-page__activity-content">
                        <div className="profile-page__activity-date">{activity.date}</div>
                        <div className="profile-page__activity-label">{activity.label}</div>
                        <p className="profile-page__activity-detail">{activity.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-page__documents ui-soft-card">
                <div className="profile-page__card-header">
                  <h2>Mes documents</h2>
                </div>
                <div className="profile-page__documents-list">
                  {PROFILE_DOCUMENTS.map((doc, idx) => (
                    <div className="profile-page__document-item" key={idx}>
                      <div className="profile-page__document-icon" aria-hidden="true">
                        <Image src="/file.svg" alt="" width={24} height={24} />
                      </div>
                      <div className="profile-page__document-copy">
                        <h3 className="profile-page__document-title">{doc.title}</h3>
                        <p className="profile-page__document-helper">{doc.helper}</p>
                      </div>
                      <button className="profile-page__document-download" aria-label="Telecharger">
                        <Image src="/fleche.svg" alt="" width={16} height={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page ui-section-shell" aria-labelledby="profile-preview-title">
      <header className="profile-page__header ui-section-header">
        <h1 className="ui-section-title" id="profile-preview-title">
          Mon espace client
        </h1>
        <span className="profile-page__underline ui-section-underline" aria-hidden="true" />
        <p className="profile-page__lead">
          Un acces unique pour centraliser vos echanges, documents techniques et le suivi de vos
          productions textile.
        </p>
      </header>

      <div className="profile-page__panel ui-panel-shell">
        <div className="profile-page__cards">
          {PROFILE_ITEMS.map((item, idx) => (
            <article
              className="profile-page__card ui-soft-card"
              key={idx}
              data-reveal
              style={{ transitionDelay: `${idx * 80 + 100}ms` }}
            >
              <div className="profile-page__card-icon" aria-hidden="true">
                <Image src="/bulle_de_compte.svg" alt="" width={100} height={100} />
              </div>
              <h2 className="profile-page__card-title">{item.title}</h2>
              <p className="profile-page__card-description">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="profile-page__cta" data-reveal style={{ transitionDelay: "350ms" }}>
          <Link className="profile-page__action" href="/mon-profil">
            Acceder a mon espace
          </Link>
        </div>
      </div>
    </section>
  );
}
