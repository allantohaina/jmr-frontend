import Link from "next/link";
import { PROFILE_NOTIFICATIONS } from "@/app/lib";

type NotificationsSectionProps = {
  user?: {
    first_name?: string;
  } | null;
};

function resolveFirstName(user?: NotificationsSectionProps["user"]) {
  if (!user || typeof user.first_name !== "string") {
    return "";
  }

  return user.first_name.trim();
}

export function NotificationsSection({ user }: NotificationsSectionProps) {
  const firstName = resolveFirstName(user);
  const title = firstName ? `Notifications de ${firstName}` : "Notifications client";
  const lead = firstName
    ? `Bonjour ${firstName}, voici les dernieres mises a jour de votre espace.`
    : "Voici les dernieres mises a jour de votre espace client.";
  const ctaLabel = firstName ? `Ouvrir l'espace de ${firstName}` : "Ouvrir mon espace";

  return (
    <section className="access-page ui-section-shell notifications-page" aria-labelledby="notifications-title">
      <header className="access-page__header ui-section-header">
        <h1 className="ui-section-title" id="notifications-title">
          {title}
        </h1>
        <span className="access-page__underline ui-section-underline" aria-hidden="true" />
        <p className="access-page__lead">{lead}</p>
      </header>

      <div className="access-page__panel ui-panel-shell">
        <div className="access-page__cards notifications-page__cards">
          {PROFILE_NOTIFICATIONS.map((notif, index) => (
            <article
              className={`access-page__card ui-soft-card${notif.tone === "highlight" ? " access-page__card--primary" : ""}`}
              key={`${notif.title}-${index}`}
              data-reveal
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <span className="access-page__card-eyebrow">{notif.date}</span>
              <h2>{notif.title}</h2>
              <p>{notif.message}</p>
            </article>
          ))}
        </div>

        <div className="notifications-page__cta" data-reveal style={{ transitionDelay: "180ms" }}>
          <Link className="access-page__action access-page__action--primary" href="/mon-profil">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
