"use client";

import type { UserProfile } from "./api";
import { authAPI } from "./api";

export function getIsSignedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("jmr_token");
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jmr_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jmr_refresh_token");
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const userJson = localStorage.getItem("jmr_user");
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(verify: boolean = false): Promise<UserProfile | null> {
  const token = getSessionToken();
  const user = getStoredUser();

  if (!user) return null;

  if (verify && token) {
    try {
      const response = await authAPI.getProfile(token);
      if (response.status === "success") {
        localStorage.setItem("jmr_user", JSON.stringify(response.data));
        return response.data;
      }
    } catch {
      return null;
    }
  }

  return user;
}
