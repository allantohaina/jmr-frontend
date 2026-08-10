import { AUTH_COOKIE_NAME, readBrowserCookie } from "./auth";

const DEFAULT_API_URL = "https://api.jmrtextile.com/api";
const API_REQUEST_TIMEOUT_MS = 15_000;

function normalizeApiUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getBackendApiUrls() {
  const configuredUrl = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL);
  return [configuredUrl];
}

function isRetryableBackendError(error: unknown) {
  return error instanceof TypeError || (error instanceof Error && /fetch failed/i.test(error.message));
}

function isRetryableBackendStatus(status: number) {
  return status === 502 || status === 503 || status === 504;
}

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
  role?: "admin" | "worker" | "user" | string;
  is_privileged?: boolean;
  cumulative_revenue?: number;
};

export type NotificationRecord = {
  id: string;
  entity_type: "quote" | "commande" | "ticket" | "payment" | string;
  entity_id?: string | null;
  event: string;
  type: "info" | "success" | "warning" | "error" | string;
  title: string;
  message: string;
  action_url?: string | null;
  read_at?: string | null;
  created_at: string;
};

export type PaymentRecord = {
  id: string;
  quote_id: string;
  commande_id?: string | null;
  phase: "deposit" | "balance";
  amount: number | string;
  status: "submitted" | "verified" | "rejected";
  proof_path?: string | null;
  review_note?: string | null;
  created_at: string;
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
  created_at?: string;
  updated_at?: string;
  admin_signature_name?: string | null;
  admin_signature_at?: string | null;
  confirmation_deadline?: string | null;
  confirmation_days?: number;
  date_livraison_prevue?: string | null;
};

export type CommandeRecord = {
  id: string;
  cotation_id?: string | null;
  client_id: string;
  numero: string;
  designation?: string | null;
  quantite: number;
  prix_unitaire: number;
  total: number;
  statut_production: StatutProduction;
  pieces_produites: number;
  date_commande: string;
  date_livraison_prevue?: string | null;
  date_livraison_reelle?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  client_email?: string;
  client_first_name?: string;
  client_last_name?: string;
  admin_signature_name?: string | null;
  admin_signature_at?: string | null;
};

export type AchatRecord = {
  id: string;
  fournisseur: string;
  categorie: string;
  montant: number;
  date_achat: string;
  statut: string;
  description?: string | null;
  created_at?: string;
};

export type BonLivraisonRecord = {
  id: string;
  commande_id: string;
  numero: string;
  date_livraison: string;
  destinataire: string;
  articles?: Array<{ designation: string; quantite: number; unite: string }> | null;
  statut: string;
  notes?: string | null;
  created_at?: string;
  commande_numero?: string;
  commande_designation?: string;
  admin_signature_name?: string | null;
  admin_signature_at?: string | null;
};

export const STATUTS_PRODUCTION = [
  "En attente matière",
  "Coupe",
  "Couture",
  "Finition",
  "Prête",
  "Livrée",
] as const;

export type StatutProduction = (typeof STATUTS_PRODUCTION)[number];

export const STATUTS_BON_LIVRAISON = [
  "Préparé",
  "Expédié",
  "Livré",
  "Annulé",
] as const;

export const STATUTS_ACHAT = [
  "Payé",
  "En attente",
  "Annulé",
] as const;

export const CATEGORIES_ACHAT = [
  "Matière Première",
  "Fournitures",
  "Maintenance",
  "Services",
] as const;

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
  error?: string | number;
  messages?: Record<string, string>;
};

type ApiJsonBody = Record<string, unknown>;
type ApiBody = ApiJsonBody | FormData;

function readErrorMessage(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const { error, message, messages } = payload as ApiErrorPayload;

  if (typeof message === "string") {
    return message;
  }

  if (typeof messages === "object" && messages !== null) {
    const firstMsg = Object.values(messages).find((m) => typeof m === "string");
    if (firstMsg) return firstMsg;
  }

  return typeof error === "string" ? error : undefined;
}

function toRequestBody(payload: ApiBody) {
  return payload instanceof FormData ? payload : JSON.stringify(payload);
}

function toFormData(values: Record<string, string | undefined>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });

  return formData;
}

export async function fetchWithAuth<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  const isFormDataRequest = options.body instanceof FormData;
  const resolvedToken =
    typeof token === "string" && token.length > 0 ? token : readBrowserCookie(AUTH_COOKIE_NAME);

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

  for (let index = 0; index < apiUrls.length; index += 1) {
    const apiUrl = apiUrls[index];

    try {
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), API_REQUEST_TIMEOUT_MS);
      let response: Response;

      try {
        response = await fetch(`${apiUrl}${endpoint}`, {
          ...options,
          headers,
          credentials: options.credentials ?? "omit",
          signal: options.signal ?? timeoutController.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok && isRetryableBackendStatus(response.status) && index < apiUrls.length - 1) {
        continue;
      }

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(readErrorMessage(data) || "Une erreur est survenue.");
      }

      if (data && typeof data === "object" && !("status" in data) && !("data" in data)) {
        return {
          status: "success",
          data: data,
        } as ApiResponse<T>;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("L'API ne répond pas après 15 secondes. Vérifiez la connexion entre le frontend et le backend, puis réessayez.");
      }

      if (index < apiUrls.length - 1 && isRetryableBackendError(error)) {
        continue;
      }

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

  delete: async <TResponse = unknown>(endpoint: string, token?: string) => {
    return fetchWithAuth<TResponse>(endpoint, {
      method: "DELETE",
    }, token);
  },

  signQuote: async (quoteId: string | number, signature: { name: string; signedAt: string | Date }) => {
    return fetchWithAuth<QuoteRecord>(`/quotes/${quoteId}/sign`, {
      method: "PUT",
      body: JSON.stringify({
        admin_signature_name: signature.name,
        admin_signature_at: signature.signedAt instanceof Date ? signature.signedAt.toISOString() : signature.signedAt,
      }),
    });
  },

  signCommande: async (commandeId: string, signature: { name: string; signedAt: string | Date }) => {
    return fetchWithAuth<CommandeRecord>(`/commandes/${commandeId}/sign`, {
      method: "PUT",
      body: JSON.stringify({
        admin_signature_name: signature.name,
        admin_signature_at: signature.signedAt instanceof Date ? signature.signedAt.toISOString() : signature.signedAt,
      }),
    });
  },

  signBonLivraison: async (bonId: string, signature: { name: string; signedAt: string | Date }) => {
    return fetchWithAuth<BonLivraisonRecord>(`/bon-livraison/${bonId}/sign`, {
      method: "PUT",
      body: JSON.stringify({
        admin_signature_name: signature.name,
        admin_signature_at: signature.signedAt instanceof Date ? signature.signedAt.toISOString() : signature.signedAt,
      }),
    });
  },
};

export const notificationsAPI = {
  list: async (unreadOnly = false) =>
    fetchWithAuth<NotificationRecord[]>(
      `/notifications${unreadOnly ? "?unread_only=true" : ""}`,
      { method: "GET" },
    ),
  markRead: async (id: string) =>
    fetchWithAuth<NotificationRecord>(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: async () =>
    fetchWithAuth<{ message: string }>("/notifications/read-all", { method: "PUT" }),
};
