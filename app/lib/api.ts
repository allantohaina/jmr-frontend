import { AUTH_COOKIE_NAME, TOKEN_STORAGE_KEY, readBrowserCookie } from "./auth";

const DEFAULT_API_URL = "https://api.jmrtextile.com/api";
const API_REQUEST_TIMEOUT_MS = 15_000;
const API_UPLOAD_TIMEOUT_MS = 45_000;

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
  phone?: string;
  role?: "admin" | "worker" | "user" | string;
  is_privileged?: boolean;
  cumulative_revenue?: number;
  department?: string;
  position?: string;
  hire_date?: string;
  cin?: string;
  profile_image?: string;
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
  reviewed_at?: string | null;
  created_at: string;
};

export type QuoteRecord = {
  id: number | string;
  client_id?: string | null;
  titre?: string;
  progression?: number;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  category?: string;
  tissu?: string;
  coupe?: string;
  gabarit?: string;
  style?: string;
  grammage?: string;
  tailles?: string;
  quantite?: string;
  finitions?: string;
  delai_souhaite?: string;
  request_type?: string;
  modify_code?: string;
  status?: string;
  amount?: string | number | null;
  deposit_amount?: string | number | null;
  balance_amount?: string | number | null;
  deposit_paid?: boolean;
  balance_paid?: boolean;
  files?: Array<{ name: string; url: string; type: string }> | string | null;
  notifications?: Array<{
    id: string;
    type: "delay" | "error" | "info";
    message: string;
    date?: string;
    created_at?: string;
    detail?: string;
    impact?: string;
  }>;
  created_at?: string;
  updated_at?: string;
  admin_signature_name?: string | null;
  admin_signature_at?: string | null;
  confirmation_deadline?: string | null;
  confirmation_days?: number;
  date_livraison_prevue?: string | null;
  deposit_paid_at?: string | null;
  validated_at?: string | null;
  validated_by?: string | null;
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
  en_retard?: boolean;
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
    typeof token === "string" && token.length > 0
      ? token
      : (typeof window !== "undefined" && window.localStorage.getItem(TOKEN_STORAGE_KEY)) ||
        readBrowserCookie(AUTH_COOKIE_NAME);

  if (!isFormDataRequest && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (isFormDataRequest && headers.has("Content-Type")) {
    headers.delete("Content-Type");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (resolvedToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${resolvedToken}`);
  }
  if (resolvedToken && !headers.has("X-Authorization")) {
    headers.set("X-Authorization", `Bearer ${resolvedToken}`);
  }

  const apiUrls = getBackendApiUrls();

  for (let index = 0; index < apiUrls.length; index += 1) {
    const apiUrl = apiUrls[index];

    try {
      const isUpload = options.body instanceof FormData;
      const timeoutMs = isUpload ? API_UPLOAD_TIMEOUT_MS : API_REQUEST_TIMEOUT_MS;
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
      // Merge external signal if provided
      const externalSignal = options.signal;
      if (externalSignal) {
        if (externalSignal.aborted) timeoutController.abort();
        else externalSignal.addEventListener("abort", () => timeoutController.abort(), { once: true });
      }
      let response: Response;

      try {
        response = await fetch(`${apiUrl}${endpoint}`, {
          ...options,
          headers,
          credentials: options.credentials ?? "omit",
          signal: timeoutController.signal,
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
        const isUpload = options.body instanceof FormData;
        const secs = isUpload ? Math.round(API_UPLOAD_TIMEOUT_MS / 1000) : Math.round(API_REQUEST_TIMEOUT_MS / 1000);
        throw new Error(`L'API ne répond pas après ${secs} secondes. Vérifiez votre connexion, la taille du fichier (max 5 Mo pour les images) et que vous êtes connecté en admin, puis réessayez.`);
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

export type WorkerCreatePayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: "admin" | "worker";
  department?: string;
  position?: string;
  hire_date?: string;
  cin?: string;
  profile_image?: string;
};

export type CSVImportResult = {
  message: string;
  created: { line: number; email: string; role: string }[];
  errors: { line: number; email: string; error: string }[];
};

export const usersAPI = {
  createWorker: async (data: WorkerCreatePayload) =>
    fetchWithAuth<{ message: string; user: UserProfile }>("/users/worker", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  importCSV: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchWithAuth<CSVImportResult>("/users/import-csv", {
      method: "POST",
      body: formData,
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

export type PushSubscriptionRecord = {
  id: string;
  user_id: string;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
};

export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BNsDxfgA7RWVBdMWdlsXI6G56Z7emrvP2bACxNd8378UnrCVgF3iA2nQFqBvgeZ9sCL2BY4vJ0f53WLElP-nUR8";

export const pushAPI = {
  list: async () =>
    fetchWithAuth<PushSubscriptionRecord[]>("/push-subscriptions", { method: "GET" }),
  subscribe: async (subscription: PushSubscription) => {
    const subscriptionJson = subscription.toJSON();
    return fetchWithAuth<PushSubscriptionRecord>("/push-subscriptions", {
      method: "POST",
      body: JSON.stringify({
        endpoint: subscriptionJson.endpoint,
        keys: subscriptionJson.keys,
      }),
    });
  },
  unsubscribe: async (id: string) =>
    fetchWithAuth<{ message: string }>(`/push-subscriptions/${id}`, { method: "DELETE" }),
  test: async () => fetchWithAuth<{ message: string }>("/push-subscriptions/test", { method: "POST" }),
};

export type QuoteCheckpoint = {
  id: string;
  quote_id: string;
  commande_id?: string | null;
  title: string;
  description?: string | null;
  status: "upcoming" | "done";
  validated_at?: string | null;
  validated_by?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export const checkpointsAPI = {
  list: async (quoteId: string) =>
    fetchWithAuth<QuoteCheckpoint[]>(`/quote-checkpoints?quote_id=${quoteId}`, { method: "GET" }),
  get: async (id: string) =>
    fetchWithAuth<QuoteCheckpoint>(`/quote-checkpoints/${id}`, { method: "GET" }),
  create: async (data: { quote_id: string; title: string; description?: string; sort_order?: number }) =>
    fetchWithAuth<QuoteCheckpoint>("/quote-checkpoints", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  validate: async (id: string) =>
    fetchWithAuth<QuoteCheckpoint>(`/quote-checkpoints/${id}/validate`, { method: "PUT" }),
  remove: async (id: string) =>
    fetchWithAuth<{ message: string }>(`/quote-checkpoints/${id}`, { method: "DELETE" }),
};

export type QuoteAddon = {
  id: string;
  quote_id: string;
  commande_id?: string | null;
  title: string;
  description?: string | null;
  price?: number | null;
  status: "pending" | "included" | "rejected";
  created_at?: string;
  updated_at?: string;
};

export const addonsAPI = {
  list: async (quoteId: string) =>
    fetchWithAuth<QuoteAddon[]>(`/quote-addons?quote_id=${quoteId}`, { method: "GET" }),
  get: async (id: string) =>
    fetchWithAuth<QuoteAddon>(`/quote-addons/${id}`, { method: "GET" }),
  create: async (data: { quote_id: string; title: string; description?: string; price?: number }) =>
    fetchWithAuth<QuoteAddon>("/quote-addons", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: async (id: string, status: string, price?: number) =>
    fetchWithAuth<QuoteAddon>(`/quote-addons/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, price }),
    }),
  remove: async (id: string) =>
    fetchWithAuth<{ message: string }>(`/quote-addons/${id}`, { method: "DELETE" }),
};

export const paymentsAPI = {
  list: async (quoteId: string) =>
    fetchWithAuth<PaymentRecord[]>(`/payments?quote_id=${quoteId}`, { method: "GET" }),
  get: async (id: string) =>
    fetchWithAuth<PaymentRecord>(`/payments/${id}`, { method: "GET" }),
  updateStatus: async (id: string, status: string, reviewNote?: string) =>
    fetchWithAuth<PaymentRecord>(`/payments/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, review_note: reviewNote }),
    }),
};

export type MatiereRecord = {
  id: string;
  nom: string;
  unite: string;
  stock_actuel: number | string;
  stock_seuil: number | string;
  prix_unite: number | string;
  fournisseur?: string | null;
  description?: string | null;
  alerte?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type MouvementStockRecord = {
  id: string;
  matiere_id: string;
  type: "entree" | "sortie" | "ajustement";
  quantite: number | string;
  motif?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  created_at?: string;
};

export const matieresAPI = {
  list: async () => authAPI.get<{ data: MatiereRecord[]; alertes: MatiereRecord[]; nb_alertes: number }>("/matieres"),
  alertes: async () => authAPI.get<{ data: MatiereRecord[]; total: number }>("/matieres/alertes"),
  get: async (id: string) => authAPI.get<{ data: MatiereRecord; mouvements: MouvementStockRecord[] }>(`/matieres/${id}`),
  create: async (data: Partial<MatiereRecord>) =>
    authAPI.post<{ data: MatiereRecord }>("/matieres", data),
  update: async (id: string, data: Partial<MatiereRecord>) =>
    authAPI.put<{ data: MatiereRecord }>(`/matieres/${id}`, data),
  remove: async (id: string) => authAPI.delete<{ message: string }>(`/matieres/${id}`),
  mouvement: async (data: { matiere_id: string; type: string; quantite: number | string; motif?: string }) =>
    authAPI.post<{ data: MatiereRecord; mouvement: MouvementStockRecord }>("/matieres/mouvements", data),
};

export type AvisRecord = {
  id: string;
  produit_id: string;
  user_id?: string | null;
  note: number;
  commentaire?: string | null;
  statut: "pending" | "approved" | "rejected";
  auteur?: string;
  produit_nom?: string;
  created_at?: string;
};

export const avisAPI = {
  publicList: async (produitId: string) =>
    fetchWithAuth<{ data: AvisRecord[]; note_moyenne: number; nb_avis: number }>(`/produits/${produitId}/avis`, { method: "GET" }),
  submit: async (produitId: string, data: { note: number; commentaire?: string; pseudo?: string }) =>
    authAPI.post<{ data: AvisRecord; message: string }>(`/produits/${produitId}/avis`, data),
  moderationList: async (statut?: string) =>
    authAPI.get<{ data: AvisRecord[] }>(`/avis${statut ? `?statut=${statut}` : ""}`),
  updateStatut: async (id: string, statut: string) =>
    authAPI.put<{ data: AvisRecord }>(`/avis/${id}/statut`, { statut }),
};

export type LienPaiementRecord = {
  id: string;
  commande_id?: string;
  token: string;
  montant: number | string;
  statut: "pending" | "paid";
  expire_at?: string | null;
  paid_at?: string | null;
  url?: string;
  etat?: string;
  commande_numero?: string;
  commande_designation?: string;
  client_nom?: string;
  created_at?: string;
};

export type RecuData = {
  numero: string;
  designation: string;
  client_nom: string;
  client_email: string;
  client_telephone: string;
  date_commande: string;
  quantite: number;
  prix_unitaire: number | string;
  total: number | string;
  total_paye: number | string;
  restant: number | string;
  paiements: Array<{ phase: string; status: string; amount: number | string; created_at?: string; reviewed_at?: string }>;
};

export const commandesExtrasAPI = {
  recuData: async (id: string) => authAPI.get<{ data: RecuData }>(`/commandes/${id}/recu`),
  recuPdfUrl: (id: string) => `${getBackendApiUrls()[0]}/commandes/${id}/recu.pdf`,
  lienPaiement: async (id: string, data: { montant: number | string; phase?: string; expire_at?: string }) =>
    authAPI.post<{ data: LienPaiementRecord }>(`/commandes/${id}/lien-paiement`, data),
  qrData: async (id: string) => authAPI.get<{ data: { url: string; numero: string } }>(`/commandes/${id}/qr-data`),
};

export const publicAPI = {
  suiviCommande: async (numero: string, email: string) =>
    fetchWithAuth<{ data: SuiviCommandeRecord }>("/public/suivi-commande", {
      method: "POST",
      body: JSON.stringify({ numero, email }),
    }),
  lienInfo: async (token: string) => fetchWithAuth<{ data: LienPaiementRecord }>(`/public/lien-paiement/${token}`, { method: "GET" }),
  lienPayer: async (token: string) =>
    fetchWithAuth<{ data: LienPaiementRecord; paiement_id: string; message: string }>(`/public/lien-paiement/${token}/payer`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
};

export type SuiviCommandeRecord = {
  numero: string;
  designation: string;
  quantite: number;
  statut_production: string;
  pieces_produites: number;
  date_commande?: string | null;
  date_livraison_prevue?: string | null;
  date_livraison_reelle?: string | null;
  en_retard: boolean;
};

export type DashboardStats = {
  devis: Record<string, number>;
  finance: Record<string, number | string>;
  commandes: Record<string, number>;
  stock: Record<string, number>;
  satisfaction: Record<string, number>;
  relationnel: Record<string, number>;
};

export const statsAPI = {
  dashboard: async () => authAPI.get<DashboardStats>("/stats/dashboard"),
};

export function downloadBackendFile(endpoint: string, token?: string) {
  const apiUrl = getBackendApiUrls()[0];
  const resolvedToken =
    (typeof token === "string" && token.length > 0
      ? token
      : (typeof window !== "undefined" && window.localStorage.getItem(TOKEN_STORAGE_KEY)) ||
        readBrowserCookie(AUTH_COOKIE_NAME)) || "";
  return fetch(`${apiUrl}${endpoint}`, {
    method: "GET",
    headers: { Accept: "text/csv, application/json", ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}) },
  });
}

export const exportsAPI = {
  devis: (token?: string) => downloadBackendFile("/exports/devis", token),
  commandes: (token?: string) => downloadBackendFile("/exports/commandes", token),
  paiements: (token?: string) => downloadBackendFile("/exports/paiements", token),
};

export type PointFideliteRecord = {
  id: string;
  user_id: string;
  points: number | string;
  motif: string;
  reference_type?: string | null;
  reference_id?: string | null;
  created_at?: string;
};

export const pointsAPI = {
  mine: async () => authAPI.get<{ data: PointFideliteRecord[]; solde: number }>("/moi/points"),
};

export const kanbanAPI = {
  board: async () => authAPI.get<KanbanBoard>("/workflows/kanban"),
};

export type KanbanBoard = {
  data: Record<string, KanbanCard[]>;
  counts: Record<string, number>;
  status_labels: Record<string, string>;
};

export type KanbanCard = {
  id: string;
  name?: string;
  client_name?: string;
  workflow_type?: string;
  delivery_date?: string | null;
  launch_date?: string | null;
  current_step?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export const workflowsAPI = {
  board: async () => authAPI.get<KanbanBoard>("/workflows/kanban"),
};
