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
  // --- MOCK MODE ---
  // On utilise le mode Mock si spécifié par variable d'environnement ou en développement par défaut
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' || 
                   (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCKS !== 'false'); 

  if (useMocks) {
    console.log(`[API MOCK] Intercepting ${options.method || 'GET'} ${endpoint}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // MOCK DATA STORAGE
    const MOCK_QUOTES: QuoteRecord[] = [
      { 
        id: "DV-001", 
        name: "Client Lambda", 
        email: "client@test.com", 
        status: "draft", 
        message: "Besoin de 50 polos en coton bio.",
        files: [{ name: "design.pdf", url: "#", type: "pdf" }]
      },
      { 
        id: "DV-002", 
        name: "Atelier Granville", 
        email: "pro@test.com", 
        status: "accepted", 
        amount: 1500,
        deposit_amount: 750,
        deposit_paid: true,
        message: "Commande de vestes hiver."
      }
    ];

    const MOCK_ORDERS = [
      { id: 1, client: "Maison Haussmann", date: "24 Mars 2024", status: "Production", motive: "Assemblage en cours (Veste Laine)" },
      { id: 2, client: "Atelier Granville", date: "22 Mars 2024", status: "Retard", motive: "Rupture de stock tissu soie bleu marine", type: "error" },
      { id: 3, client: "Studio Luxe", date: "20 Mars 2024", status: "En attente", motive: "Validation du prototype par le client", type: "warning" },
    ];

    const MOCK_PRODUCTION = [
      { id: 1, name: "Ligne A - Polos", status: "en_cours", order: "#CMD-104", progress: 65, issues: [] },
      { id: 2, name: "Ligne B - Chemises", status: "probleme", order: "#CMD-105", progress: 30, issues: ["Machine #4 en panne"] },
    ];

    if (endpoint === "/quotes") return { status: "success", data: MOCK_QUOTES as T };
    if (endpoint.startsWith("/quotes/")) {
      const id = endpoint.split("/").pop();
      const quote = MOCK_QUOTES.find(q => q.id === id) || MOCK_QUOTES[0];
      return { status: "success", data: quote as T };
    }

    if (endpoint === "/orders") return { status: "success", data: MOCK_ORDERS as T };
    if (endpoint === "/production") return { status: "success", data: MOCK_PRODUCTION as T };

    if (endpoint === "/visitors") {
      const MOCK_VISITORS = [
        { id: 1, pseudonym: "Curieux Styliste #452", status: "online", page: "/#accueil", duration: "2min" },
        { id: 2, pseudonym: "Créatif Tailleur #12", status: "online", page: "/#nos-services", duration: "5min" },
        { id: 3, pseudonym: "Rapide Explorateur #89", status: "offline", page: "/mentions-legales", duration: "10min" },
      ];
      return { status: "success", data: MOCK_VISITORS as T };
    }

    if (endpoint === "/security-logs") {
      const MOCK_LOGS = [
        { id: 1, type: "unauthorized_access", message: "Tentative d'accès direct à /admin par une IP inconnue", date: "26/03/2026 14:20" },
        { id: 2, type: "unauthorized_access", message: "Tentative d'accès direct à /admin par worker@test.com", date: "26/03/2026 15:45" },
      ];
      return { status: "success", data: MOCK_LOGS as T };
    }

    if (endpoint.includes("/users/profile")) {
      // Simulation des 3 types de comptes demandés
      if (token === "mock_token_client") {
        return { 
          status: "success", 
          data: { id: 101, first_name: "Client", last_name: "Lambda", email: "client@test.com", role: "user" } as T 
        };
      }
      if (token === "mock_token_worker") {
        return { 
          status: "success", 
          data: { id: 102, first_name: "Atelier", last_name: "Opérateur", email: "worker@test.com", role: "worker" } as T 
        };
      }
      if (token === "mock_token_admin") {
        return { 
          status: "success", 
          data: { id: 103, first_name: "Admin", last_name: "Atelier", email: "admin@test.com", role: "admin" } as T 
        };
      }
      
      const mockUser: UserProfile = {
        id: 1,
        first_name: "Admin",
        last_name: "JMR",
        email: "admin@jmr.com",
        role: "admin"
      };
      return { status: "success", data: mockUser as T };
    }
  }
  // --- END MOCK MODE ---

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
