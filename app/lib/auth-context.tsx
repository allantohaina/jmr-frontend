"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, type UserProfile } from "./api";

export const AUTH_STORAGE_KEYS = {
  token: "jmr_token",
  refreshToken: "jmr_refresh_token",
  user: "jmr_user",
};

type AuthContextType = {
  user: UserProfile | null;
  token: string | null;
  isSignedIn: boolean;
  isAdmin: boolean;
  isWorker: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadFromStorage() {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    const userJson = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    const user = userJson ? JSON.parse(userJson) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function saveToStorage(token: string, user: UserProfile) {
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
}

function clearStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { token: savedToken, user: savedUser } = loadFromStorage();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    if (response.status === "success" && response.data) {
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      saveToStorage(newToken, newUser);
    } else {
      throw new Error(response.message || "Échec de connexion");
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; first_name: string; last_name: string }) => {
    const response = await authAPI.register(data);
    if (response.status === "success" && response.data) {
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      saveToStorage(newToken, newUser);
    } else {
      throw new Error(response.message || "Échec d'inscription");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
      await authAPI.logout(refreshToken || undefined, token || undefined);
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setToken(null);
    clearStorage();
  }, [token]);

  const refreshSession = useCallback(async () => {
    if (!token) return;
    try {
      const response = await authAPI.getProfile(token);
      if (response.status === "success" && response.data) {
        setUser(response.data);
        localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(response.data));
      }
    } catch {
      // Token expired or invalid
      setUser(null);
      setToken(null);
      clearStorage();
    }
  }, [token]);

  const value = {
    user,
    token,
    isSignedIn: !!token && !!user,
    isAdmin: user?.role === "admin",
    isWorker: user?.role === "worker",
    login,
    register,
    logout,
    refreshSession,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
