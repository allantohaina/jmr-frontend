export const AUTH_COOKIE_NAME = "jmr_token";
export const REFRESH_TOKEN_COOKIE_NAME = "jmr_refresh_token";
export const USER_COOKIE_NAME = "jmr_user";
export const AUTH_ERROR_COOKIE_NAME = "jmr_auth_error";

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
