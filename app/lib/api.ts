const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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
  role?: "admin" | "user" | string;
};

export type QuoteRecord = {
  id: number | string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  status?: string;
  amount?: string | number | null;
};

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

type ApiErrorPayload = {
  message?: string;
};

type ApiJsonBody = Record<string, unknown>;
type ApiBody = ApiJsonBody | FormData;

function readErrorMessage(payload: unknown) {
  if (typeof payload !== "object" || payload === null || !("message" in payload)) {
    return undefined;
  }

  const { message } = payload as ApiErrorPayload;
  return typeof message === "string" ? message : undefined;
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

  if (!isFormDataRequest && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    console.error("Failed to parse API response as JSON:", {
      url: `${API_URL}${endpoint}`,
      status: response.status,
      error: e
    });
    throw new Error(`Invalid JSON response from server (${response.status})`);
  }

  console.log("API Response:", {
    url: `${API_URL}${endpoint}`,
    status: response.status,
    data
  });

  if (!response.ok) {
    throw new Error(readErrorMessage(data) || "An error occurred");
  }

  // Si le backend ne renvoie pas le format { status, data }, on l'adapte
  if (data && !data.status && !data.data) {
    return {
      status: "success",
      data: data
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

  getProfile: async (token: string) => {
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
