export const AUTH_COOKIE_NAME = "jmr_token";
export const REFRESH_TOKEN_COOKIE_NAME = "jmr_refresh_token";
export const USER_COOKIE_NAME = "jmr_user";
export const AUTH_ERROR_COOKIE_NAME = "jmr_auth_error";

export const TOKEN_STORAGE_KEY = "jmr_token";
export const REFRESH_TOKEN_STORAGE_KEY = "jmr_refresh_token";
export const USER_STORAGE_KEY = "jmr_user";
export const AUTH_ERROR_STORAGE_KEY = "jmr_auth_error";

export type SessionUser = {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: "admin" | "worker" | "user" | string;
};

function readStorageValue(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageValue(key: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota/private-mode errors
  }
}

export function deleteStorageValue(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getUser(): SessionUser | null {
  const storedUser = readStorageValue(USER_STORAGE_KEY) || readBrowserCookie(USER_COOKIE_NAME);
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as SessionUser;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return readStorageValue(TOKEN_STORAGE_KEY) || readBrowserCookie(AUTH_COOKIE_NAME) || null;
}

export function getRefreshTokenFromStorage(): string | null {
  return readStorageValue(REFRESH_TOKEN_STORAGE_KEY) || readBrowserCookie(REFRESH_TOKEN_COOKIE_NAME) || null;
}

type BrowserCookieOptions = {
  maxAge?: number;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
};

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

export function readCookieValue(cookieSource: string, name: string) {
  const encodedName = `${encodeURIComponent(name)}=`;
  const segments = cookieSource.split(";");

  for (const segment of segments) {
    const trimmedSegment = segment.trim();

    if (!trimmedSegment.startsWith(encodedName)) {
      continue;
    }

    const rawValue = trimmedSegment.slice(encodedName.length);

    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return undefined;
}

export function readBrowserCookie(name: string) {
  if (typeof document === "undefined") {
    return undefined;
  }

  return readCookieValue(document.cookie, name);
}

export function writeBrowserCookie(name: string, value: string, options: BrowserCookieOptions = {}) {
  if (typeof document === "undefined") {
    return;
  }

  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  parts.push(`Path=${options.path ?? "/"}`);

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

export function deleteBrowserCookie(name: string, path: string = "/") {
  writeBrowserCookie(name, "", {
    maxAge: 0,
    path,
  });
}
