import { NextResponse, NextRequest } from "next/server";

const AUTH_COOKIE = "jmr_token";
const LAST_ACTIVITY_COOKIE = "jmr_last_activity";
const INACTIVITY_LIMIT_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

function getLoginUrl(request: NextRequest, target: string): URL {
  const url = new URL(target, request.url);
  const next = request.nextUrl.pathname + request.nextUrl.search;
  if (next && next !== "/" && !next.startsWith("/login") && !next.startsWith("/admin-login") && !next.startsWith("/worker-login")) {
    url.searchParams.set("next", next);
  }
  return url;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ne jamais intercepter les assets, api, _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_static") ||
    pathname.includes(".") // fichiers statiques
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const lastActivityRaw = request.cookies.get(LAST_ACTIVITY_COOKIE)?.value;
  const now = Date.now();

  // Vérif inactivité 7 jours côté middleware (cookie)
  let isExpired = false;
  if (lastActivityRaw) {
    const last = Number(lastActivityRaw);
    if (Number.isFinite(last) && now - last > INACTIVITY_LIMIT_MS) {
      isExpired = true;
    }
  } else if (token) {
    // si token présent mais pas de last_activity, on l'init
    const res = NextResponse.next();
    res.cookies.set(LAST_ACTIVITY_COOKIE, String(now), {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
    });
    return res;
  }

  if (isExpired && token) {
    const res = NextResponse.redirect(getLoginUrl(request, getLoginTargetForPath(pathname)));
    // purge cookies
    res.cookies.delete(AUTH_COOKIE);
    res.cookies.delete("jmr_refresh_token");
    res.cookies.delete("jmr_user");
    res.cookies.delete(LAST_ACTIVITY_COOKIE);
    return res;
  }

  // Routes protégées
  const isBackoffice = pathname.startsWith("/backoffice");
  const isAtelier = pathname.startsWith("/atelier");
  // /mon-profil nécessite auth sauf /login etc
  const isMonProfilProtected = pathname.startsWith("/mon-profil");

  if (isBackoffice && !token) {
    return NextResponse.redirect(getLoginUrl(request, "/admin-login"));
  }

  if (isAtelier && !token) {
    return NextResponse.redirect(getLoginUrl(request, "/worker-login"));
  }

  // Optionnel : si mon-profil sans token, on laisse ClientAuthGate gérer mais middleware peut aussi rediriger vers /login
  // On ne force pas pour éviter de casser AuthAccessSection, mais si ?next présent on redirige
  // Désactivé par défaut : laisser la page afficher le formulaire inline
  // if (isMonProfilProtected && !token) { return NextResponse.redirect(getLoginUrl(request, "/login")); }

  // Si utilisateur connecté essaie d'aller sur login, rediriger selon rôle serait idéal mais on ne connait pas le rôle dans le cookie sans décoder JWT
  // On laisse passer, la page gère déjà le redirect

  // Refresh last_activity pour routes authentifiées (sliding window)
  if (token && (isBackoffice || isAtelier || isMonProfilProtected)) {
    if (!isExpired) {
      const res = NextResponse.next();
      res.cookies.set(LAST_ACTIVITY_COOKIE, String(now), {
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
      });
      // aussi prolonger l'activité via header pour client
      return res;
    }
  }

  return NextResponse.next();
}

function getLoginTargetForPath(pathname: string): string {
  if (pathname.startsWith("/atelier")) return "/worker-login";
  if (pathname.startsWith("/backoffice")) return "/admin-login";
  return "/login";
}

export const config = {
  matcher: ["/backoffice/:path*", "/atelier/:path*", "/mon-profil/:path*"],
};
