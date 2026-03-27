import type { UserProfile } from "./api";

export const AUTH_COOKIE_NAME = "jmr_token";
export const REFRESH_TOKEN_COOKIE_NAME = "jmr_refresh_token";
export const USER_COOKIE_NAME = "jmr_user";
export const AUTH_ERROR_COOKIE_NAME = "jmr_auth_error";

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
