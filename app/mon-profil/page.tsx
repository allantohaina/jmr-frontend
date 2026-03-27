import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthAccessSection } from "../components/auth-access-section";
import { MonProfilSection } from "../components/mon-profil-section";
import {
  AUTH_ERROR_COOKIE_NAME,
  getSafeRedirectPath,
} from "../lib/auth";
import {
  getIsSignedIn,
  getSessionToken,
} from "../lib/auth-server";
import { authAPI } from "../lib/api";

export default async function MonProfilPage({
  searchParams,
}: {
  searchParams?: Promise<{
    next?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const nextPath = getSafeRedirectPath(params.next ?? null);
  const cookieStore = await cookies();
  const authError = cookieStore.get(AUTH_ERROR_COOKIE_NAME)?.value ?? null;

  const isSignedIn = await getIsSignedIn();
  const token = await getSessionToken();

  if (!isSignedIn || !token) {
    return <AuthAccessSection nextPath={nextPath ?? "/mon-profil"} error={authError} />;
  }

  if (nextPath) {
    redirect(nextPath);
  }

  let user = null;
  try {
    const response = await authAPI.getProfile(token);
    user = response.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    // If token is invalid, we might want to sign out
    return <AuthAccessSection nextPath={nextPath ?? "/mon-profil"} error="auth_failed" />;
  }

  return <MonProfilSection variant="dashboard" user={user} />;
}
