import { authAPI } from "./api";

export type ProductionTicket = {
  id: string;
  commande_id: string;
  quote_id?: string | null;
  status: string;
  created_by?: string | null;
  closed_at?: string | null;
  created_at?: string;
};

export type ProductionTask = {
  id: string;
  ticket_id: string;
  title: string;
  description?: string | null;
  status: string;
  assigned_worker_id?: string | null;
  completed_at?: string | null;
};

export type ProductionReview = {
  id: string;
  task_id: string;
  quote_id?: string | null;
  reviewer_id?: string | null;
  quality_score?: number | null;
  feedback?: string | null;
  delay_reason?: string | null;
  contretemps?: boolean | number;
  hours_estimated?: number | null;
  hours_final?: number | null;
  created_at?: string;
};

export type Retouche = {
  id: string;
  quote_id: string;
  commande_id?: string | null;
  title: string;
  description?: string | null;
  price?: number | string | null;
  status: string;
  created_at?: string;
};

export type ClientHistoryItem = {
  type: string;
  id: string;
  date?: string | null;
  label: string;
  detail: string;
  amount: number | string;
  status: string;
  action_url?: string;
};

export type ClientHistory = {
  user_id: string;
  items: ClientHistoryItem[];
  total: number | string;
  paid_total: number | string;
};

export const workflowAPI = {
  tickets: (quoteId?: string) =>
    authAPI.get<{ data: ProductionTicket[] }>(
      `/production/tickets${quoteId ? `?quote_id=${encodeURIComponent(quoteId)}` : ""}`,
    ),
  createTicket: (data: { commande_id: string; quote_id?: string }) =>
    authAPI.post<{ data: ProductionTicket }>("/production/tickets", data),
  tasks: (ticketId: string) =>
    authAPI.get<{ data: ProductionTask[] }>(`/production/tickets/${ticketId}/tasks`),
  createTask: (ticketId: string, data: { title: string; description?: string; assigned_worker_id?: string }) =>
    authAPI.post<{ data: ProductionTask }>(`/production/tickets/${ticketId}/tasks`, data),
  assign: (taskId: string, workerId: string) =>
    authAPI.put<{ data: ProductionTask }>(`/production/tasks/${taskId}/assign`, { assigned_worker_id: workerId }),
  review: (taskId: string, data: Record<string, unknown>) =>
    authAPI.put<{ data: ProductionTask; review: ProductionReview }>(`/production/tasks/${taskId}/review`, data),
  reviews: (ticketId: string) =>
    authAPI.get<{ data: ProductionReview[] }>(`/production/tickets/${ticketId}/reviews`),
  closeTicket: (ticketId: string) =>
    authAPI.put<{ data: ProductionTicket }>(`/production/tickets/${ticketId}/close`, {}),
  retouches: (quoteId: string) =>
    authAPI.get<{ data: Retouche[] }>(`/retouches?quote_id=${encodeURIComponent(quoteId)}`),
  createRetouche: (data: { quote_id: string; commande_id?: string; title: string; description?: string; price?: number }) =>
    authAPI.post<{ data: Retouche }>("/retouches", data),
  includeRetouche: (id: string, price?: number) =>
    authAPI.put<{ data: Retouche }>(`/retouches/${id}/include`, price !== undefined ? { price } : {}),
  rejectRetouche: (id: string) =>
    authAPI.put<{ data: Retouche }>(`/retouches/${id}/reject`, {}),
  clientHistory: (userId: string) =>
    authAPI.get<ClientHistory>(`/users/${userId}/history`),
};
