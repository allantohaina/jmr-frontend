import { authAPI } from "@/app/lib/api";

export type ProformaStatus = "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
export type ProformaCurrency = "MGA" | "EUR" | "USD";

export type ProformaLine = {
  description: string;
  detail?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  taxRate?: number | null;
};

export type ProformaRecord = {
  id: string;
  number: string;
  seq: number;
  year: number;
  status: ProformaStatus;
  quote_id?: string | null;
  client_id?: string | null;
  client_name: string;
  client_email?: string | null;
  client_phone?: string | null;
  client_address?: string | null;
  client_tax_id?: string | null;
  currency: ProformaCurrency;
  tax_rate: number;
  discount_pct: number;
  deposit_pct: number;
  lines: ProformaLine[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  deposit_amount: number;
  balance_amount: number;
  issue_date?: string | null;
  valid_until?: string | null;
  delivery_address?: string | null;
  order_reference?: string | null;
  payment_terms?: string | null;
  notes?: string | null;
  admin_signature_name?: string | null;
  admin_signature_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProformaInput = {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_tax_id?: string;
  currency?: ProformaCurrency;
  tax_rate?: number;
  discount_pct?: number;
  deposit_pct?: number;
  lines: ProformaLine[];
  quote_id?: string;
  client_id?: string;
  issue_date?: string;
  valid_until?: string;
  delivery_address?: string;
  order_reference?: string;
  payment_terms?: string;
  notes?: string;
  status?: ProformaStatus;
};

export const PROFORMA_STATUSES: { key: ProformaStatus | "all"; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "draft", label: "Brouillons" },
  { key: "sent", label: "Envoyées" },
  { key: "accepted", label: "Acceptées" },
  { key: "rejected", label: "Refusées" },
  { key: "expired", label: "Expirées" },
  { key: "converted", label: "Facturées" },
];

export function proformaStatusLabel(s?: string | null): string {
  switch (s) {
    case "draft": return "Brouillon";
    case "sent": return "Envoyée";
    case "accepted": return "Acceptée";
    case "rejected": return "Refusée";
    case "expired": return "Expirée";
    case "converted": return "Facturée";
    default: return s || "—";
  }
}

export function formatMoney(value: number, currency: ProformaCurrency = "MGA"): string {
  if (currency === "MGA") {
    return `${Math.round(value).toLocaleString("fr-FR")} Ar`;
  }
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);
  } catch {
    return `${value.toLocaleString("fr-FR")} ${currency}`;
  }
}

export function computeProformaTotals(lines: ProformaLine[], taxRate = 20, discountPct = 0, depositPct = 50) {
  let subtotal = 0;
  let tax = 0;
  for (const l of lines) {
    const t = l.quantity * l.unitPrice;
    subtotal += t;
    const rate = l.taxRate ?? taxRate;
    tax += t * (rate / 100);
  }
  const discount = subtotal * (discountPct / 100);
  const taxable = Math.max(0, subtotal - discount);
  const taxAfter = subtotal > 0 ? tax * (taxable / subtotal) : 0;
  const total = taxable + taxAfter;
  const deposit = total * (depositPct / 100);
  return {
    subtotal, discount, tax: taxAfter, total,
    deposit, balance: total - deposit,
  };
}

export const proformaAPI = {
  list: async (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status && params.status !== "all") q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    const suffix = q.toString() ? `?${q.toString()}` : "";
    const res = await authAPI.get<ProformaRecord[] | { data?: ProformaRecord[] }>(`/proformas${suffix}`);
    const d = res.data as ProformaRecord[] | { data?: ProformaRecord[] };
    return Array.isArray(d) ? d : (d?.data ?? []);
  },
  get: async (id: string) => {
    const res = await authAPI.get<ProformaRecord | { data?: ProformaRecord }>(`/proformas/${id}`);
    const d = res.data as ProformaRecord | { data?: ProformaRecord };
    return (d as { data?: ProformaRecord }).data ?? (d as ProformaRecord);
  },
  nextNumber: async () => {
    const res = await authAPI.get<{ number: string; seq: number; year: number } | { data?: { number: string; seq: number; year: number } }>(`/proformas/next-number`);
    const d = res.data as { number: string; seq: number; year: number } | { data?: { number: string; seq: number; year: number } };
    return (d as { data?: { number: string } }).data ?? (d as { number: string; seq: number; year: number });
  },
  create: async (input: ProformaInput) => {
    const res = await authAPI.post<ProformaRecord | { data?: ProformaRecord }>(`/proformas`, input);
    const d = res.data as ProformaRecord | { data?: ProformaRecord };
    return (d as { data?: ProformaRecord }).data ?? (d as ProformaRecord);
  },
  update: async (id: string, input: Partial<ProformaInput>) => {
    const res = await authAPI.put<ProformaRecord | { data?: ProformaRecord }>(`/proformas/${id}`, input);
    const d = res.data as ProformaRecord | { data?: ProformaRecord };
    return (d as { data?: ProformaRecord }).data ?? (d as ProformaRecord);
  },
  remove: async (id: string) => {
    await authAPI.delete(`/proformas/${id}`);
  },
  fromQuote: async (quoteId: string) => {
    const res = await authAPI.post<ProformaRecord | { data?: ProformaRecord }>(`/proformas/from-quote/${quoteId}`, {});
    const d = res.data as ProformaRecord | { data?: ProformaRecord };
    return (d as { data?: ProformaRecord }).data ?? (d as ProformaRecord);
  },
  sign: async (id: string, signature: { admin_signature_name: string; admin_signature_at?: string }) => {
    const res = await authAPI.put<ProformaRecord | { data?: ProformaRecord }>(`/proformas/${id}/sign`, signature);
    const d = res.data as ProformaRecord | { data?: ProformaRecord };
    return (d as { data?: ProformaRecord }).data ?? (d as ProformaRecord);
  },
};

export function defaultPaymentTerms(depositPct: number): string {
  return `Acompte de ${depositPct}% à la commande, solde à la livraison. Proforma valable 30 jours.`;
}
