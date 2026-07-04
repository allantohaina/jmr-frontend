const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.jmrtextile.com/api";

export type ApiResponse<T = unknown> = {
  status: "success" | "error";
  message?: string;
  data: T;
};

export type UserProfile = {
  id: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: "admin" | "user" | "worker" | string;
};

export type QuoteRecord = {
  id: number | string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  status?: string;
  amount?: string | number | null;
  deposit_amount?: string | number | null;
  balance_amount?: string | number | null;
  deposit_paid?: boolean;
  balance_paid?: boolean;
  files?: Array<{ name: string; url: string; type: string }>;
  notifications?: Array<{ id: string; type: "delay" | "error" | "info"; message: string; date: string }>;
};

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

// Token management with localStorage
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jmr_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jmr_refresh_token");
}

export function getUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("jmr_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function setAuthData(token: string, refreshToken: string | undefined, user: UserProfile) {
  localStorage.setItem("jmr_token", token);
  if (refreshToken) {
    localStorage.setItem("jmr_refresh_token", refreshToken);
  }
  localStorage.setItem("jmr_user", JSON.stringify(user));
}

export function clearAuthData() {
  localStorage.removeItem("jmr_token");
  localStorage.removeItem("jmr_refresh_token");
  localStorage.removeItem("jmr_user");
}

export function isSignedIn(): boolean {
  return !!getToken();
}

type ApiJsonBody = Record<string, unknown>;
type ApiBody = ApiJsonBody | FormData;

function toRequestBody(payload: ApiBody) {
  return payload instanceof FormData ? payload : JSON.stringify(payload);
}

export async function fetchWithAuth<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  const isFormDataRequest = options.body instanceof FormData;

  if (!isFormDataRequest && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const effectiveToken = token || getToken();
  if (effectiveToken) {
    headers.set("Authorization", `Bearer ${effectiveToken}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Invalid JSON response from server (${response.status})`);
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? (data as { message: string }).message
        : "An error occurred";
    throw new Error(message);
  }

  if (data && typeof data === "object" && !("status" in data) && !("data" in data)) {
    return {
      status: "success",
      data: data as T,
    } as ApiResponse<T>;
  }

  return data as ApiResponse<T>;
}

export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchWithAuth<{ token: string; refresh_token?: string; user: UserProfile }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: RegisterPayload) => {
    return fetchWithAuth<{ token: string; refresh_token?: string; user: UserProfile }>("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  logout: async (refreshToken?: string, token?: string) => {
    return fetchWithAuth("/users/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }, token);
  },

  getProfile: async (token?: string) => {
    return fetchWithAuth<UserProfile>("/users/profile", {
      method: "GET",
    }, token);
  },

  post: async <TResponse = unknown>(endpoint: string, data: ApiBody, token?: string) => {
    return fetchWithAuth<TResponse>(endpoint, {
      method: "POST",
      body: toRequestBody(data),
    }, token);
  },

  get: async <TResponse = unknown>(endpoint: string, token?: string) => {
    return fetchWithAuth<TResponse>(endpoint, {
      method: "GET",
    }, token);
  },

  put: async <TResponse = unknown>(endpoint: string, data: ApiBody, token?: string) => {
    return fetchWithAuth<TResponse>(endpoint, {
      method: "PUT",
      body: toRequestBody(data),
    }, token);
  },
};
