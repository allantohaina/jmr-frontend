"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI, CommandeRecord, STATUTS_PRODUCTION, type UserProfile } from "@/app/lib/api";
import { TextileDocument, AdminSignaturePanel } from "@/app/components/documents";
import type { DocumentSignature, DocumentLineItem, TextileDocumentProps } from "@/app/components/documents/types";
import { PrivilegeBadge } from "@/app/components/admin/privilege-badge";
import { Loader, X, Printer } from "lucide-react";
import { AttachmentUploader } from "@/app/components/admin/attachment-uploader";

function commandeToDoc(c: CommandeRecord): Omit<TextileDocumentProps, "kind"> {
  const lines: DocumentLineItem[] = [
    {
      description: c.designation ?? "Confection textile",
      quantity: c.quantite ?? 0,
      unit: "pièce",
      unitPrice: c.prix_unitaire ?? 0,
      taxRate: 0,
      reference: c.cotation_id ? `Devis ${String(c.cotation_id).slice(0, 8)}` : "",
    },
  ];

  const clientName = [c.client_first_name, c.client_last_name].filter(Boolean).join(" ") || c.client_email || "Client";

  return {
    number: c.numero ?? `CMD-${String(c.id).slice(0, 8).toUpperCase()}`,
    issuedAt: c.date_commande ?? c.created_at ?? new Date().toISOString(),
    validUntil: c.date_livraison_prevue ?? undefined,
    client: {
      name: clientName,
      email: c.client_email,
      address: c.designation ?? undefined,
    },
    lines,
    currency: "MGA",
    status: c.statut_production,
    orderReference: c.cotation_id ?? undefined,
    deliveryAddress: c.date_livraison_prevue ? `Livraison prévue le ${c.date_livraison_prevue}` : undefined,
    notes: c.notes ?? undefined,
    paymentTerms: c.pieces_produites ? `Pièces produites : ${c.pieces_produites} / ${c.quantite}` : undefined,
    signature: c.admin_signature_name && c.admin_signature_at
      ? { name: c.admin_signature_name, signedAt: c.admin_signature_at }
      : undefined,
  };
}

export default function AdminCommandesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [commandes, setCommandes] = useState<CommandeRecord[]>([]);
  const [clientsMap, setClientsMap] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("id"));
  const [showDoc, setShowDoc] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);

  const fetchCommandes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cmdRes, clientsRes] = await Promise.all([
        authAPI.get<{ data: CommandeRecord[] }>("/commandes"),
        authAPI.get<{ data: UserProfile[] }>("/users/clients-revenue"),
      ]);
      setCommandes(Array.isArray(cmdRes.data) ? cmdRes.data : []);
      const map: Record<string, UserProfile> = {};
      ((Array.isArray(clientsRes.data) ? clientsRes.data : (clientsRes.data?.data || [])) as UserProfile[]).forEach((u: UserProfile) => {
        map[u.id] = u;
      });
      setClientsMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setCommandes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCommandes(); }, [fetchCommandes]);

  const updateStatut = async (id: string, statut: string) => {
    try {
      await authAPI.put(`/commandes/${id}`, { statut_production: statut });
      fetchCommandes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const selectCommande = (id: string | null) => {
    setSelectedId(id);
    setShowDoc(false);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("id", id);
    else params.delete("id");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleApprove = async (signature: DocumentSignature) => {
    if (!selectedCommande) return;
    setSavingSignature(true);
    try {
      await authAPI.signCommande(selectedCommande.id, signature);
      await fetchCommandes();
    } finally {
      setSavingSignature(false);
    }
  };

  const enRetard = (c: CommandeRecord) =>
    c.statut_production !== "Livrée" &&
    c.date_livraison_prevue &&
    c.date_livraison_prevue < new Date().toISOString().slice(0, 10);

  const commandesEnCours = commandes.filter((c) => c.statut_production !== "Livrée");
  const selectedCommande = commandes.find((c) => c.id === selectedId) || null;

  return (
    <div className="px-6 md:px-12 py-10 space-y-10">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="font-headline text-3xl text-[#163526]">Gestion des Commandes</h2>
          <p className="text-[#1b1c19]/40 text-xs font-bold uppercase tracking-widest mt-1">Suivi production · Atelier JMR</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/40">
            {commandesEnCours.length} en cours
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUTS_PRODUCTION.map((s) => {
          const count = commandes.filter((c) => c.statut_production === s).length;
          return (
            <div key={s} className="bg-white rounded-2xl border border-[#163526]/5 p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">{s}</p>
              <p className="text-2xl font-headline font-bold text-[#163526]">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#163526]/5">
        <div className="p-6 border-b border-[#163526]/5">
          <h3 className="font-headline text-lg text-[#163526]">Toutes les commandes</h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#1b1c19]/40">Chargement...</div>
        ) : commandes.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#1b1c19]/40 italic">Aucune commande pour le moment.</div>
        ) : (
          <div className="divide-y divide-[#163526]/5">
            {commandes.map((c) => (
              <div key={c.id} className={`transition-colors ${selectedId === c.id ? 'bg-[#faf9f4]' : 'hover:bg-[#faf9f4]/50'}`}>
                <div className="px-6 py-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-[#163526]/40">{c.numero}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${
                        c.statut_production === "Livrée" ? "bg-green-50 text-green-700 border-green-100" :
                        c.statut_production === "Prête" ? "bg-blue-50 text-blue-700 border-blue-100" :
                        enRetard(c) ? "bg-red-50 text-red-600 border-red-100" :
                        "bg-orange-50 text-orange-600 border-orange-100"
                      }`}>{c.statut_production}</span>
                      {enRetard(c) && <span className="text-[9px] text-red-500 font-bold">EN RETARD</span>}
                    </div>
                    <p className="text-sm font-bold text-[#163526] truncate">
                      {c.client_first_name || c.client_email || "Client"} — {c.designation || "Sans désignation"}
                      {c.client_id && clientsMap[c.client_id] && (
                        <PrivilegeBadge
                          isPrivileged={clientsMap[c.client_id].is_privileged}
                          cumulativeRevenue={clientsMap[c.client_id].cumulative_revenue}
                          className="ml-2"
                        />
                      )}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-[10px] text-[#163526]/40 font-medium">
                      <span>Qté: {c.quantite}</span>
                      <span>Produites: {c.pieces_produites}</span>
                      {c.date_livraison_prevue && <span>Livr. prévue: {c.date_livraison_prevue}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#163526]">{c.total.toLocaleString()} Ar</p>
                    <div className="flex gap-1 mt-2">
                      {STATUTS_PRODUCTION.map((s) => {
                        const actif = s === c.statut_production;
                        const idxActuel = STATUTS_PRODUCTION.indexOf(c.statut_production);
                        const idxCible = STATUTS_PRODUCTION.indexOf(s);
                        const bloque = idxCible > idxActuel + 1;
                        return (
                          <button
                            key={s}
                            disabled={actif || bloque}
                            onClick={() => updateStatut(c.id, s)}
                            title={`Passer à "${s}"`}
                            className={`w-2 h-2 rounded-full transition-all ${
                              actif ? "bg-[#e5ad46] scale-125" :
                              bloque ? "bg-[#163526]/10 cursor-not-allowed" :
                              "bg-[#163526]/20 hover:bg-[#e5ad46]/60 hover:scale-110"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { selectCommande(selectedId === c.id ? null : c.id); setShowDoc(false); }}
                      className="text-[9px] font-bold uppercase tracking-widest text-[#e5ad46] hover:underline"
                    >
                      {selectedId === c.id ? "Fermer" : "Détails"}
                    </button>
                    <button
                      onClick={() => { selectCommande(c.id); setShowDoc(true); }}
                      className="rounded-lg border border-[#163526]/15 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#163526] hover:border-[#e5ad46] hover:text-[#e5ad46] transition-colors"
                    >
                      Bon de commande
                    </button>
                  </div>
                </div>

                {selectedId === c.id && !showDoc && (
                  <div className="px-6 pb-5 pt-0 border-t border-[#163526]/5 bg-[#faf9f4]/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">Client</p>
                        <p className="font-medium text-[#163526]">
                          {c.client_first_name || c.client_email || "—"}
                          {c.client_id && clientsMap[c.client_id] && (
                            <PrivilegeBadge
                              isPrivileged={clientsMap[c.client_id].is_privileged}
                              cumulativeRevenue={clientsMap[c.client_id].cumulative_revenue}
                              className="ml-2"
                            />
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">Désignation</p>
                        <p className="text-[#163526]">{c.designation || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">Pièces produites</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#163526]">{c.pieces_produites}</span>
                          <span className="text-[#163526]/40">/ {c.quantite}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">Date livraison prévue</p>
                        <p className="text-[#163526]">{c.date_livraison_prevue || "—"}</p>
                      </div>
                      {c.notes && (
                        <div className="col-span-full">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/40 mb-1">Notes</p>
                          <p className="text-[#163526]/70 text-xs italic">{c.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="col-span-full mt-6 pt-6 border-t border-[#163526]/5">
                      <AttachmentUploader entityType="commande" entityId={c.id} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCommande && showDoc && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0b1320]/70 p-0 sm:p-6 backdrop-blur-sm print:static print:bg-transparent print:p-0 print:backdrop-blur-0"
          role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowDoc(false); }}
        >
          <div className="relative w-full max-w-[920px] max-h-[96vh] overflow-y-auto bg-transparent sm:rounded-2xl print:max-h-none print:overflow-visible">
            <div className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-[#163526]/95 px-4 py-3 sm:px-6 sm:py-4 backdrop-blur border-b border-[#e5ad46]/15 print:hidden">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.22em] text-[#eccc90]/45">Bon de commande</p>
                <h2 className="font-headline text-lg text-[#eccc90]">{selectedCommande.numero}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e5ad46]/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#eccc90] hover:bg-[#e5ad46]/15 transition"
                >
                  <Printer className="h-4 w-4" /> Imprimer
                </button>
                <button
                  type="button"
                  onClick={() => setShowDoc(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#eccc90]/15 text-[#eccc90]/60 hover:bg-[#eccc90]/10 hover:text-[#eccc90] transition"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-0 py-4 sm:px-2 sm:py-6 print:px-0 print:py-0">
              <TextileDocument kind="purchase_order" {...commandeToDoc(selectedCommande)} />

              <div className="px-4 sm:px-6 mt-6 print:hidden max-w-[210mm] mx-auto">
                {savingSignature ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-[#e5ad46]/30 bg-[#fffdf8] p-5 text-[#172d42]">
                    <Loader className="h-4 w-4 animate-spin text-[#e5ad46]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Enregistrement de la signature…</span>
                  </div>
                ) : (
                  <AdminSignaturePanel
                    initialSignature={
                      selectedCommande.admin_signature_name && selectedCommande.admin_signature_at
                        ? { name: selectedCommande.admin_signature_name, signedAt: selectedCommande.admin_signature_at }
                        : undefined
                    }
                    onApprove={handleApprove}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
