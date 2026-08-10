"use client";

import { authAPI, type UserProfile } from "./api";
import {
  AUTH_COOKIE_NAME,
  AUTH_ERROR_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  USER_COOKIE_NAME,
  deleteBrowserCookie,
  getSafeRedirectPath,
  getToken,
  getUser,
  readBrowserCookie,
  writeBrowserCookie,
} from "./auth";

export { getToken, getUser };
export type { SessionUser } from "./auth";

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type AuthSuccessPayload = {
  token: string;
  refresh_token?: string;
  user: UserProfile;
};

type AuthIntent = "login" | "signup";

function readTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function resolveAuthIntent(formData: FormData): AuthIntent {
  return formData.get("intent") === "signup" ? "signup" : "login";
}

function resolveAuthRedirect(intent: AuthIntent, nextPath: string) {
  const safeNextPath = getSafeRedirectPath(nextPath);

  if (safeNextPath) {
    return safeNextPath;
  }

  return intent === "signup" ? "/?success=signup#acces-client" : "/?success=login#acces-client";
}

function persistAuthSession(payload: AuthSuccessPayload, rememberMe = false) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  const cookieOptions = {
    path: "/",
    sameSite: "Lax" as const,
    secure: true,
    ...(rememberMe ? { maxAge: AUTH_COOKIE_MAX_AGE } : {}),
  };

  writeBrowserCookie(AUTH_COOKIE_NAME, payload.token, cookieOptions);

  if (payload.refresh_token) {
    writeBrowserCookie(REFRESH_TOKEN_COOKIE_NAME, payload.refresh_token, cookieOptions);
  } else {
    deleteBrowserCookie(REFRESH_TOKEN_COOKIE_NAME);
  }

  writeBrowserCookie(USER_COOKIE_NAME, JSON.stringify(payload.user), cookieOptions);
  deleteBrowserCookie(AUTH_ERROR_COOKIE_NAME);
}

export async function authenticateWithForm(formData: FormData) {
  const intent = resolveAuthIntent(formData);
  const email = readTextField(formData, "email");
  const password = readTextField(formData, "password");
  const nextPath = readTextField(formData, "next");
  const altchaToken = readTextField(formData, "altcha");

  if (!email || !password) {
    throw new Error("Veuillez renseigner votre e-mail et votre mot de passe.");
  }

  let payload: AuthSuccessPayload;

  if (intent === "signup") {
    const confirmPassword = readTextField(formData, "confirm_password");

    if (confirmPassword && confirmPassword !== password) {
      throw new Error("Les mots de passe ne correspondent pas.");
    }

    const firstName = readTextField(formData, "first_name") || "User";
    const lastName = readTextField(formData, "last_name") || "New";
    const birthDate = readTextField(formData, "birth_date");
    const phone = readTextField(formData, "phone");
    const country = readTextField(formData, "country");
    const address = readTextField(formData, "address");
    
    try {
      const response = await authAPI.register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate || undefined,
        phone: phone || undefined,
        country: country || undefined,
        address: address || undefined,
        altcha: altchaToken || undefined,
      });

      payload = response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  } else {
    const response = await authAPI.login(email, password, altchaToken || undefined);
    payload = response.data;
  }

  const rememberMe = formData.get("remember") === "on";
  persistAuthSession(payload, rememberMe);

  const role = payload.user?.role;
  let redirectTo = resolveAuthRedirect(intent, nextPath);

  if (intent === "login") {
    if (role === "admin") {
      redirectTo = "/backoffice";
    } else if (role === "worker") {
      redirectTo = "/atelier";
    }
  }

  return {
    redirectTo,
    user: payload.user,
  };
}

export async function signOutClient() {
  const token = readBrowserCookie(AUTH_COOKIE_NAME);
  const refreshToken = readBrowserCookie(REFRESH_TOKEN_COOKIE_NAME);

  if (token) {
    try {
      await authAPI.logout(refreshToken, token);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  deleteBrowserCookie(AUTH_COOKIE_NAME);
  deleteBrowserCookie(REFRESH_TOKEN_COOKIE_NAME);
  deleteBrowserCookie(USER_COOKIE_NAME);
  deleteBrowserCookie(AUTH_ERROR_COOKIE_NAME);
}
