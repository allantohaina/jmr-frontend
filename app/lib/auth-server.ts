import { cookies } from "next/headers";
import { authAPI, type UserProfile } from "./api";
import {
  AUTH_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  USER_COOKIE_NAME,
} from "./auth";

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

export async function getCurrentUser(verify: boolean = false): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const userJson = cookieStore.get(USER_COOKIE_NAME)?.value;
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  if (verify) {
    try {
      const response = await authAPI.getProfile(token);
      if (response.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }

  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(userJson)) as UserProfile;
  } catch {
    try {
      return JSON.parse(userJson) as UserProfile;
    } catch {
      return null;
    }
  }
}
