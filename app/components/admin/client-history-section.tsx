"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, FileText, ShoppingCart, DollarSign } from "lucide-react";
import { authAPI } from "@/app/lib";

type Client = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
};

type Demande = {
  id: string;
  nom_client: string;
  description: string;
  statut: string;
  date_reception: string;
};

type Quote = {
  id: string;
  name?: string;
  status: string;
  amount?: number;
  created_at: string;
};

type Commande = {
  id: string;
  client_id?: string;
  numero: string;
  designation?: string;
  statut_production: string;
  total: number;
  date_commande: string;
};

type Notice = { tone: "success" | "danger"; message: string } | null;

export function ClientHistorySection({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<Client | null>(null);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [caCumule, setCaCumule] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  const fetchClientData = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Récupérer les infos client
      const clientRes = await authAPI.get<{ data: Client }>(`/users/${clientId}`);
      setClient(clientRes.data?.data || null);

      // Récupérer les demandes du client
      const demandesRes = await authAPI.get<{ data: Demande[] }>("/demandes-client");
      const clientDemandes = (demandesRes.data?.data || []).filter((d: Demande) => 
        d.nom_client.toLowerCase().includes(clientRes.data?.data?.first_name?.toLowerCase() || "")
      );
      setDemandes(clientDemandes);

      // Récupérer les quotes du client
      const quotesRes = await authAPI.get<{ data: Quote[] }>("/quotes");
      const clientQuotes = (quotesRes.data?.data || []).filter((q: Quote) => 
        q.name?.toLowerCase().includes(clientRes.data?.data?.first_name?.toLowerCase() || "")
      );
      setQuotes(clientQuotes);

      // Récupérer les commandes du client
      const commandesRes = await authAPI.get<{ data: Commande[] }>("/commandes");
      const clientCommandes = (commandesRes.data?.data || []).filter((c: Commande) => 
        c.client_id === clientId
      );
      setCommandes(clientCommandes);

      // Calculer le CA cumulé (commandes livrées)
      const ca = clientCommandes
        .filter(c => c.statut_production === "Livrée")
        .reduce((sum, c) => sum + (c.total || 0), 0);
      setCaCumule(ca);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchClientData(); }, [clientId]);

  const handleCreateDemande = () => {
    if (!client) return;
    const params = new URLSearchParams({
      nom_client: `${client.first_name || ""} ${client.last_name || ""}`.trim(),
      email: client.email || "",
      telephone: client.phone || "",
    });
    window.location.href = `/backoffice/demandes?${params.toString()}`;
  };

  const handleCreateQuote = () => {
    if (!client) return;
    const params = new URLSearchParams({
      client_id: clientId,
      name: `${client.first_name || ""} ${client.last_name || ""}`.trim(),
      email: client.email || "",
      phone: client.phone || "",
    });
    window.location.href = `/backoffice/devis/nouvelle?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="px-4 md:px-12 py-8 md:py-10">
        <div className="flex items-center justify-center rounded-2xl border border-[#163526]/5 bg-white py-16">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-[#163526]/50" />
          Chargement...
        </div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="px-4 md:px-12 py-8 md:py-10">
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 py-8 md:py-10 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl text-[#163526]">Historique Client</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b1c19]/40 mt-1">
            {client?.first_name} {client?.last_name}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateDemande}
            className="px-4 py-2 bg-[#163526] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#163526]/90 transition-all"
          >
            + Demande
          </button>
          <button
            onClick={handleCreateQuote}
            className="px-4 py-2 border border-[#163526]/10 text-[#163526] font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#163526]/5 transition-all"
          >
            + Cotation
          </button>
        </div>
      </div>

      {notice && (
        <div className={`p-4 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-3 ${
          notice.tone === "success" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
        }`}>
          <span className="material-symbols-outlined text-sm">{notice.tone === "success" ? "check_circle" : "error"}</span>
          {notice.message}
        </div>
      )}

      {/* Info Client */}
      {client && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#163526]/5 shadow-sm">
          <h3 className="font-headline text-xl text-[#163526] mb-4">Informations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">Email</p>
              <p className="text-sm font-bold text-[#163526]">{client.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">Téléphone</p>
              <p className="text-sm font-bold text-[#163526]">{client.phone || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">Chiffre d&apos;affaires cumulé</p>
              <p className="text-sm font-bold text-[#163526]">{caCumule.toLocaleString()} Ar</p>
            </div>
          </div>
        </div>
      )}

      {/* Demandes */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#163526]/5 shadow-sm">
        <h3 className="font-headline text-xl text-[#163526] mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-500" />
          Demandes ({demandes.length})
        </h3>
        {demandes.length === 0 ? (
          <p className="text-sm italic text-[#1b1c19]/40">Aucune demande</p>
        ) : (
          <div className="space-y-3">
            {demandes.map(d => (
              <div key={d.id} className="p-4 bg-[#faf9f4] rounded-xl border border-[#163526]/5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#163526]">{d.description}</p>
                    <p className="text-[10px] text-[#1b1c19]/40 mt-1">{new Date(d.date_reception).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[9px] font-bold uppercase rounded-full">{d.statut}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cotations */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#163526]/5 shadow-sm">
        <h3 className="font-headline text-xl text-[#163526] mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-orange-500" />
          Cotations ({quotes.length})
        </h3>
        {quotes.length === 0 ? (
          <p className="text-sm italic text-[#1b1c19]/40">Aucune cotation</p>
        ) : (
          <div className="space-y-3">
            {quotes.map(q => (
              <div key={q.id} className="p-4 bg-[#faf9f4] rounded-xl border border-[#163526]/5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#163526]">{q.name || "Sans nom"}</p>
                    <p className="text-[10px] text-[#1b1c19]/40 mt-1">{new Date(q.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-orange-50 text-orange-700 text-[9px] font-bold uppercase rounded-full">{q.status}</span>
                    {q.amount && <p className="text-sm font-bold text-[#163526] mt-1">{q.amount.toLocaleString()} Ar</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commandes */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#163526]/5 shadow-sm">
        <h3 className="font-headline text-xl text-[#163526] mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-orange-500" />
          Commandes ({commandes.length})
        </h3>
        {commandes.length === 0 ? (
          <p className="text-sm italic text-[#1b1c19]/40">Aucune commande</p>
        ) : (
          <div className="space-y-3">
            {commandes.map(c => (
              <div key={c.id} className="p-4 bg-[#faf9f4] rounded-xl border border-[#163526]/5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#163526]">{c.numero}</p>
                    <p className="text-[10px] text-[#1b1c19]/40">{c.designation || "Sans désignation"}</p>
                    <p className="text-[10px] text-[#1b1c19]/40 mt-1">{new Date(c.date_commande).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-[9px] font-bold uppercase rounded-full">{c.statut_production}</span>
                    <p className="text-sm font-bold text-[#163526] mt-1">{c.total.toLocaleString()} Ar</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
