import { cookies } from "next/headers";
import type { UserProfile } from "./api";

export const AUTH_COOKIE_NAME = "jmr_token";
export const REFRESH_TOKEN_COOKIE_NAME = "jmr_refresh_token";
export const USER_COOKIE_NAME = "jmr_user";
export const AUTH_ERROR_COOKIE_NAME = "jmr_auth_error";

export async function getIsSignedIn() {
  const cookieStore = await cookies();
  return !!cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const userJson = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as UserProfile;
  } catch {
    return null;
  }
}

export function getSafeRedirectPath(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") {
    return undefined;
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return undefined;
  }

  return trimmed;
}
