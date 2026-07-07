'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { authAPI, Notification } from "@/app/lib/api";

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

function getNotificationTypeColor(type: string) {
  switch (type) {
    case 'success': return 'bg-green-100 border-green-500 text-green-800';
    case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    case 'error': return 'bg-red-100 border-red-500 text-red-800';
    default: return 'bg-blue-100 border-blue-500 text-blue-800';
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'success': return '✓';
    case 'warning': return '⚠';
    case 'error': return '✕';
    default: return 'ℹ';
  }
}

export function NotificationsSection({ user }: NotificationsSectionProps) {
  const firstName = resolveFirstName(user);
  const title = firstName ? `Notifications de ${firstName}` : "Notifications";
  const lead = firstName
    ? `Bonjour ${firstName}, voici vos notifications.`
    : "Voici vos notifications.";
  const ctaLabel = firstName ? `Ouvrir l'espace de ${firstName}` : "Ouvrir mon espace";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await authAPI.getNotifications();
        setNotifications(response.data.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await authAPI.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

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
        <div className="space-y-4">
          {loading ? (
            <p className="text-center py-8 text-gray-500">Chargement des notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Aucune notification pour le moment.</p>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 transition-all ${
                  getNotificationTypeColor(notification.type)
                } ${notification.read ? 'opacity-70' : 'shadow-md'}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-sm mt-1">{notification.message}</p>
                      <p className="text-xs mt-2 opacity-70">
                        {new Date(notification.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="notifications-page__cta mt-8" data-reveal style={{ transitionDelay: "180ms" }}>
          <Link className="access-page__action access-page__action--primary" href="/mon-profil">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
