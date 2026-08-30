"use client";

import { useEffect } from "react";
import { signOutClient } from "./auth-client";
import {
  INACTIVITY_LIMIT_MS,
  getLastActivity,
  updateLastActivity,
  isInactivityExpired,
  clearLastActivity,
} from "./auth";

type Options = {
  enabled?: boolean;
  redirectTo?: string;
  checkIntervalMs?: number;
};

function getLoginRedirect(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const host = window.location.hostname;
  if (host.startsWith("worker.")) return "/worker-login/";
  if (host.startsWith("admin.")) return "/admin-login/";
  return fallback;
}

export function useInactivityLogout(options: Options = {}) {
  const { enabled = true, redirectTo = "/", checkIntervalMs = 60_000 } = options;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Si aucune activité enregistrée mais token présent, init avec maintenant
    const token = localStorage.getItem("jmr_token");
    if (token && !getLastActivity()) {
      updateLastActivity();
    }

    // Vérif immédiate : si > 7 jours, déconnecte
    if (isInactivityExpired()) {
      clearLastActivity();
      void signOutClient().finally(() => {
        window.location.replace(getLoginRedirect(redirectTo));
      });
      return;
    }

    // Throttle : pas plus d'une écriture toutes les 60s
    let lastWrite = Date.now();
    const throttleMs = 60_000;

    function handleActivity() {
      const now = Date.now();
      if (now - lastWrite < throttleMs) return;
      lastWrite = now;
      updateLastActivity();
    }

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Met à jour sur visibilité
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        if (isInactivityExpired()) {
          clearLastActivity();
          void signOutClient().finally(() => {
            window.location.replace(getLoginRedirect(redirectTo));
          });
        } else {
          updateLastActivity();
        }
      }
    }

    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibility);

    const intervalId = window.setInterval(() => {
      if (isInactivityExpired()) {
        window.clearInterval(intervalId);
        clearLastActivity();
        void signOutClient().finally(() => {
          window.location.replace(getLoginRedirect(redirectTo));
        });
      }
    }, checkIntervalMs);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(intervalId);
    };
  }, [enabled, redirectTo, checkIntervalMs]);
}

export { INACTIVITY_LIMIT_MS };
