import { authAPI, type UserProfile } from "./api";
import { clearAuthData, setAuthData } from "./api";
import {
  AUTH_COOKIE_NAME,
  AUTH_ERROR_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  USER_COOKIE_NAME,
  deleteBrowserCookie,
  getSafeRedirectPath,
  readBrowserCookie,
  writeBrowserCookie,
} from "./auth";

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

function persistAuthSession(payload: AuthSuccessPayload) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  const cookieOptions = {
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "Lax" as const,
    secure,
  };

  writeBrowserCookie(AUTH_COOKIE_NAME, payload.token, cookieOptions);

  if (payload.refresh_token) {
    writeBrowserCookie(REFRESH_TOKEN_COOKIE_NAME, payload.refresh_token, cookieOptions);
  } else {
    deleteBrowserCookie(REFRESH_TOKEN_COOKIE_NAME);
  }

  writeBrowserCookie(USER_COOKIE_NAME, JSON.stringify(payload.user), cookieOptions);
  setAuthData(payload.token, payload.refresh_token, payload.user);
  deleteBrowserCookie(AUTH_ERROR_COOKIE_NAME);
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
    const phone = readTextField(formData, "phone");
    const country = readTextField(formData, "country");
    const address = readTextField(formData, "address");
    
    const registerData = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      phone,
      country,
      address,
    };
    const response = await authAPI.register(registerData);

    payload = response.data;
  } else {
    const response = await authAPI.login(email, password);
    payload = response.data;
  }

  persistAuthSession(payload);

  return {
    redirectTo: resolveAuthRedirect(intent, nextPath),
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
  clearAuthData();
}
