"use client";

import { authAPI, type UserProfile } from "./api";
import {
  AUTH_ERROR_STORAGE_KEY,
  LAST_ACTIVITY_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  deleteStorageValue,
  getRefreshTokenFromStorage,
  getSafeRedirectPath,
  getToken,
  getUser,
  writeStorageValue,
} from "./auth";

export { getToken, getUser };
export type { SessionUser } from "./auth";

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
  writeStorageValue(TOKEN_STORAGE_KEY, payload.token);
  deleteStorageValue(REFRESH_TOKEN_STORAGE_KEY);

  if (payload.refresh_token) {
    writeStorageValue(REFRESH_TOKEN_STORAGE_KEY, payload.refresh_token);
  }

  writeStorageValue(USER_STORAGE_KEY, JSON.stringify(payload.user));
  deleteStorageValue(AUTH_ERROR_STORAGE_KEY);
  // 7 jours d'inactivité : on mémorise la dernière activité à la connexion
  const now = String(Date.now());
  writeStorageValue(LAST_ACTIVITY_STORAGE_KEY, now);
  // aussi en cookie pour middleware
  if (typeof document !== "undefined") {
    document.cookie = `${encodeURIComponent(LAST_ACTIVITY_STORAGE_KEY)}=${encodeURIComponent(now)}; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax`;
    document.cookie = `${encodeURIComponent(TOKEN_STORAGE_KEY)}=${encodeURIComponent(payload.token)}; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax`;
    if (payload.refresh_token) {
      document.cookie = `${encodeURIComponent(REFRESH_TOKEN_STORAGE_KEY)}=${encodeURIComponent(payload.refresh_token)}; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax`;
    }
    document.cookie = `${encodeURIComponent(USER_STORAGE_KEY)}=${encodeURIComponent(JSON.stringify(payload.user))}; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax`;
  }
}

export async function authenticateWithForm(formData: FormData) {
  const intent = resolveAuthIntent(formData);
  const email = readTextField(formData, "email");
  const password = readTextField(formData, "password");
  const nextPath = readTextField(formData, "next");

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
    const ageRaw = readTextField(formData, "age");
    const age = ageRaw ? Number(ageRaw) : undefined;
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
        age: Number.isFinite(age) ? age : undefined,
        phone: phone || undefined,
        country: country || undefined,
        address: address || undefined,
      });

      payload = response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  } else {
    const response = await authAPI.login(email, password);
    payload = response.data;
  }

  const rememberMe = formData.get("remember") === "on";
  persistAuthSession(payload, rememberMe);

  const role = payload.user?.role;
  let redirectTo = resolveAuthRedirect(intent, nextPath);

  if (intent === "login") {
    const hasCustomNext = !!getSafeRedirectPath(nextPath);
    if (!hasCustomNext) {
      if (role === "admin") {
        redirectTo = "/backoffice";
      } else if (role === "worker") {
        redirectTo = "/atelier";
      }
    } else {
      // respecter ?next même pour admin/worker si safe
      redirectTo = getSafeRedirectPath(nextPath)!;
    }
  }

  return {
    redirectTo,
    user: payload.user,
  };
}

export async function signOutClient() {
  const token = getToken();
  const refreshToken = getRefreshTokenFromStorage();

  if (token) {
    try {
      await authAPI.logout(refreshToken ?? undefined, token);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  deleteStorageValue(TOKEN_STORAGE_KEY);
  deleteStorageValue(REFRESH_TOKEN_STORAGE_KEY);
  deleteStorageValue(USER_STORAGE_KEY);
  deleteStorageValue(AUTH_ERROR_STORAGE_KEY);
  deleteStorageValue(LAST_ACTIVITY_STORAGE_KEY);
  if (typeof document !== "undefined") {
    const expire = "Max-Age=0; Path=/; SameSite=Lax";
    document.cookie = `${encodeURIComponent(TOKEN_STORAGE_KEY)}=; ${expire}`;
    document.cookie = `${encodeURIComponent(REFRESH_TOKEN_STORAGE_KEY)}=; ${expire}`;
    document.cookie = `${encodeURIComponent(USER_STORAGE_KEY)}=; ${expire}`;
    document.cookie = `${encodeURIComponent(LAST_ACTIVITY_STORAGE_KEY)}=; ${expire}`;
    document.cookie = `jmr_token=; ${expire}`;
    document.cookie = `jmr_refresh_token=; ${expire}`;
    document.cookie = `jmr_user=; ${expire}`;
    document.cookie = `jmr_last_activity=; ${expire}`;
  }
}
