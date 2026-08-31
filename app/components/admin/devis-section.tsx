"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronRight,
  FileText,
  Loader2,
  Trash2,
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  FilePenLine,
} from "lucide-react";
import { authAPI, type QuoteRecord } from "@/app/lib";

type TabKey =
  | "all"
  | "received"
  | "sent"
  | "accepted"
  | "rejected"
  | "draft"
  | "expired";

type TabDef = {
  key: TabKey;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  match: (q: QuoteRecord) => boolean;
  countKey?: keyof QuoteCounts;
};

type QuoteCounts = Record<string, number> & {
  draft?: number;
  needs_info?: number;
  sent?: number;
  accepted?: number;
  rejected?: number;
  expired?: number;
  pending?: number;
};

const TABS: TabDef[] = [
  {
    key: "received",
    label: "Reçues",
    subtitle: "En cours d'étude",
    icon: Inbox,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    match: (q) =>
      q.status === "pending" ||
      q.status === "needs_info" ||
      !q.status,
  },
  {
    key: "sent",
    label: "Envoyées",
    subtitle: "En attente client",
    icon: Send,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    match: (q) => q.status === "sent",
  },
  {
    key: "accepted",
    label: "Validées",
    subtitle: "Devis acceptés",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
    match: (q) => q.status === "accepted",
  },
  {
    key: "rejected",
    label: "Refusées",
    subtitle: "Demande non retenue",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-100",
    match: (q) => q.status === "rejected",
  },
  {
    key: "draft",
    label: "Brouillons",
    subtitle: "Non envoyés",
    icon: FilePenLine,
    color: "text-[#eccc90]/60",
    bg: "bg-[#25303a] border-[#e5ad46]/10",
    match: (q) => q.status === "draft",
  },
  {
    key: "expired",
    label: "Expirées",
    subtitle: "Délai dépassé",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-100",
    match: (q) => q.status === "expired",
  },
];

function formatQuoteStatusLabel(status?: string | null) {
  switch (status) {
    case "draft":
      return "Brouillon";
    case "sent":
      return "Envoyé";
    case "accepted":
      return "Accepté";
    case "production":
      return "Production";
    case "rejected":
      return "Refusé";
    case "needs_info":
      return "Infos requises";
    case "pending":
      return "Reçu";
    case "expired":
      return "Expiré";
    default:
      return status ?? "Nouveau";
  }
}

function statusBadgeClass(status?: string | null): string {
  switch (status) {
    case "draft":
      return "bg-[#25303a] text-[#eccc90]/70 border-[#e5ad46]/10 border";
    case "sent":
      return "bg-amber-50 text-amber-700 border-amber-200 border";
    case "accepted":
      return "bg-green-50 text-green-700 border-green-200 border";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200 border";
    case "needs_info":
      return "bg-purple-50 text-purple-700 border-purple-200 border";
    case "pending":
      return "bg-blue-50 text-blue-700 border-blue-200 border";
    case "expired":
      return "bg-orange-50 text-orange-700 border-orange-200 border";
    default:
      return "bg-[#e5ad46]/10 text-[#eccc90] border-[#e5ad46]/10 border";
  }
}

export function DevisSection() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [counts, setCounts] = useState<QuoteCounts>({});
  const [activeTab, setActiveTab] = useState<TabKey>("received");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [convertingId, setConvertingId] = useState<string | number | null>(null);
  const [convertMsg, setConvertMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const totalCount = quotes.length;
  const tabCounts: Record<TabKey, number> = useMemo(() => {
    const result: Record<TabKey, number> = {
      all: totalCount,
      received: 0,
      sent: 0,
      accepted: 0,
      rejected: 0,
      draft: 0,
      expired: 0,
    };
    for (const tab of TABS) {
      result[tab.key] = quotes.filter((q) => tab.match(q)).length;
    }
    result.all = totalCount;
    return result;
  }, [quotes, totalCount]);

  const displayedQuotes = useMemo(() => {
    if (activeTab === "all") return quotes;
    const tab = TABS.find((t) => t.key === activeTab);
    if (!tab) return quotes;
    return quotes.filter((q) => tab.match(q));
  }, [quotes, activeTab]);

  const convertToCommande = async (quote: QuoteRecord) => {
    setConvertingId(quote.id);
    setError("");
    setConvertMsg(null);
    try {
      const res = await authAPI.post<{ data: { id: string; numero: string } }>(
        `/quotes/${quote.id}/convert-to-commande`,
        { client_id: quote.client_id ?? undefined }
      );
      setConvertMsg(`Commande créée : ${res.data?.data?.numero || "OK"}.`);
    } catch (convertError) {
      setError(
        convertError instanceof Error && convertError.message
          ? convertError.message
          : "Impossible de convertir ce devis."
      );
    } finally {
      setConvertingId(null);
    }
  };

  const deleteDraft = async (quote: QuoteRecord) => {
    if ((quote.status ?? "") !== "draft") return;
    const ok = window.confirm(
      `Supprimer le brouillon "${quote.titre || quote.name || quote.id}" ? Cette action est irréversible.`
    );
    if (!ok) return;
    setDeletingId(quote.id);
    setError("");
    try {
      await authAPI.delete<{ message?: string }>(`/quotes/${quote.id}`);
      setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression."
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    let active = true;

    async function fetchQuotes() {
      setIsLoading(true);
      setError("");

      try {
        const response = await authAPI.get<
          | QuoteRecord[]
          | {
              data?: QuoteRecord[];
              counts?: QuoteCounts;
              total?: number;
            }
        >("/quotes");

        if (!active) return;

        if (Array.isArray(response.data)) {
          setQuotes(response.data);
        } else {
          setQuotes(response.data?.data ?? []);
          if (response.data?.counts) setCounts(response.data.counts);
        }
      } catch (fetchError) {
        if (active) {
          setError(
            fetchError instanceof Error && fetchError.message
              ? fetchError.message
              : "Impossible de charger les demandes de devis."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void fetchQuotes();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline text-2xl text-[#e5ad46] sm:text-3xl">
            Cotations &amp; Devis
          </h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#eccc90]/40">
            {totalCount} demande{totalCount > 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      ) : null}

      {convertMsg ? (
        <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm text-green-700">
          {convertMsg}
        </div>
      ) : null}

      {/* Onglets + compteurs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const c = tabCounts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-left rounded-2xl border px-4 py-4 transition-all ${
                isActive
                  ? `${tab.bg} ${tab.color} shadow-sm`
                  : "bg-[#25303a] border-[#e5ad46]/10 text-[#eccc90]/60 hover:bg-[#25303a]/80 hover:border-[#e5ad46]/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? tab.color : "text-[#eccc90]/30"
                  }`}
                />
                <span
                  className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${
                    isActive ? `${tab.bg} ${tab.color}` : "bg-[#1e2a38] text-[#eccc90]/60"
                  }`}
                >
                  {c}
                </span>
              </div>
              <p
                className={`mt-3 text-[11px] font-bold uppercase tracking-widest ${
                  isActive ? tab.color : "text-[#eccc90]/70"
                }`}
              >
                {tab.label}
              </p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-[#eccc90]/30">
                {tab.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-[2rem] border border-[#e5ad46]/10 bg-[#25303a] py-10 md:py-16 text-[#eccc90]/50">
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          Chargement des devis...
        </div>
      ) : (
        <>
          {/* Mobile: cartes */}
          <div className="grid gap-4 md:hidden">
            {displayedQuotes.length > 0 ? (
              displayedQuotes.map((quote) => (
                <article
                  key={quote.id}
                  className="rounded-2xl border border-[#e5ad46]/10 bg-[#25303a] p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#eccc90]">
                        {quote.titre || quote.name || "—"}
                      </p>
                      <p className="truncate text-xs text-[#eccc90]/60">
                        {quote.email || "—"}
                      </p>
                      <p className="truncate text-[10px] text-[#eccc90]/40">
                        {quote.phone || "—"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${statusBadgeClass(
                        quote.status
                      )}`}
                    >
                      {formatQuoteStatusLabel(quote.status)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-6 text-[#eccc90]/60">
                    {quote.message || "—"}
                  </p>
                  {typeof quote.amount === "number" ||
                  (typeof quote.amount === "string" && quote.amount !== "") ? (
                    <p className="mt-3 text-sm font-bold text-[#e5ad46]">
                      {Number(quote.amount).toLocaleString()} Ar
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/backoffice/devis/edit?id=${quote.id}`}
                      className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-orange-500"
                    >
                      Gérer <ChevronRight className="h-4 w-4" />
                    </Link>
                    {quote.status === "accepted" && (
                      <button
                        onClick={() => convertToCommande(quote)}
                        disabled={convertingId === quote.id}
                        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#eccc90] hover:text-[#e5ad46] disabled:opacity-50"
                      >
                        {convertingId === quote.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : null}
                        Convertir en commande
                      </button>
                    )}
                    {quote.status === "draft" && (
                      <button
                        onClick={() => deleteDraft(quote)}
                        disabled={deletingId === quote.id}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#e5ad46]/10 bg-[#25303a] p-8 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-[#eccc90]/20" />
                <p className="text-sm italic text-[#eccc90]/40">
                  Aucun devis dans cette section.
                </p>
              </div>
            )}
          </div>

          {/* Desktop: tableau */}
          <div className="hidden overflow-hidden rounded-[2rem] border border-[#e5ad46]/10 bg-[#25303a] shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#e5ad46]/10 bg-[#1e2a38]">
                    <th className="px-8 py-6 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/40">
                      Client
                    </th>
                    <th className="px-8 py-6 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/40">
                      Contact
                    </th>
                    <th className="px-8 py-6 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/40">
                      Objet
                    </th>
                    <th className="px-8 py-6 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/40">
                      Montant
                    </th>
                    <th className="px-8 py-6 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/40">
                      Statut
                    </th>
                    <th className="px-8 py-6 text-right font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#eccc90]/40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5ad46]/10">
                  {displayedQuotes.length > 0 ? (
                    displayedQuotes.map((quote) => (
                      <tr
                        key={quote.id}
                        className="group transition-colors hover:bg-[#1e2a38]/50"
                      >
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-[#eccc90]">
                            {quote.titre || quote.name || "—"}
                          </p>
                          {quote.created_at ? (
                            <p className="text-[10px] text-[#eccc90]/40 mt-0.5">
                              Créé le{" "}
                              {new Date(
                                quote.created_at
                              ).toLocaleDateString("fr-FR")}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs text-[#eccc90]">
                            {quote.email || "—"}
                          </p>
                          <p className="text-[10px] text-[#eccc90]/40">
                            {quote.phone || "—"}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="line-clamp-1 max-w-xs text-xs text-[#eccc90]/60">
                            {quote.message ||
                              (quote.category
                                ? `Catégorie: ${quote.category}`
                                : "—")}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          {typeof quote.amount === "number" ||
                          (typeof quote.amount === "string" &&
                            quote.amount !== "") ? (
                            <p className="text-sm font-bold text-[#e5ad46]">
                              {Number(quote.amount).toLocaleString()} Ar
                            </p>
                          ) : (
                            <span className="text-[10px] text-[#eccc90]/30">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <span
                            className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${statusBadgeClass(
                              quote.status
                            )}`}
                          >
                            {formatQuoteStatusLabel(quote.status)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-4">
                            {quote.status === "accepted" && (
                              <button
                                onClick={() => convertToCommande(quote)}
                                disabled={convertingId === quote.id}
                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#eccc90] hover:text-[#e5ad46] disabled:opacity-50"
                              >
                                {convertingId === quote.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                Convertir
                              </button>
                            )}
                            {quote.status === "draft" && (
                              <button
                                onClick={() => deleteDraft(quote)}
                                disabled={deletingId === quote.id}
                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 disabled:opacity-50"
                                title="Supprimer le brouillon"
                              >
                                {deletingId === quote.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                            <Link
                              href={`/backoffice/devis/edit?id=${quote.id}`}
                              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] hover:text-[#eccc90]"
                            >
                              Gérer
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-8 py-12 text-center"
                        colSpan={6}
                      >
                        <FileText className="mx-auto mb-3 h-8 w-8 text-[#eccc90]/20" />
                        <p className="font-body text-sm italic text-[#eccc90]/40">
                          Aucun devis dans la section sélectionnée.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
