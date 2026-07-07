import { AUTH_COOKIE_NAME, readBrowserCookie } from "./auth";

const DEFAULT_API_URL =
  process.env.NODE_ENV === "production" ? "https://api.jmrtextile.com/api" : "http://localhost:8081/api";
const FALLBACK_API_URL = "http://localhost:8080/api";

function normalizeApiUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function getFallbackApiUrl(baseUrl: string) {
  try {
    const parsed = new URL(baseUrl);

    if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1" && parsed.hostname !== "::1") {
      return undefined;
    }

    if (parsed.port && parsed.port !== "8081") {
      return undefined;
    }

    parsed.port = "8080";
    return normalizeApiUrl(parsed.toString());
  } catch {
    if (baseUrl.includes("localhost:8081")) {
      return normalizeApiUrl(baseUrl.replace("localhost:8081", "localhost:8080"));
    }

    if (baseUrl.includes("127.0.0.1:8081")) {
      return normalizeApiUrl(baseUrl.replace("127.0.0.1:8081", "127.0.0.1:8080"));
    }

    return undefined;
  }
}

export function getBackendApiUrls() {
  const configuredUrl = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL);
  const urls = [configuredUrl];
  const fallbackUrl = getFallbackApiUrl(configuredUrl);

  if (fallbackUrl && fallbackUrl !== configuredUrl) {
    urls.push(fallbackUrl);
  } else if (!process.env.NEXT_PUBLIC_API_URL && configuredUrl === "http://localhost:8081/api") {
    urls.push(FALLBACK_API_URL);
  }

  return Array.from(new Set(urls));
}

function isRetryableBackendError(error: unknown) {
  return error instanceof TypeError || (error instanceof Error && /fetch failed/i.test(error.message));
}

function isRetryableBackendStatus(status: number) {
  return status === 502 || status === 503 || status === 504;
}

function getRuntimeLabel() {
  return typeof window === "undefined" ? "server" : "browser";
}

function logApiAttempt(runtime: string, method: string, endpoint: string, apiUrl: string, attempt: number, total: number) {
  console.info(`[API][${runtime}] ${method} ${endpoint} -> ${apiUrl} (${attempt}/${total})`);
}

function logApiRetry(runtime: string, method: string, endpoint: string, apiUrl: string, reason: string) {
  console.warn(`[API][${runtime}] retry ${method} ${endpoint} via ${apiUrl} because ${reason}`);
}

function logApiSuccess(runtime: string, method: string, endpoint: string, apiUrl: string, status: number) {
  console.info(`[API][${runtime}] ${status} ${method} ${endpoint} via ${apiUrl}`);
}

function logApiFailure(runtime: string, method: string, endpoint: string, apiUrl: string, error: unknown) {
  console.error(`[API][${runtime}] failed ${method} ${endpoint} via ${apiUrl}`, error);
}

export type ApiResponse<T = unknown> = {
  status: "success" | "error";
  message?: string;
  data: T;
  error?: string | Record<string, string[]>;
};

export class ApiValidationError extends Error {
  constructor(
    message: string,
    public fieldErrors: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiValidationError";
  }
}

export type UserProfile = {
  id: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: string;
  birth_date?: string;
  role?: "admin" | "worker" | "user" | string;
};

export type Notification = {
  id: string;
  user_id?: string | null;
  quote_id?: number | null;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
};

export type QuoteStatus = "pending" | "in_review" | "quoted" | "rejected" | "completed";

export type Quote = {
  id: number;
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  tissu?: string | null;
  coupe?: string | null;
  gabarit?: string | null;
  style?: string | null;
  grammage?: string | null;
  tailles?: string | null;
  quantite?: string | null;
  finitions?: string | null;
  delai_souhaite?: string | null;
  modify_code?: string | null;
  request_type?: "new" | "edit";
  category?: string | null;
  status: QuoteStatus;
  amount?: number | null;
  deposit_amount?: number | null;
  balance_amount?: number | null;
  deposit_paid: boolean;
  balance_paid: boolean;
  created_at: string;
  updated_at: string;
};

export type QuoteRecord = {
  id: number | string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  request_type?: string;
  modify_code?: string;
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
  birth_date?: string;
  phone?: string;
  country?: string;
  address?: string;
};

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

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

function readErrorMessage(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const { error, message } = payload as ApiErrorPayload;

  if (typeof message === "string") {
    return message;
  }

  return typeof error === "string" ? error : undefined;
}

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
  const resolvedToken =
    typeof token === "string" && token.length > 0 ? token : readBrowserCookie(AUTH_COOKIE_NAME) || getToken();

  if (!isFormDataRequest && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (resolvedToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${resolvedToken}`);
  }

  const apiUrls = getBackendApiUrls();
  const runtime = getRuntimeLabel();
  const method = (options.method ?? "GET").toString().toUpperCase();

  for (let index = 0; index < apiUrls.length; index += 1) {
    const apiUrl = apiUrls[index];
    logApiAttempt(runtime, method, endpoint, apiUrl, index + 1, apiUrls.length);

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: options.credentials ?? "include",
      });

      if (!response.ok && isRetryableBackendStatus(response.status) && index < apiUrls.length - 1) {
        logApiRetry(runtime, method, endpoint, apiUrl, `status ${response.status}`);
        continue;
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch (error) {
        console.error("Failed to parse API response as JSON:", error);
        throw new Error(`Invalid JSON response from server (${response.status})`);
      }

      if (!response.ok) {
        const message = readErrorMessage(data) || "An error occurred";
        
        // Check if data contains field errors (like CodeIgniter's validation errors)
        const payload = data as { error?: string | Record<string, string[]>; errors?: Record<string, string[]>; message?: string };
        const fieldErrors = 
          (typeof payload.error === "object" && payload.error !== null ? payload.error : {}) as Record<string, string[]>;
        const additionalErrors = 
          (typeof payload.errors === "object" && payload.errors !== null ? payload.errors : {}) as Record<string, string[]>;
        
        const mergedErrors = { ...fieldErrors, ...additionalErrors };
        
        if (Object.keys(mergedErrors).length > 0) {
          throw new ApiValidationError(message, mergedErrors);
        }
        
        throw new Error(message);
      }

      logApiSuccess(runtime, method, endpoint, apiUrl, response.status);

      if (data && typeof data === "object" && !("status" in data) && !("data" in data)) {
        return {
          status: "success",
          data: data,
        } as ApiResponse<T>;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      if (index < apiUrls.length - 1 && isRetryableBackendError(error)) {
        logApiRetry(runtime, method, endpoint, apiUrl, "network error");
        continue;
      }

      logApiFailure(runtime, method, endpoint, apiUrl, error);
      throw error;
    }
  }

  throw new Error("Backend unavailable");
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

  // Quotes
  getQuotes: async (token?: string, status?: QuoteStatus) => {
    let url = "/quotes";
    if (status) url += `?status=${status}`;
    return fetchWithAuth<{ data: Quote[]; total: number; limit: number; offset: number }>(url, {
      method: "GET",
    }, token);
  },

  updateQuoteStatus: async (quoteId: number, status: QuoteStatus, additionalData?: Record<string, unknown>, token?: string) => {
    return fetchWithAuth<{ quote: Quote; message: string }>(`/quotes/${quoteId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, ...additionalData }),
    }, token);
  },

  // Notifications
  getNotifications: async (token?: string) => {
    return fetchWithAuth<{ data: Notification[] }>("/quotes/notifications", {
      method: "GET",
    }, token);
  },

  markNotificationRead: async (notificationId: string, token?: string) => {
    return fetchWithAuth<{ message: string }>(`/quotes/notifications/${notificationId}/read`, {
      method: "PUT",
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
