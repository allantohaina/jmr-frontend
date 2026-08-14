"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/app/components/locale-provider";
import {
  CONSENT_COOKIE_MAX_AGE,
  CONSENT_COOKIE_NAME,
  NOTIFICATIONS_ENABLED_COOKIE_NAME,
  isPushSupported,
  requestNotificationPermission,
  subscribeToPush,
  type ConsentChoice,
} from "@/app/lib/push";
import { VAPID_PUBLIC_KEY, pushAPI } from "@/app/lib/api";
import { getUser, getToken, writeBrowserCookie } from "@/app/lib/auth";

type ConsentState = {
  cookies: ConsentChoice;
  notifications: ConsentChoice;
};

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : undefined;
}

export function ConsentBanner() {
  const { messages } = useLocale();
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = getCookieValue(CONSENT_COOKIE_NAME);
    if (!saved) {
      // Let the layout paint first so the banner fades in smoothly.
      const timeout = window.setTimeout(() => setVisible(true), 800);
      return () => window.clearTimeout(timeout);
    }
  }, []);

  const recordConsent = useCallback(async (consent: ConsentState) => {
    const token = getToken();
    const user = getUser();

    if (!token || !user?.id) return;

    const records: { subject: string; granted: boolean }[] = [
      { subject: "cookies", granted: consent.cookies === "accepted" },
      { subject: "push_notifications", granted: consent.notifications === "accepted" },
    ];

    for (const record of records) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/legal/consent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject: record.subject,
            version: "1.0",
            granted: record.granted,
            user_id: user.id,
          }),
        });
      } catch {
        // Consent persistence is best-effort; the cookie banner must still work.
      }
    }
  }, []);

  const savePreference = useCallback(
    async (consent: ConsentState) => {
      setSaving(true);
      writeBrowserCookie(CONSENT_COOKIE_NAME, "1", {
        maxAge: CONSENT_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "Lax",
      });

      if (consent.notifications === "accepted" && isPushSupported()) {
        writeBrowserCookie(NOTIFICATIONS_ENABLED_COOKIE_NAME, "1", {
          maxAge: CONSENT_COOKIE_MAX_AGE,
          path: "/",
          sameSite: "Lax",
        });
        const permission = await requestNotificationPermission();
        if (permission === "granted") {
          const subscription = await subscribeToPush(VAPID_PUBLIC_KEY);
          if (subscription) {
            try {
              await pushAPI.subscribe(subscription);
            } catch {
              // The subscription will be retried next session if it could not be saved.
            }
          }
        }
      } else {
        writeBrowserCookie(NOTIFICATIONS_ENABLED_COOKIE_NAME, "0", {
          maxAge: CONSENT_COOKIE_MAX_AGE,
          path: "/",
          sameSite: "Lax",
        });
      }

      await recordConsent(consent);
      setVisible(false);
      setSaving(false);
    },
    [recordConsent],
  );

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-live="polite"
      aria-label={messages.consent.bannerTitle}
      className="fixed bottom-0 left-0 right-0 z-[120] animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="mx-auto max-w-3xl px-4 pb-4">
        <div className="rounded-2xl border border-[#e5ad46]/25 bg-[#1e2a38] p-5 shadow-2xl">
          <h2 className="text-base font-semibold text-[#e5ad46]">
            {messages.consent.bannerTitle}
          </h2>
          <p className="mt-2 text-sm text-white/70">{messages.consent.bannerText}</p>
          <Link
            href="/confidentialite"
            className="mt-2 inline-block text-sm text-[#e5ad46] underline underline-offset-4 hover:text-[#eccc90]"
          >
            {messages.consent.privacyLinkText}
          </Link>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 text-sm text-white/80">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#e5ad46]" />
                <span>{messages.consent.cookiesLabel}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  disabled={!isPushSupported()}
                  className="accent-[#e5ad46] disabled:opacity-40"
                />
                <span>{messages.consent.notificationsLabel}</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  const inputs = document.querySelectorAll<HTMLInputElement>(
                    "aside[aria-label='" + messages.consent.bannerTitle + "'] input[type='checkbox']",
                  );
                  const [cookies, notifications] = Array.from(inputs);
                  void savePreference({
                    cookies: cookies.checked ? "accepted" : "declined",
                    notifications: notifications.checked ? "accepted" : "declined",
                  });
                }}
                className="rounded-lg bg-[#e5ad46] px-4 py-2 text-sm font-semibold text-[#163526] transition-colors hover:bg-[#f0bc5a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "..." : messages.consent.accept}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  void savePreference({ cookies: "declined", notifications: "declined" });
                }}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {messages.consent.refuse}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}