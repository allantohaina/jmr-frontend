"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_COOKIE_NAME,
  AUTH_ERROR_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  USER_COOKIE_NAME,
  getSafeRedirectPath,
} from "../lib/auth";
import { getSessionToken, getRefreshToken } from "../lib/auth-server";
import { authAPI } from "../lib/api";

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

const AUTH_ERROR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 5, // 5 minutes
};

type AuthResponse = {
  data: {
    token: string;
    refresh_token?: string;
    user: unknown;
  };
};

async function setAuthCookies({ data }: AuthResponse) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, data.token, AUTH_COOKIE_OPTIONS);
  if (data.refresh_token) {
    cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, data.refresh_token, AUTH_COOKIE_OPTIONS);
  }
  cookieStore.set(USER_COOKIE_NAME, JSON.stringify(data.user), AUTH_COOKIE_OPTIONS);
}

async function runAuthRequest(request: () => Promise<AuthResponse>) {
  try {
    const response = await request();
    await setAuthCookies(response);
  } catch {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_ERROR_COOKIE_NAME, "auth_failed", AUTH_ERROR_COOKIE_OPTIONS);
    redirect("/mon-profil");
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const intent = formData.get("intent") as string;
  const nextPath = getSafeRedirectPath(formData.get("next"));

  if (intent === "signup") {
    // For now, let's just redirect to a signup page if it exists, or handle it here
    // Since we're connecting backend, let's assume we might need a registration form
    // For this task, let's focus on the login flow first.
    if (!email || !password) {
      // In a real app, we'd return an error. For now, let's just redirect back.
      redirect("/mon-profil?error=missing_credentials");
    }

    const firstName = (formData.get("first_name") as string) || "User";
    const lastName = (formData.get("last_name") as string) || "New";
    await runAuthRequest(() =>
      authAPI.register({ email, password, first_name: firstName, last_name: lastName }),
    );
  } else {
    // Login flow
    const resolvedEmail = email || "";
    const resolvedPassword = password || "";

    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' || 
                     (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCKS !== 'false');

    // MOCK LOGIN FOR STATIC ACCOUNTS
    if (useMocks && resolvedEmail === "client@test.com" && resolvedPassword === "test") {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, "mock_token_client", AUTH_COOKIE_OPTIONS);
      cookieStore.set(USER_COOKIE_NAME, JSON.stringify({ id: 101, first_name: "Client", last_name: "Lambda", email: "client@test.com", role: "user" }), AUTH_COOKIE_OPTIONS);
    } else if (useMocks && resolvedEmail === "worker@test.com" && resolvedPassword === "test") {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, "mock_token_worker", AUTH_COOKIE_OPTIONS);
      cookieStore.set(USER_COOKIE_NAME, JSON.stringify({ id: 102, first_name: "Opérateur", last_name: "Atelier", email: "worker@test.com", role: "worker" }), AUTH_COOKIE_OPTIONS);
    } else if (useMocks && resolvedEmail === "admin@test.com" && resolvedPassword === "test") {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, "mock_token_admin", AUTH_COOKIE_OPTIONS);
      cookieStore.set(USER_COOKIE_NAME, JSON.stringify({ id: 103, first_name: "Admin", last_name: "Atelier", email: "admin@test.com", role: "admin" }), AUTH_COOKIE_OPTIONS);
    } else {
      await runAuthRequest(() => authAPI.login(resolvedEmail, resolvedPassword));
    }
  }

  if (nextPath) {
    redirect(nextPath);
  }

  if (intent === "signup") {
    redirect("/?success=signup#acces-client");
  }

  redirect("/?success=login#acces-client");
}

export async function signOut(formData: FormData) {
  const token = await getSessionToken();
  const refreshToken = await getRefreshToken();

  if (token) {
    try {
      await authAPI.logout(refreshToken, token);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);

  const nextPath = getSafeRedirectPath(formData.get("next"));
  redirect(nextPath ?? "/");
}
