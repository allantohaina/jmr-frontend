import Link from "next/link";
import { ProblemHierarchyPanel } from "./problem-hierarchy-panel";
import { TEXTILE_PROBLEM_THREADS } from "@/app/lib";

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
    ? `Bonjour ${firstName}, voici les 4 problemes majeurs et les details utiles.`
    : "Voici les 4 problemes majeurs de votre espace client.";
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
        <ProblemHierarchyPanel
          className="space-y-4"
          mode="client"
          problems={TEXTILE_PROBLEM_THREADS}
          theme="light"
        />

        <div className="notifications-page__cta" data-reveal style={{ transitionDelay: "180ms" }}>
          <Link className="access-page__action access-page__action--primary" href="/mon-profil">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
