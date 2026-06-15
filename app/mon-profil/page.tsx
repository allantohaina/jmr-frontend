import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthAccessSection, MonProfilSection } from "@/app/components";
import {
  AUTH_ERROR_COOKIE_NAME,
  getSafeRedirectPath,
  authAPI,
} from "@/app/lib";
import { getIsSignedIn, getSessionToken } from "@/app/lib/auth-server";

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

  const [isSignedIn, token] = await Promise.all([
    getIsSignedIn(),
    getSessionToken(),
  ]);

  if (!isSignedIn || !token) {
    return <AuthAccessSection nextPath={nextPath ?? "/mon-profil"} error={authError} />;
  }

  if (nextPath) {
    redirect(nextPath);
  }

  const sessionToken = token as string;
  let user = null;
  try {
    const response = await authAPI.getProfile(sessionToken);
    user = response.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    // If token is invalid, we might want to sign out
    return <AuthAccessSection nextPath={nextPath ?? "/mon-profil"} error="auth_failed" />;
  }

  return <MonProfilSection variant="dashboard" user={user} />;
}
